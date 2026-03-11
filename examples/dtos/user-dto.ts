/**
 * DTOs Example - Data Transfer Objects with validation
 * 
 * This example shows:
 * - CreateUserDto (name, email, password)
 * - UpdateUserDto (partial updates)
 * - UserResponseDto (excludes password)
 * - Custom mapToResponse in service to exclude password
 * - Validation in service layer
 * 
 * Run: npx ts-node examples/dtos/user-dto.ts
 */

import { ok, fail, isSuccess, isFailure, Result } from "../../src/types/result";
import { BaseRepository } from "../../src/repositories/repository.interface";
import { BaseService } from "../../src/services/base.service";
import { ValidationError, NotFoundError, ServiceError } from "../../src/exceptions/exceptions";

// ============================================
// STEP 1: Define DTOs
// ============================================

/**
 * DTO for creating a new user
 * Contains all fields needed to create a user
 */
interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

/**
 * DTO for updating an existing user
 * All fields are optional - partial updates supported
 */
interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
}

/**
 * DTO for API responses
 * EXCLUDES sensitive data like password
 */
interface UserResponseDto {
  id: number | string;
  name: string;
  email: string;
  createdAt?: Date;
}

// ============================================
// STEP 2: Define the Entity (includes password for storage)
// ============================================

interface UserEntity {
  id: number | string;
  name: string;
  email: string;
  password: string; // Stored in DB, never returned to client
  createdAt: Date;
}

// ============================================
// STEP 3: Define Error Types
// ============================================

type UserError = ValidationError | NotFoundError;

// ============================================
// STEP 4: Create In-Memory Repository
// ============================================

class UserRepository extends BaseRepository<UserEntity> {
  private users: UserEntity[] = [];
  private nextId = 1;

  async findAll(): Promise<UserEntity[]> {
    return [...this.users];
  }

  async findById(id: number | string): Promise<UserEntity | null> {
    return this.users.find(u => u.id === id) ?? null;
  }

  async findOne(options: { email?: string }): Promise<UserEntity | null> {
    if (!options || !options.email) return null;
    return this.users.find(u => u.email === options.email) ?? null;
  }

