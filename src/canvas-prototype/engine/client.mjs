/** Start the OpenSysML semantic engine in an isolated browser worker. */
export function createSemanticEngine({ assetBase, assetVersion, workerURL = new URL('./worker.js', import.meta.url), WorkerClass = globalThis.Worker } = {}) {
  if (!assetBase) throw new TypeError('assetBase must locate the pinned Go/WASM engine assets');
  const worker = new WorkerClass(workerURL);
  const pending = new Map();
  let sequence = 0;
  let closed = false;
  function request(method, params) {
    if (closed) return Promise.reject(new Error('Semantic engine has been terminated'));
    const id = ++sequence;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      worker.postMessage({ id, method, params });
    });
  }
  function rejectAll(error) {
    for (const job of pending.values()) job.reject(error);
    pending.clear();
  }
  worker.onmessage = ({ data }) => {
    const job = pending.get(data.id);
    if (!job) return;
    pending.delete(data.id);
    if (data.error) {
      const error = new Error(data.error.message);
      error.code = data.error.code;
      job.reject(error);
    } else job.resolve(data.result);
  };
  worker.onerror = event => {
    closed = true;
    rejectAll(new Error(event.message || 'Semantic engine worker failed'));
    worker.terminate();
  };
  const base = new URL(assetBase, globalThis.location?.href || import.meta.url).href;
  const ready = request('Initialize', { assetBase: base, assetVersion });
  return {
    ready,
    async call(method, params = {}) {
      await ready;
      return request(method, params);
    },
    terminate() {
      closed = true;
      worker.terminate();
      rejectAll(new Error('Semantic engine has been terminated'));
    }
  };
}
