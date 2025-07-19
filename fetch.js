
const BASE = 'https://syncrosoftsrljustkidding.netlify.app/';

/**
 * Fetch the full HTML for a given search result.
 * @param {string} id Identifier of the document (path returned by search)
 * @returns {Promise<{id:string,title:string,text:string,url:string,metadata?:object}>}
 */
async function fetchPage(id) {
  const url = BASE + id;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed with ${res.status}`);
    const html = await res.text();
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : id;
    return { id, title, text: html, url, metadata: {} };
  } catch (err) {
    const proxy = process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.HTTP_PROXY;
    if (!proxy) throw err;
    const { execFile } = require('child_process');
    const args = ['-L', url];
    if (proxy) args.unshift('-x', proxy);
    const html = await new Promise((res, rej) => {
      execFile('curl', args, { encoding: 'utf8' }, (e, stdout, stderr) => {
        if (e) return rej(e);
        res(stdout);
      });
    });
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : id;
    return { id, title, text: html, url, metadata: {} };
  }
}

module.exports = fetchPage;
