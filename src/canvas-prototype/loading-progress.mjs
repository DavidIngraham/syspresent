/** Presentation-only loading feedback; tokens belong to the caller's load lifecycle. */
export function createLoadingProgress(document, {
  delayMs = 150, longRunningMs = 10000, clock = () => document.defaultView.performance?.now?.() ?? Date.now(),
  schedule = (callback, delay) => document.defaultView.setTimeout(callback, delay),
  unschedule = id => document.defaultView.clearTimeout(id)
} = {}) {
  const element = id => document.getElementById(id);
  const host = element('loading'), title = element('loading-title'), phase = element('loading-phase');
  const bar = element('loading-progress'), detail = element('loading-detail'), count = element('loading-count');
  const elapsed = element('loading-elapsed'), errorText = element('loading-error');
  const retry = element('loading-retry'), cancelButton = element('loading-cancel');
  if ([host, title, phase, bar, detail, count, elapsed, errorText, retry, cancelButton].some(item => !item)) throw Error('Loading feedback markup is incomplete');
  const placeholder = document.createComment('loading feedback home');
  host.before(placeholder);
  let current = null, showTimer, elapsedTimer, disposed = false;
  const accepts = token => !disposed && current !== null && Object.is(current.token, token);
  const clearTimers = () => {
    if (showTimer !== undefined) unschedule(showTimer);
    if (elapsedTimer !== undefined) unschedule(elapsedTimer);
    showTimer = elapsedTimer = undefined;
  };
  const restoreHome = () => {
    if (placeholder.parentNode && host.previousSibling !== placeholder) placeholder.after(host);
  };
  const place = () => {
    if (!current) return restoreHome();
    const dialogs = [...document.querySelectorAll('dialog[open]')];
    const target = dialogs.at(-1);
    if (target && !host.contains(target)) {
      if (host.parentNode !== target) target.append(host);
    } else restoreHome();
  };
  const observer = document.defaultView.MutationObserver ? new document.defaultView.MutationObserver(place) : null;
  for (const dialog of document.querySelectorAll('dialog')) observer?.observe(dialog, {attributes: true, attributeFilter: ['open']});
  const closed = () => place();
  document.addEventListener('close', closed, true);
  const reveal = token => { if (accepts(token)) { place(); host.hidden = false; } };
  function scheduleElapsed(token) {
    if (elapsedTimer !== undefined) unschedule(elapsedTimer);
    if (!accepts(token) || current.state !== 'loading') return;
    const elapsedMs = Math.max(0, clock() - current.stageStarted);
    if (elapsedMs >= longRunningMs) {
      elapsed.textContent = `This stage is still running (${Math.floor(elapsedMs / 1000)} seconds).`;
      elapsed.hidden = false;
    } else {
      elapsed.hidden = true;
      elapsed.textContent = '';
    }
    elapsedTimer = schedule(() => scheduleElapsed(token), elapsedMs < longRunningMs ? Math.max(1, longRunningMs - elapsedMs) : 1000);
  }
  function stageProgress(event) {
    bar.hidden = false;
    const measured = Number.isFinite(event.completed) && event.completed >= 0 && Number.isFinite(event.total) && event.total > 0 && event.completed <= event.total;
    if (measured) {
      bar.max = event.total;
      bar.value = event.completed;
      const unit = event.unit || 'items';
      const format = value => unit === 'bytes' ? formatBytes(value) : String(value);
      count.textContent = unit === 'bytes' ? `${format(event.completed)} of ${format(event.total)}` : `${format(event.completed)} of ${format(event.total)} ${unit}`;
      count.hidden = false;
      bar.setAttribute('aria-valuetext', count.textContent);
    } else {
      bar.removeAttribute('value');
      bar.removeAttribute('aria-valuetext');
      count.hidden = true;
      count.textContent = '';
      if (Number.isFinite(event.completed) && event.completed >= 0) {
        count.textContent = event.unit === 'bytes' ? `${formatBytes(event.completed)} received; total size unavailable` : `${event.completed} ${event.unit || 'items'} completed; total work unavailable`;
        count.hidden = false;
      }
    }
    bar.setAttribute('aria-label', `${phase.textContent || 'Loading'} — current stage`);
  }
  function begin(token, options = {}) {
    if (disposed) return false;
    clearTimers();
    current = {token, state: 'loading', stage: options.stage || 'opening', stageStarted: clock(), started: clock(), options, retrying: false};
    host.hidden = true;
    host.dataset.state = 'loading';
    host.setAttribute('aria-busy', 'true');
    title.textContent = 'Opening model';
    phase.textContent = options.label || 'Preparing the model…';
    detail.textContent = options.detail || '';
    detail.hidden = !detail.textContent;
    elapsed.hidden = true;
    errorText.hidden = true;
    errorText.textContent = '';
    retry.hidden = true;
    retry.disabled = false;
    cancelButton.hidden = typeof options.onCancel !== 'function';
    cancelButton.disabled = false;
    cancelButton.textContent = 'Cancel loading';
    stageProgress({});
    place();
    showTimer = schedule(() => reveal(token), Math.max(0, delayMs));
    scheduleElapsed(token);
    return true;
  }
  function update(token, event = {}) {
    if (!accepts(token) || current.state !== 'loading') return false;
    if (event.stage && event.stage !== current.stage) {
      current.stage = event.stage;
      current.stageStarted = clock();
    }
    if (event.label) phase.textContent = event.label;
    detail.textContent = event.detail || '';
    detail.hidden = !detail.textContent;
    stageProgress(event);
    scheduleElapsed(token);
    if (clock() - current.started >= delayMs) reveal(token);
    return true;
  }
  function finish(token) {
    if (!accepts(token)) return false;
    clearTimers();
    current = null;
    host.hidden = true;
    host.dataset.state = 'idle';
    host.setAttribute('aria-busy', 'false');
    bar.removeAttribute('value');
    bar.removeAttribute('aria-valuetext');
    restoreHome();
    return true;
  }
  function fail(token, error) {
    if (!accepts(token)) return false;
    clearTimers();
    current.state = 'error';
    current.retrying = false;
    host.dataset.state = 'error';
    host.setAttribute('aria-busy', 'false');
    title.textContent = 'Model could not be opened';
    phase.textContent = 'Loading stopped';
    bar.hidden = true;
    bar.removeAttribute('value');
    bar.removeAttribute('aria-valuetext');
    count.hidden = detail.hidden = elapsed.hidden = true;
    errorText.textContent = error?.message || String(error || 'The model could not be loaded.');
    errorText.hidden = false;
    retry.hidden = typeof current.options.onRetry !== 'function';
    retry.disabled = false;
    cancelButton.hidden = typeof current.options.onCancel !== 'function';
    cancelButton.disabled = false;
    cancelButton.textContent = 'Close loading message';
    reveal(token);
    return true;
  }
  const retryClicked = () => {
    const operation = current;
    if (!operation || operation.state !== 'error' || operation.retrying || typeof operation.options.onRetry !== 'function') return;
    operation.retrying = true;
    retry.disabled = true;
    Promise.resolve().then(() => current === operation ? operation.options.onRetry(operation.token) : undefined).catch(error => {
      if (current === operation) fail(operation.token, error);
    });
  };
  const cancelClicked = () => {
    const operation = current;
    if (!operation || cancelButton.disabled || typeof operation.options.onCancel !== 'function') return;
    cancelButton.disabled = true;
    finish(operation.token);
    operation.options.onCancel(operation.token);
  };
  retry.addEventListener('click', retryClicked);
  cancelButton.addEventListener('click', cancelClicked);
  return {
    begin, update, finish, fail, cancel: finish,
    get token() { return current?.token; },
    dispose() {
      if (disposed) return;
      if (current) finish(current.token);
      disposed = true;
      clearTimers();
      observer?.disconnect();
      document.removeEventListener('close', closed, true);
      retry.removeEventListener('click', retryClicked);
      cancelButton.removeEventListener('click', cancelClicked);
      restoreHome();
      placeholder.remove();
    }
  };
}
function formatBytes(value) {
  if (value < 1024) return `${Math.floor(value)} B`;
  const divisor = value < 1024 * 1024 ? 1024 : 1024 * 1024;
  return `${(value / divisor).toFixed(1)} ${divisor === 1024 ? 'KiB' : 'MiB'}`;
}
/** Allow a visible frame before main-thread work; remain usable in hidden tabs. */
export function yieldLoadingPaint({window = globalThis.window || globalThis} = {}) {
  return new Promise(resolve => {
    if (typeof window.requestAnimationFrame !== 'function') return window.setTimeout(resolve, 0);
    let done = false, firstFrame, secondFrame;
    const complete = () => {
      if (done) return;
      done = true;
      window.clearTimeout(fallback);
      if (firstFrame !== undefined) window.cancelAnimationFrame?.(firstFrame);
      if (secondFrame !== undefined) window.cancelAnimationFrame?.(secondFrame);
      resolve();
    };
    const fallback = window.setTimeout(complete, 100);
    firstFrame = window.requestAnimationFrame(() => { secondFrame = window.requestAnimationFrame(complete); });
  });
}
