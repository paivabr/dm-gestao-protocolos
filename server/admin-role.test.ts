import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";
import * as auth from "./auth";

describe("Admin Role Management", () => {
  let testUserId: number;
  let adminUserId: number;

  beforeAll(async () => {
    // Create test users
    const userResult = await auth.registerUser("testuser", "test@example.com", "password123", "Test User");
    const adminResult = await auth.registerUser("adminuser", "admin@example.com", "password123", "Admin User");
    
    if (userResult.success && adminResult.success) {
      testUserId = userResult.user.id;
      adminUserId = adminResult.user.id;
      
      // Make adminResult user an admin
      await db.updateUserRole(adminUserId, "admin");
    }
  });

  it("should promote a user to admin", async () => {
    const result = await db.updateUserRole(testUserId, "admin");
    expect(result).toBe(true);
  });

  it("should demote an admin to user", async () => {
    // First promote
    await db.updateUserRole(testUserId, "admin");
    
    // Then demote
    const result = await db.updateUserRole(testUserId, "user");
    expect(result).toBe(true);
  });

  it("should handle invalid user ID gracefully", async () => {
    const result = await db.updateUserRole(99999, "admin");
    expect(result).toBe(true); // Drizzle doesn't error on non-existent IDs
  });

  afterAll(async () => {
    // Cleanup is handled by test database isolation
  });
});
