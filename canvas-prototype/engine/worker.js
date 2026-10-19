/* OpenSysML Go runs here: semantic requests never block the canvas thread. */
let engineReady;

async function initialize({ assetBase, assetVersion }) {
  if (engineReady) return engineReady;
  engineReady = (async () => {
    const base = new URL(assetBase);
    const asset=name=>{const url=new URL(name,base);if(assetVersion)url.searchParams.set('v',assetVersion);return url.href;};
    importScripts(asset('wasm_exec.js'));
    const go = new Go();
    const response = await fetch(asset('sysml-wasm.wasm'));
    if (!response.ok) throw new Error(`Cannot load semantic engine: HTTP ${response.status}`);
    // ArrayBuffer also works on static hosts that do not serve application/wasm.
    const { instance } = await WebAssembly.instantiate(await response.arrayBuffer(), go.importObject);
    let engineFailure;
    go.run(instance).catch(error => { engineFailure = error; });
    const deadline = Date.now() + 60000;
    while (!globalThis.sysmlWasm) {
      if (engineFailure) throw engineFailure;
      if (Date.now() > deadline) throw new Error('Semantic engine initialization timed out');
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    return invoke('GetServerInfo', {});
  })();
  return engineReady;
}

function invoke(method, params) {
  const envelope = JSON.parse(globalThis.sysmlWasm.call(method, JSON.stringify(params)));
  if (envelope.error) {
    const error = new Error(envelope.error.message);
    error.code = envelope.error.code;
    throw error;
  }
  return envelope.result;
}

self.onmessage = async ({ data }) => {
  try {
    let result;
    if (data.method === 'Initialize') result = await initialize(data.params);
    else {
      if (!engineReady) throw new Error('Initialize the semantic engine before making calls');
      await engineReady;
      result = invoke(data.method, data.params || {});
    }
    self.postMessage({ id: data.id, result });
  } catch (error) {
    self.postMessage({ id: data.id, error: { message: error.message, code: error.code } });
  }
};
