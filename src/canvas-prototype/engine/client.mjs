/** Start the OpenSysML semantic engine in an isolated browser worker. */
export function createSemanticEngine({ assetBase, assetVersion, workerURL = new URL('./worker.js', import.meta.url), WorkerClass = globalThis.Worker, onProgress } = {}) {
  if (!assetBase) throw new TypeError('assetBase must locate the pinned Go/WASM engine assets');
  let worker, startError;
  try { worker = new WorkerClass(workerURL); }
  catch (error) { startError = new Error('Cannot start semantic engine worker: '+error.message); }
  const pending = new Map();
  let sequence = 0;
  let closed = Boolean(startError);
  function request(method, params) {
    if (closed) return Promise.reject(new Error('Semantic engine has been terminated'));
    const id = ++sequence;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject, method });
      try { worker.postMessage({ id, method, params }); }
      catch (error) { pending.delete(id); reject(error); if (method === 'Initialize') close(error); }
    });
  }
  function rejectAll(error) {
    for (const job of pending.values()) job.reject(error);
    pending.clear();
  }
  function close(error) {
    if (closed) return;
    closed = true;
    rejectAll(error);
    worker.terminate();
  }
  if (worker) worker.onmessage = ({ data }) => {
    if (closed) return;
    const job = pending.get(data.id);
    if (!job) return;
    if (data.progress) {
      // A display observer must not settle or interrupt a semantic request.
      try { onProgress?.({ ...data.progress, requestId: data.id, method: job.method }); } catch {}
      return;
    }
    pending.delete(data.id);
    if (data.error) {
      const error = new Error(data.error.message);
      error.code = data.error.code;
      job.reject(error);
      if (job.method === 'Initialize' || error.code === 'NATIVE_NO_RESPONSE') close(error);
    } else job.resolve(data.result);
  };
  if (worker) worker.onerror = event => close(new Error(event.message || 'Semantic engine worker failed'));
  if (worker) worker.onmessageerror = () => close(new Error('Cannot read a response from the semantic engine worker. Retry loading the project.'));
  const base = new URL(assetBase, globalThis.location?.href || import.meta.url).href;
  const ready = startError ? Promise.reject(startError) : request('Initialize', { assetBase: base, assetVersion });
  return {
    ready,
    get closed() { return closed; },
    async call(method, params = {}) {
      await ready;
      return request(method, params);
    },
    terminate() { close(new Error('Semantic engine has been terminated')); }
  };
}
