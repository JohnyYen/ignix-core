/**
 * Basic Example - Minimal in-memory CRUD demonstration
 * 
 * This example shows the core patterns:
 * - Entity with id, name, email
 * - In-memory repository extending BaseRepository
 * - Service extending BaseService  
 * - Using ok() and fail() Result pattern
 * - Basic CRUD operations
 * 
 * Run: npx ts-node examples/basic/basic.ts
 */

import { ok, fail, isSuccess, isFailure, Result } from "../../src/types/result";
import { BaseRepository, IRepository } from "../../src/repositories/repository.interface";
import { BaseService } from "../../src/services/base.service";
import { IService } from "../../src/services/service.interface";
import { ValidationError, NotFoundError, ServiceError } from "../../src/exceptions/exceptions";

// ============================================
// STEP 1: Define the Entity
// ============================================

interface User {
  id: number | string;
  name: string;
  email: string;
}

// ============================================
// STEP 2: Define Error Types for this domain
// ============================================

type UserError = ValidationError | NotFoundError;

// ============================================
// STEP 3: Create In-Memory Repository
// ============================================

class InMemoryUserRepository extends BaseRepository<User> {
  private users: User[] = [];
  private nextId = 1;

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async findById(id: number | string): Promise<User | null> {
    return this.users.find(u => u.id === id) ?? null;
  }

  async findOne(options: { email?: string }): Promise<User | null> {
    if (!options || !options.email) return null;
    return this.users.find(u => u.email === options.email) ?? null;
  }

  async create(data: Omit<User, "id">): Promise<User> {
    const user: User = { ...data, id: this.nextId++ };
    this.users.push(user);
    return user;
  }

  async update(id: number | string, data: Partial<User>): Promise<User | null> {
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
    // In-memory doesn't really soft delete, but this is the interface
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
// STEP 4: Create Service extending BaseService
// ============================================

class UserService extends BaseService<
  User,
  Omit<User, "id">,  // CreateDto
  Partial<User>,     // UpdateDto
  User,              // ResponseDto
  UserError
> {
  protected getResourceName(): string {
    return "User";
  }

  // Custom validation for creating a user - using type assertion to fix return type
  async create(data: Omit<User, "id">): Promise<Result<User, UserError>> {
    // Custom validation
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

    // Check for duplicate email
    const existing = await this.repo.findOne({ email: data.email });
    if (existing) {
      return fail({
        type: "validation",
        field: "email",
        message: "Email already exists",
      });
    }

    // Delegate to repository and wrap result
    const created = await this.repo.create(data);
    return ok(created);
  }
}

// ============================================
// STEP 5: Demonstrate Usage
// ============================================

async function main() {
  console.log("=== Basic Example: In-Memory CRUD ===\n");

  // Initialize repository and service
  const repo = new InMemoryUserRepository({});
  const userService = new UserService(repo);

  // --- CREATE ---
  console.log("1. Creating users...");
  
  const createResult1 = await userService.create({
    name: "John Doe",
    email: "john@example.com",
  });
  
  if (isSuccess(createResult1)) {
    console.log(`   ✓ Created: ${createResult1.data.name} (id: ${createResult1.data.id})`);
  }

  const createResult2 = await userService.create({
    name: "Jane Smith",
    email: "jane@example.com",
  });
  
  if (isSuccess(createResult2)) {
    console.log(`   ✓ Created: ${createResult2.data.name} (id: ${createResult2.data.id})`);
  }

  // Try duplicate email
  const dupResult = await userService.create({
    name: "Duplicate",
    email: "john@example.com",
  });
  
  if (isFailure(dupResult)) {
    console.log(`   ✓ Duplicate rejected: ${dupResult.error.message}`);
  }

  // --- READ ALL ---
  console.log("\n2. Finding all users...");
  
  const allUsers = await userService.findAll();
  if (isSuccess(allUsers)) {
    console.log(`   Found ${allUsers.data.length} users:`);
    allUsers.data.forEach(u => console.log(`   - ${u.name}: ${u.email}`));
  }

  // --- READ ONE ---
  console.log("\n3. Finding user by ID...");
  
  const foundUser = await userService.findById(1);
  if (isSuccess(foundUser) && foundUser.data) {
    console.log(`   ✓ Found: ${foundUser.data.name}`);
  }

  const notFoundUser = await userService.findById(999);
  if (isFailure(notFoundUser)) {
    console.log(`   ✓ Not found handled: ${notFoundUser.error.message}`);
  }

  // --- UPDATE ---
  console.log("\n4. Updating user...");
  
  const updateResult = await userService.update(1, { name: "John Updated" });
  if (isSuccess(updateResult) && updateResult.data) {
    console.log(`   ✓ Updated: ${updateResult.data.name}`);
  }

  // --- DELETE ---
  console.log("\n5. Deleting user...");
  
  const deleteResult = await userService.hardDelete(2);
  if (isSuccess(deleteResult)) {
    console.log(`   ✓ Deleted user id: 2`);
  }

  // Verify deletion
  const remaining = await userService.findAll();
  if (isSuccess(remaining)) {
    console.log(`   Remaining users: ${remaining.data.length}`);
  }

  // --- COUNT ---
  console.log("\n6. Counting users...");
  
  const countResult = await userService.count();
  if (isSuccess(countResult)) {
    console.log(`   Total: ${countResult.data}`);
  }

  console.log("\n=== Done! ===");
}

main().catch(console.error);
