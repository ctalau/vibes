# MCP Tools Usage

This repository exposes two JavaScript functions that match the [Model Context Protocol](https://platform.openai.com/docs/mcp) tool signatures.

- **search** – located in `search.js`
- **fetch** – located in `fetch.js`

Both functions replicate the behaviour of the sample HTML search page and can be used from Node.js modules.

## Example

```javascript
const search = require('./search');
const fetchPage = require('./fetch');

async function run() {
  const results = search('help');
  console.log('search results:', results);

  if (results.length) {
    const page = await fetchPage(results[0].id);
    console.log('fetched title:', page.title);
  }
}

run();
```

The `search` function returns an array of objects with `id`, `title`, `text` and `url` fields. The `id` should be passed to `fetch` to retrieve the full HTML for that result. `fetch` returns an object with the same fields plus an empty `metadata` object.
