import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { generateReport } from '../services/reportService';

export const reportRouter = Router();

reportRouter.post(
  '/v1/report',
  asyncHandler(async (req, res) => {
    const report = await generateReport(req.body, req.ip);
    res.json(report);
  })
);
