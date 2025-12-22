/**
 * @file routes/index.ts
 * @purpose Main route aggregator with API versioning
 * @functionality
 * - Mounts versioned API routes
 * - Provides root health endpoint for Docker/load balancer liveness checks
 * @dependencies
 * - express.Router
 * - ./api/v1
 * - @/controllers/health.controller
 */

import { Router } from 'express';
import v1Routes from './api/v1/index.js';
import { liveness } from '../controllers/health.controller.js';

const router = Router();

// API v1 routes
router.use('/api/v1', v1Routes);

// Root health check for Docker/load balancer liveness
router.get('/health', liveness);

export default router;
