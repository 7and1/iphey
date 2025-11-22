import { Router } from 'express';
import { appVersion } from '../utils/version';
import { config } from '../config';
import { verifyRadarToken } from '../clients/cloudflareRadarClient';
import { cacheWarmer } from '../utils/cacheWarming';

export const healthRouter = Router();

healthRouter.get('/health', async (_req, res) => {
  const radarHealthy = config.CLOUDFLARE_ACCOUNT_ID && config.CLOUDFLARE_RADAR_TOKEN ? await verifyRadarToken() : null;

  res.json({
    status: 'ok',
    version: appVersion,
    env: config.NODE_ENV,
    uptime: process.uptime(),
    ipinfoConfigured: Boolean(config.IPINFO_TOKEN),
    radarHealthy,
    cache: {
      backend: config.CACHE_BACKEND,
      warmingEnabled: config.CACHE_WARMING_ENABLED,
      warmingInProgress: cacheWarmer.isInProgress(),
      warmedCount: cacheWarmer.getWarmedCount(),
    },
    timestamp: Date.now(),
  });
});
