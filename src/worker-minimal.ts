/**
 * Minimal Cloudflare Workers Entry Point for Quick Deployment
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Env = {
  IPINFO_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_RADAR_TOKEN?: string;
};

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}));

// Health check
app.get('/api/v1/health', (c) => {
  return c.json({
    status: 'ok',
    version: '1.0.0',
    environment: 'cloudflare-workers',
    timestamp: new Date().toISOString(),
  });
});

// Simple report endpoint (demo mode)
app.post('/api/v1/report', async (c) => {
  try {
    const body = await c.req.json();
    const clientIP = c.req.header('cf-connecting-ip') || '0.0.0.0';
    
    // Mock response for quick deployment
    return c.json({
      verdict: 'trustworthy',
      score: 85,
      panels: {
        browser: { status: 'trustworthy', score: 90, signals: [], insights: [] },
        location: { status: 'trustworthy', score: 85, signals: [], insights: [] },
        ipAddress: { status: 'trustworthy', score: 80, signals: [], insights: [] },
        hardware: { status: 'trustworthy', score: 85, signals: [], insights: [] },
        software: { status: 'trustworthy', score: 85, signals: [], insights: [] },
      },
      clientIP,
      timestamp: Date.now(),
      metadata: {
        note: 'This is a minimal deployment. Configure API tokens for full functionality.',
      },
    });
  } catch (error) {
    return c.json(
      { error: 'Invalid request', message: error instanceof Error ? error.message : 'Unknown error' },
      400
    );
  }
});

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'IPhey API - Cloudflare Workers',
    endpoints: {
      health: '/api/v1/health',
      report: '/api/v1/report (POST)',
    },
    status: 'running',
  });
});

export default app;
