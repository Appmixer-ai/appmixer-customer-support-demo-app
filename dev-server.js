const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.DEV_SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock Vercel request/response objects
function createVercelRequest(req) {
  return {
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: { ...req.query, ...req.params },
    url: req.url
  };
}

function createVercelResponse(res) {
  return {
    ...res,
    json: (data) => res.json(data),
    status: (code) => ({ 
      json: (data) => res.status(code).json(data),
      end: () => res.status(code).end(),
      send: (data) => res.status(code).send(data)
    }),
    setHeader: (name, value) => res.setHeader(name, value)
  };
}

// Load API functions
const ticketsHandler = require('./api/tickets/index.js');
const customersHandler = require('./api/customers/index.js');
const commentsHandler = require('./api/comments/index.js');
const tagsHandler = require('./api/tags/index.js');
const ticketTagsHandler = require('./api/tickets/tags/index.js');
const tagStatsHandler = require('./api/tags/stats/index.js');

// Routes
app.all('/api/tickets', async (req, res) => {
  const vercelReq = createVercelRequest(req);
  const vercelRes = createVercelResponse(res);
  await ticketsHandler(vercelReq, vercelRes);
});

app.all('/api/customers', async (req, res) => {
  const vercelReq = createVercelRequest(req);
  const vercelRes = createVercelResponse(res);
  await customersHandler(vercelReq, vercelRes);
});

app.all('/api/tickets/:ticket_id/comments', async (req, res) => {
  const vercelReq = createVercelRequest(req);
  vercelReq.query.ticket_id = req.params.ticket_id;
  const vercelRes = createVercelResponse(res);
  await commentsHandler(vercelReq, vercelRes);
});

app.all('/api/comments', async (req, res) => {
  const vercelReq = createVercelRequest(req);
  const vercelRes = createVercelResponse(res);
  await commentsHandler(vercelReq, vercelRes);
});

// Tag management routes
app.all('/api/tags', async (req, res) => {
  const vercelReq = createVercelRequest(req);
  const vercelRes = createVercelResponse(res);
  await tagsHandler(vercelReq, vercelRes);
});

app.all('/api/tickets/tags', async (req, res) => {
  const vercelReq = createVercelRequest(req);
  const vercelRes = createVercelResponse(res);
  await ticketTagsHandler(vercelReq, vercelRes);
});

app.all('/api/tags/stats', async (req, res) => {
  const vercelReq = createVercelRequest(req);
  const vercelRes = createVercelResponse(res);
  await tagStatsHandler(vercelReq, vercelRes);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Dev server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🎫 Tickets API: http://localhost:${PORT}/api/tickets`);
  console.log(`👥 Customers API: http://localhost:${PORT}/api/customers`);
  console.log(`💬 Comments API: http://localhost:${PORT}/api/tickets/TICK-001/comments`);
  console.log(`🏷️  Tags API: http://localhost:${PORT}/api/tags`);
  console.log(`🔗 Ticket Tags API: http://localhost:${PORT}/api/tickets/tags`);
  console.log(`📊 Tag Stats API: http://localhost:${PORT}/api/tags/stats`);
});