const { McpServer } = require('@modelcontextprotocol/sdk/dist/cjs/server/mcp.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/dist/cjs/server/streamableHttp.js');
let toReqRes;
let toFetchResponse;
const { z } = require('zod');
const search = require('../../search');
const fetchPage = require('../../fetch');

function buildServer() {
  const server = new McpServer({
    name: 'Docs MCP',
    version: '1.0.0',
    description: 'Docs search & HTML fetcher for AI agents'
  });

  server.tool(
    'search',
    'Full-text keyword search over the documentation index',
    {
      query: z.string().describe('Search keywords')
    },
    async ({ query }) => ({
      content: [
        {
          type: 'json',
          json: search(query)
        }
      ]
    })
  );

  server.tool(
    'fetchPage',
    'Return raw HTML of a doc page given its relative path',
    {
      path: z.string().regex(/^\/?[\w\-.\/]+\.html$/)
    },
    async ({ path }) => ({
      content: [
        {
          type: 'text',
          mimeType: 'text/html',
          text: (await fetchPage(path)).text
        }
      ]
    })
  );

  return server;
}

module.exports = async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  if (!toReqRes) {
    const mod = await import('fetch-to-node');
    toReqRes = mod.toReqRes;
    toFetchResponse = mod.toFetchResponse;
  }

  const { req: nodeReq, res: nodeRes } = toReqRes(req);
  const server = buildServer();
  const transport = new StreamableHTTPServerTransport();

  await server.connect(transport);
  await transport.handleRequest(nodeReq, nodeRes, await req.json());

  return toFetchResponse(nodeRes);
};

module.exports.config = { path: '/mcp' };
