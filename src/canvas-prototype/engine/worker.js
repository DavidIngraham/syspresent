/* OpenSysML Go runs here: semantic requests never block the canvas thread. */
let engineReady, invocationFailure;

/** Content-Length describes encoded bytes when the browser decompresses a body. */
function decodedLength(response) {
  if (response.headers.get('content-encoding')) return undefined;
  const header = response.headers.get('content-length');
  const length = header && Number(header);
  return Number.isSafeInteger(length) && length > 0 ? length : undefined;
}

async function instantiateEngine(response, imports, progress) {
  let total = decodedLength(response), lastBytes = 0, lastAt = 0;
  const download = (completed,force=false) => {
    if (total !== undefined && completed > total) total = undefined;
    const now = Date.now();
    if (!force && completed !== 0 && completed-lastBytes < 262144 && now-lastAt < 100) return;
    lastBytes=completed;lastAt=now;
    progress({stage:'engine-download',label:'Downloading and compiling semantic engine',completed,...(total === undefined ? {} : {total}),unit:'bytes'});
  };
  download(0);
  if (typeof WebAssembly.instantiateStreaming === 'function' && response.body?.getReader && typeof ReadableStream === 'function') {
    const reader = response.body.getReader();
    let received = 0;
    const body = new ReadableStream({
      async pull(controller) {
        try {
          const {done,value} = await reader.read();
          if (done) {
            download(received,true);
            progress({stage:'engine-compile',label:'Finishing semantic engine compilation'});
            controller.close();
          } else {
            received += value.byteLength;
            download(received);
            controller.enqueue(value);
          }
        } catch (error) { controller.error(error); }
      },
      cancel(reason) { return reader.cancel(reason); }
    });
    // Preserve streaming compilation on static hosts with an incorrect WASM MIME.
    // The stream is already decoded, so encoded length/encoding headers are omitted.
    return WebAssembly.instantiateStreaming(new Response(body,{headers:{'Content-Type':'application/wasm'}}),imports);
  }
  const bytes = await response.arrayBuffer();
  download(bytes.byteLength,true);
  progress({stage:'engine-compile',label:'Compiling semantic engine'});
  return WebAssembly.instantiate(bytes,imports);
}

async function initialize({ assetBase, assetVersion }, progress = () => {}) {
  if (engineReady) return engineReady;
  engineReady = (async () => {
    const base = new URL(assetBase);
    const asset=name=>{const url=new URL(name,base);if(assetVersion)url.searchParams.set('v',assetVersion);return url.href;};
    progress({stage:'engine-runtime',label:'Loading semantic engine runtime'});
    try { importScripts(asset('wasm_exec.js')); }
    catch (error) { throw new Error('Cannot load semantic runtime script: '+error.message); }
    const go = new Go();
    let response;
    progress({stage:'engine-download',label:'Downloading semantic engine',completed:0,unit:'bytes'});
    try { response = await fetch(asset('sysml-wasm.wasm')); }
    catch (error) { throw new Error('Cannot download semantic engine: '+error.message); }
    if (!response.ok) throw new Error(`Cannot load semantic engine: HTTP ${response.status}`);
    const { instance } = await instantiateEngine(response,go.importObject,progress);
    progress({stage:'engine-start',label:'Starting native semantic engine'});
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
  if (invocationFailure) throw invocationFailure;
  const raw = globalThis.sysmlWasm.call(method, JSON.stringify(params));
  if (typeof raw !== 'string') {
    invocationFailure = new Error('The native semantic engine returned no response for ' + method + '. This worker is no longer usable; reload the app before trying again.');
    invocationFailure.code = 'NATIVE_NO_RESPONSE';
    throw invocationFailure;
  }
  const envelope = JSON.parse(raw);
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
    if (data.method === 'Initialize') result = await initialize(data.params,progress=>self.postMessage({id:data.id,progress}));
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
