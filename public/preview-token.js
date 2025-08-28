(() => {
  const script = document.currentScript;
  const pattern = script?.dataset.previewHostPattern;
  if (!pattern) return;
  const hostPattern = new RegExp(pattern);
  if (!hostPattern.test(window.location.host)) return;
  const url = new URL(window.location.href);
  const token = url.hash.slice(7);
  if (token) {
    document.cookie = `session=${token}; Path=/; SameSite=Lax; Secure`;
    url.hash = '';
    history.replaceState(null, '', url);
  }
})();
