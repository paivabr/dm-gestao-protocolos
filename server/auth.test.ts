import { describe, expect, it, beforeEach, vi } from "vitest";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "./auth";

describe("Authentication", () => {
  describe("Password Hashing", () => {
    it("should hash a password", () => {
      const password = "testPassword123";
      const hash = hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).toContain(":");
      expect(hash.split(":")).toHaveLength(2);
    });

    it("should verify a correct password", () => {
      const password = "testPassword123";
      const hash = hashPassword(password);

      const isValid = verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should reject an incorrect password", () => {
      const password = "testPassword123";
      const wrongPassword = "wrongPassword";
      const hash = hashPassword(password);

      const isValid = verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it("should produce different hashes for the same password", () => {
      const password = "testPassword123";
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);

      expect(hash1).not.toBe(hash2);
      expect(verifyPassword(password, hash1)).toBe(true);
      expect(verifyPassword(password, hash2)).toBe(true);
    });
  });

  describe("Session Token", () => {
    it("should create a session token", () => {
      const userId = 1;
      const token = createSessionToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const parsed = JSON.parse(token);
      expect(parsed).toHaveProperty("token");
      expect(parsed).toHaveProperty("userId");
      expect(parsed).toHaveProperty("expiresAt");
      expect(parsed.userId).toBe(userId);
    });

    it("should verify a valid session token", () => {
      const userId = 1;
      const token = createSessionToken(userId);

      const verified = verifySessionToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(userId);
    });

    it("should reject an expired session token", () => {
      const userId = 1;
      const expiredToken = JSON.stringify({
        token: "test",
        userId,
        expiresAt: Date.now() - 1000, // 1 second ago
      });

      const verified = verifySessionToken(expiredToken);
      expect(verified).toBeNull();
    });

    it("should reject an invalid session token", () => {
      const verified = verifySessionToken("invalid-token");
      expect(verified).toBeNull();
    });
  });
});
