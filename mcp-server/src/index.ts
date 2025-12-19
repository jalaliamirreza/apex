import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createForm } from './tools/createForm';
import { listForms } from './tools/listForms';
import { getForm } from './tools/getForm';
import { getSubmissions } from './tools/getSubmissions';
import { searchSubmissions } from './tools/searchSubmissions';

const server = new Server({ name: 'apex-mcp-server', version: '1.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: 'create_form', description: 'Create a new form', inputSchema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, fields: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, type: { type: 'string', enum: ['text', 'textarea', 'number', 'email', 'date', 'select', 'checkbox', 'file', 'signature'] }, label: { type: 'string' }, required: { type: 'boolean' }, options: { type: 'array', items: { type: 'string' } } }, required: ['name', 'type', 'label'] } } }, required: ['name', 'fields'] } },
    { name: 'list_forms', description: 'List all forms', inputSchema: { type: 'object', properties: {} } },
    { name: 'get_form', description: 'Get form details', inputSchema: { type: 'object', properties: { slug: { type: 'string' } }, required: ['slug'] } },
    { name: 'get_submissions', description: 'Get form submissions', inputSchema: { type: 'object', properties: { formSlug: { type: 'string' }, limit: { type: 'number' }, offset: { type: 'number' } }, required: ['formSlug'] } },
    { name: 'search_submissions', description: 'Search submissions', inputSchema: { type: 'object', properties: { query: { type: 'string' }, formSlug: { type: 'string' }, limit: { type: 'number' } }, required: ['query'] } }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    switch (name) {
      case 'create_form': return await createForm(args as any);
      case 'list_forms': return await listForms();
      case 'get_form': return await getForm(args as any);
      case 'get_submissions': return await getSubmissions(args as any);
      case 'search_submissions': return await searchSubmissions(args as any);
      default: throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) { return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true }; }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('APEX MCP Server running');
}
main().catch(console.error);
