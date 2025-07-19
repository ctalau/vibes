const { exec } = require('child_process');

const BASE = 'https://syncrosoftsrljustkidding.netlify.app/';

/**
 * Fetch the full HTML for a given search result.
 * @param {string} id Identifier of the document (path returned by search)
 * @returns {Promise<{id:string,title:string,text:string,url:string,metadata?:object}>}
 */
function fetchResult(id) {
  const url = BASE + id;
  return new Promise((resolve, reject) => {
    exec(`curl -sL ${url}`, (error, stdout, stderr) => {
      if (error) return reject(error);
      const html = stdout.toString();
      const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : id;
      resolve({ id, title, text: html, url, metadata: {} });
    });
  });
}

module.exports = fetchResult;
