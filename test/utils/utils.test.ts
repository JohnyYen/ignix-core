import { detectFramework } from '../../src/utils/utils';
import { IAppFramework } from '../../src/middleware/middleware.interface';

describe('detectFramework', () => {
  describe('Fastify detection', () => {
    it('should detect fastify when register property exists', () => {
      const fastifyApp = {
        register: jest.fn(),
        get: jest.fn(),
        post: jest.fn(),
        listen: jest.fn()
      } as unknown as IAppFramework;

      const result = detectFramework(fastifyApp);
      expect(result).toBe('fastify');
    });

    it('should detect fastify even with other common methods present', () => {
      const fastifyApp = {
        register: jest.fn(),
        route: jest.fn(), // This would normally indicate Hono
        use: jest.fn(),
        listen: jest.fn()
      } as unknown as IAppFramework;

      const result = detectFramework(fastifyApp);
      expect(result).toBe('fastify'); // register check takes precedence
    });

    it('should handle fastify app with minimal properties', () => {
      const minimalFastify = {
        register: jest.fn()
      } as unknown as IAppFramework;

      const result = detectFramework(minimalFastify);
      expect(result).toBe('fastify');
    });
  });

  describe('Hono detection', () => {
    it('should detect hono when route property exists but register does not', () => {
      const honoApp = {
        route: jest.fn(),
        get: jest.fn(),
        post: jest.fn(),
        fetch: jest.fn()
      } as unknown as IAppFramework;

      const result = detectFramework(honoApp);
      expect(result).toBe('hono');
    });

    it('should detect hono when route is a function', () => {
      const honoApp = {
        route: jest.fn(),
        get: jest.fn(),
        post: jest.fn()
      } as unknown as IAppFramework;

      const result = detectFramework(honoApp);
      expect(result).toBe('hono');
    });

    it('should handle hono app with minimal properties', () => {
      const minimalHono = {
        route: jest.fn()
      } as unknown as IAppFramework;

      const result = detectFramework(minimalHono);
      expect(result).toBe('hono');
    });
  });

  describe('Express detection', () => {
    it('should detect express as default when neither register nor route exists', () => {
      const expressApp = {
        get: jest.fn(),
        post: jest.fn(),
        use: jest.fn(),
        listen: jest.fn(),
        set: jest.fn()
      } as unknown as IAppFramework;

      const result = detectFramework(expressApp);
      expect(result).toBe('express');
    });

    it('should detect express with common middleware methods', () => {
      const expressApp = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        use: jest.fn(),
        engine: jest.fn()
      } as unknown as IAppFramework;

      const result = detectFramework(expressApp);
      expect(result).toBe('express');
    });

    it('should detect express with minimal setup', () => {
      const minimalExpress = {
        get: jest.fn()
      } as unknown as IAppFramework;

      const result = detectFramework(minimalExpress);
      expect(result).toBe('express');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty object gracefully', () => {
      const emptyApp = {} as IAppFramework;

      const result = detectFramework(emptyApp);
      expect(result).toBe('express'); // Default case
    });

    it('should handle null input gracefully', () => {
      const result = detectFramework(null as any);
      expect(result).toBe('express'); // Default case
    });

    it('should handle undefined input gracefully', () => {
      const result = detectFramework(undefined as any);
      expect(result).toBe('express'); // Default case
    });

    it('should prioritize fastify over other frameworks', () => {
      const weirdApp = {
        register: jest.fn(),
        route: jest.fn(),
        get: jest.fn(),
        post: jest.fn()
      } as unknown as IAppFramework;

      const result = detectFramework(weirdApp);
      expect(result).toBe('fastify'); // register check comes first
    });

    it('should handle objects with circular references', () => {
      const app: any = { get: jest.fn() };
      app.self = app; // Create circular reference

      const result = detectFramework(app);
      expect(result).toBe('express');
    });

    it('should handle objects with non-function properties', () => {
      const app = {
        register: 'not a function',
        route: 42,
        get: null,
        post: undefined
      } as unknown as IAppFramework;

      const result = detectFramework(app);
      expect(result).toBe('fastify'); // 'register' property exists, even if not a function
    });

    it('should handle objects with prototype chain', () => {
      function AppConstructor(this: any) {
        this.get = jest.fn();
      }
      const app = Object.create(AppConstructor.prototype);

      const result = detectFramework(app);
      expect(result).toBe('express');
    });
  });

  describe('Real-world scenarios', () => {
    it('should detect real fastify app structure', () => {
      const mockFastify = {
        register: async () => {},
        addHook: jest.fn(),
        get: jest.fn(),
        post: jest.fn(),
        listen: jest.fn(),
        ready: jest.fn()
      } as unknown as IAppFramework;

      const result = detectFramework(mockFastify);
      expect(result).toBe('fastify');
    });

    it('should detect real hono app structure', () => {
      const mockHono = {
        route: jest.fn(),
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        fetch: jest.fn()
      } as unknown as IAppFramework;

      const result = detectFramework(mockHono);
      expect(result).toBe('hono');
    });

    it('should detect real express app structure', () => {
      const mockExpress = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        use: jest.fn(),
        engine: jest.fn(),
        set: jest.fn(),
        listen: jest.fn()
      } as unknown as IAppFramework;

      const result = detectFramework(mockExpress);
      expect(result).toBe('express');
    });

    it('should handle framework-agnostic app wrapper', () => {
      const expressApp = { get: jest.fn(), post: jest.fn() };
      
      const result = detectFramework(expressApp as any);
      expect(result).toBe('express');
    });
  });

  describe('Performance considerations', () => {
    it('should handle large objects efficiently', () => {
      const largeApp = {} as any;
      
      // Add 1000 properties
      for (let i = 0; i < 1000; i++) {
        largeApp[`prop${i}`] = `value${i}`;
      }
      
      const startTime = performance.now();
      const result = detectFramework(largeApp);
      const endTime = performance.now();
      
      expect(result).toBe('express');
      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
    });
  });
});