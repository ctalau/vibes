import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { addNumbers } from "@/tools/add";

/**
 * createMcpHandler wires the MCP server into a Next.js route.
 * We register exactly one tool – "add" – that returns `a + b`.
 */
const handler = createMcpHandler(
  /*   1️⃣ register tools/resources/prompts   */
  (server) => {
    server.tool(
      "add",
      "Add two numbers",
      {
        a: z.number().describe("First number"),
        b: z.number().describe("Second number")
      },
      async ({ a, b }) => ({
        content: [
          { type: "text", text: addNumbers(a, b).toString() }
        ]
      })
    );
  },

  /*   2️⃣ optional MCP-server metadata   */
  { serverInfo: { name: "nextjs-add-server", version: "1.0.0" } },

  /*   3️⃣ adapter config for Vercel   */
  {
    basePath: "/api",   // <project-root>/app/api
    maxDuration: 10,    // seconds – keeps Vercel happy
    verboseLogs: false  // flip to true while debugging
  }
);

// Expose both handshake (GET) and message (POST) handlers.
export { handler as GET, handler as POST };
