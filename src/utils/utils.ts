import { IAppFramework } from "../middleware/middleware.interface";

function detectFramework(app: IAppFramework): string {
  if ('register' in app) return 'fastify';
  if ('route' in app) return 'hono';
  return 'express';
}