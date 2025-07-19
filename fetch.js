
const BASE = 'https://syncrosoftsrljustkidding.netlify.app/';

/**
 * Fetch the full HTML for a given search result.
 * @param {string} id Identifier of the document (path returned by search)
 * @returns {Promise<{id:string,title:string,text:string,url:string,metadata?:object}>}
 */
async function fetchPage(id) {
  const url = BASE + id;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed with ${res.status}`);
  const html = await res.text();
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : id;
  return { id, title, text: html, url, metadata: {} };
}

module.exports = fetchPage;
