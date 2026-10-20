/** Switch between entry and viewer surfaces without changing project state. */
export function showLanding(document, visible) {
  const isLanding = Boolean(visible);
  for (const id of ['viewer-header', 'stage', 'viewer-footer']) {
    const element = document.getElementById(id);
    if (element) element.hidden = isLanding;
  }
  const landing = document.getElementById('landing');
  if (landing) landing.hidden = !isLanding;
  document.body.classList.toggle('landing-mode', isLanding);
}
