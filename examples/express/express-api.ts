/**
 * Express API Example - Complete HTTP API with Express
 * 
 * This example shows:
 * - Setting up an Express app
 * - Creating an APIHandler extending base APIHandler
 * - Using createRoutes() adapter
 * - Full HTTP flow with proper status codes
 * 
 * Prerequisites:
 *   npm install express
 *   npm install @types/express
 * 
 * Run: npx ts-node examples/express/express-api.ts
 * Then: curl http://localhost:3000/users
 */

// Note: This example requires express to be installed
// If express is not installed, this file will show TypeScript errors
// Install with: npm install express @types/express
import express, { Request, Response, NextFunction } from "express";

// Import from ignix-core
import { ok, fail, isSuccess, isFailure, Result } from "../../src/types/result";
import { BaseRepository } from "../../src/repositories/repository.interface";
import { BaseService } from "../../src/services/base.service";
import { APIHandler } from "../../src/api/api.handlers";
import { createRoutes } from "../../src/api/adapters/route.adapter";
import { ValidationError, NotFoundError, ServiceError } from "../../src/exceptions/exceptions";

// ============================================
// STEP 1: Define Types
// ============================================

interface CreateUserDto {
  name: string;
  email: string;
}

interface UpdateUserDto {
  name?: string;
  email?: string;
}

interface UserResponseDto {
  id: number | string;
  name: string;
  email: string;
}

interface UserEntity {
  id: number | string;
  name: string;
  email: string;
}

type UserError = ValidationError | NotFoundError;

// ============================================
// STEP 2: Create Repository
// ============================================

class UserRepository extends BaseRepository<UserEntity> {
  private users: UserEntity[] = [
    { id: 1, name: "Alice", email: "alice@example.com" },
    { id: 2, name: "Bob", email: "bob@example.com" },
  ];
  private nextId = 3;

  async findAll(): Promise<UserEntity[]> {
    return [...this.users];
  }

  async findById(id: number | string): Promise<UserEntity | null> {
    return this.users.find(u => u.id === id) ?? null;
  }

  async findOne(options: { email?: string }): Promise<UserEntity | null> {
    if (!options) return null;
    const key = Object.keys(options)[0] as keyof UserEntity;
    const value = options[key];
    return this.users.find(u => u[key] === value) ?? null;
  }

  async create(data: Omit<UserEntity, "id">): Promise<UserEntity> {
    const user: UserEntity = { ...data, id: this.nextId++ };
    this.users.push(user);
    return user;
  }

  async update(id: number | string, data: Partial<UserEntity>): Promise<UserEntity | null> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...data };
    return this.users[index];
  }

  async hardDelete(id: number | string): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }

  async softDelete(_id: number | string): Promise<boolean> {
    return true;
  }

  async restore(_id: number | string): Promise<boolean> {
    return true;
  }

  async count(): Promise<number> {
    return this.users.length;
  }
}

// ============================================
// STEP 3: Create Service
// ============================================

class UserService extends BaseService<
  UserEntity,
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  UserError
> {
  protected getResourceName(): string {
    return "User";
  }

  async mapToResponse(entity: UserEntity): Promise<UserResponseDto> {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
    };
  }

  async create(data: CreateUserDto): Promise<Result<UserResponseDto, UserError>> {
    if (!data.name || data.name.trim().length === 0) {
      return fail({
        type: "validation",
        field: "name",
        message: "Name is required",
      });
    }

    if (!data.email || !data.email.includes("@")) {
      return fail({
        type: "validation",
        field: "email",
        message: "Valid email is required",
      });
    }

    const created = await this.repo.create(data);
    return ok(await this.mapToResponse(created));
  }
}

// ============================================
// STEP 4: Create API Handler
// ============================================

// Extend the base APIHandler for User-specific endpoints
class UserApiHandler extends APIHandler<
  UserEntity,
  "id",
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  UserError
> {
  // The base APIHandler already provides:
  // - findAll (GET /)
  // - findById (GET /:id)
  // - create (POST /)
  // - update (PUT /:id)
  // - patch (PATCH /:id)
  // - delete (DELETE /:id)
  // - hardDelete (DELETE /:id/hard)
  //
  // You can override any method for custom behavior!
  
  // Example: Custom logic before finding all
  async findAll(req: any, res: any): Promise<void> {
    console.log(`[UserAPI] GET /users - Query:`, req.query);
    // Call parent implementation
    return super.findAll(req, res);
  }

  // Example: Custom logic after creation
  async create(req: any, res: any): Promise<void> {
    console.log(`[UserAPI] POST /users - Body:`, req.body);
    return super.create(req, res);
  }
}

// ============================================
// STEP 5: Setup Express App with Routes
// ============================================

function createApp() {
  const app = express();

  // Middleware
  app.use(express.json());

  // Error handling middleware
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Error:", err.message);
    res.status(500).json({ 
      type: "server_error", 
      message: "Internal server error" 
    });
  });

  // Initialize components
  const repo = new UserRepository({});
  const service = new UserService(repo);
  const handler = new UserApiHandler(service);

  // Create routes using the adapter
  // This sets up: GET /users, GET /users/:id, POST /users, PUT /users/:id, DELETE /users/:id
  // Note: Using 'as any' to work around complex generic type inference in createRoutes
  (createRoutes as any)(app, handler, "/users", "id");

  return app;
}

// ============================================
// STEP 6: Run the Server
// ============================================

const PORT = process.env.PORT || 3000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`
===============================================
  Express API Example Running
===============================================

  Server: http://localhost:${PORT}
  
  Endpoints:
    GET    /users           - List all users
    GET    /users/:id       - Get user by ID
    POST   /users           - Create user
    PUT    /users/:id       - Update user (full)
    PATCH  /users/:id       - Update user (partial)
    DELETE /users/:id       - Delete user (soft)
    DELETE /users/:id/hard  - Delete user (hard)

  Try these commands:
    curl http://localhost:${PORT}/users
    curl http://localhost:${PORT}/users/1
    curl -X POST http://localhost:${PORT}/users \\
         -H "Content-Type: application/json" \\
         -d '{"name":"Charlie","email":"charlie@example.com"}'

===============================================
  `);
});

export { app, createApp };
