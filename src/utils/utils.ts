import { IAppFramework } from "../middleware/middleware.interface";

/**
 * Detects the web framework type based on the app instance properties
 * Supports Fastify, Hono, and Express frameworks
 * @param app - The application framework instance
 * @returns The detected framework name ('fastify', 'hono', or 'express')
 */
/**
 * Detects the web framework type based on the app instance properties
 * Supports Fastify, Hono, and Express frameworks
 * @param app - The application framework instance
 * @returns The detected framework name ('fastify', 'hono', or 'express')
 */
export function detectFramework(app: IAppFramework): string {
  if (!app || typeof app !== 'object') return 'express';
  if ('register' in app) return 'fastify';
  if ('route' in app) return 'hono';
  return 'express';
}