  async create(data: Omit<UserEntity, "id" | "createdAt">): Promise<UserEntity> {
    const user: UserEntity = {
      ...data,
      id: this.nextId++,
      createdAt: new Date(),
    };
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
// STEP 5: Create Service with DTO mapping
// ============================================

class UserDtoService extends BaseService<
  UserEntity,
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  UserError
> {
  protected getResourceName(): string {
    return "User";
  }

  /**
   * Custom mapToResponse - CRITICAL for security!
   * This is where we exclude sensitive data like passwords
   * from being sent back to the client
   */
  async mapToResponse(entity: UserEntity): Promise<UserResponseDto> {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      createdAt: entity.createdAt,
      // password is intentionally excluded!
    };
  }

  /**
   * Custom create with validation
   */
  async create(data: CreateUserDto): Promise<Result<UserResponseDto, UserError>> {
    // Validate name
    if (!data.name || data.name.trim().length === 0) {
      return fail({
        type: "validation",
        field: "name",
        message: "Name is required",
      });
    }

    if (data.name.length < 2) {
      return fail({
        type: "validation",
        field: "name",
        message: "Name must be at least 2 characters",
      });
    }

    // Validate email
    if (!data.email || !data.email.includes("@")) {
      return fail({
        type: "validation",
        field: "email",
        message: "Valid email is required",
      });
    }

    // Validate password
    if (!data.password || data.password.length < 8) {
      return fail({
        type: "validation",
        field: "password",
        message: "Password must be at least 8 characters",
      });
    }

    // Check for duplicate email
    const existing = await this.repo.findOne({ email: data.email });
    if (existing) {
      return fail({
        type: "validation",
        field: "email",
        message: "Email already exists",
      });
    }

    // Hash password (in real app, use bcrypt/argon2)
    const hashedPassword = `hashed_${data.password}`;

    // Create user
    const entity = await this.repo.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    // Map to response DTO (excludes password!)
    const response = await this.mapToResponse(entity);
    return ok(response);
  }

  /**
   * Custom update with validation
   */
  async update(
    id: number | string,
    data: UpdateUserDto
  ): Promise<Result<UserResponseDto | undefined, UserError>> {
    // Validate email if being updated
    if (data.email) {
      if (!data.email.includes("@")) {
        return fail({
          type: "validation",
          field: "email",
          message: "Invalid email format",
        });
      }

      // Check for duplicate email (excluding current user)
      const existing = await this.repo.findOne({ email: data.email });
      if (existing && existing.id !== id) {
        return fail({
          type: "validation",
          field: "email",
          message: "Email already in use",
        });
      }
    }

    // Validate password if being updated
    if (data.password && data.password.length < 8) {
      return fail({
        type: "validation",
        field: "password",
        message: "Password must be at least 8 characters",
      });
    }

    // Hash password if being updated
    if (data.password) {
      data.password = `hashed_${data.password}`;
    }

    // Delegate to parent (which calls repo.update)
    return super.update(id, data);
  }
}

// ============================================
// STEP 6: Demonstrate Usage
// ============================================

async function main() {
  console.log("=== DTOs Example: Data Transfer Objects ===\n");

  const repo = new UserRepository({});
  const userService = new UserDtoService(repo);

  // --- CREATE (with password) ---
  console.log("1. Creating user with password...");

  const createResult = await userService.create({
    name: "John Doe",
    email: "john@example.com",
    password: "securePassword123",
  });

  if (isSuccess(createResult)) {
    const user = createResult.data;
    console.log(`   ✓ Created: ${user.name} (${user.email})`);
    console.log(`   ✓ ID: ${user.id}`);
    console.log(`   ✓ Password excluded from response: ${(user as any).password === undefined ? "YES" : "NO"}`);
  }

  // --- CREATE with weak password (validation failure) ---
  console.log("\n2. Creating user with weak password...");

  const weakPassResult = await userService.create({
    name: "Weak User",
    email: "weak@example.com",
    password: "short",
  });

  if (isFailure(weakPassResult)) {
    console.log(`   ✓ Validation failed: ${weakPassResult.error.message}`);
  }

  // --- READ (password should not be in response) ---
  console.log("\n3. Reading user - password should be hidden...");

  const readResult = await userService.findById(1);
  if (isSuccess(readResult) && readResult.data) {
    const user = readResult.data;
    console.log(`   ✓ Name: ${user.name}`);
    console.log(`   ✓ Email: ${user.email}`);
    console.log(`   ✓ Password in response: ${(user as any).password !== undefined ? "YES (BUG!)" : "NO (correct)"}`);
  }

  // --- UPDATE (change email) ---
  console.log("\n4. Updating user email...");

  const updateResult = await userService.update(1, {
    email: "john.new@example.com",
  });

  if (isSuccess(updateResult) && updateResult.data) {
    console.log(`   ✓ Email updated to: ${updateResult.data.email}`);
    // Password should still be hidden
    console.log(`   ✓ Password still hidden: ${(updateResult.data as any).password === undefined ? "YES" : "NO"}`);
  }

  // --- UPDATE with invalid email ---
  console.log("\n5. Updating with invalid email...");

  const invalidEmailResult = await userService.update(1, {
    email: "not-an-email",
  });

  if (isFailure(invalidEmailResult)) {
    console.log(`   ✓ Validation failed: ${invalidEmailResult.error.message}`);
  }

  // --- READ ALL (passwords hidden) ---
  console.log("\n6. Reading all users...");

  const allUsers = await userService.findAll();
  if (isSuccess(allUsers)) {
    console.log(`   Found ${allUsers.data.length} user(s):`);
    allUsers.data.forEach(u => {
      const hasPassword = (u as any).password !== undefined;
      console.log(`   - ${u.name}: ${u.email} [password exposed: ${hasPassword}]`);
    });
  }

  console.log("\n=== Done! ===");
  console.log("\nKEY TAKEAWAY: Always use mapToResponse to exclude sensitive");
  console.log("fields like passwords from API responses!");
}

main().catch(console.error);
