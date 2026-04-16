import crypto from "crypto";
import * as db from "./db";

const SALT_ROUNDS = 10;
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Hash a password using PBKDF2
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha256")
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  const [salt, storedHash] = hash.split(":");
  if (!salt || !storedHash) return false;

  const computedHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha256")
    .toString("hex");
  return computedHash === storedHash;
}

/**
 * Create a session token
 */
export function createSessionToken(userId: number): string {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_DURATION;
  return JSON.stringify({ token, userId, expiresAt });
}

/**
 * Verify a session token
 */
export function verifySessionToken(tokenString: string): { userId: number } | null {
  try {
    const { token, userId, expiresAt } = JSON.parse(tokenString);
    if (Date.now() > expiresAt) {
      return null;
    }
    return { userId };
  } catch {
    return null;
  }
}

/**
 * Login user with username and password
 */
export async function loginUser(username: string, password: string) {
  const user = await db.getUserByUsername(username);
  if (!user) {
    return { success: false, error: "Usuário não encontrado" };
  }
  if (!user.passwordHash) {
    return { success: false, error: "Usuário não tem senha configurada" };
  }

  const isPasswordValid = verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    return { success: false, error: "Senha incorreta" };
  }

  await db.updateUserLastSignedIn(user.id);
  const sessionToken = createSessionToken(user.id);

  return { success: true, sessionToken, user };
}

/**
 * Register a new user
 */
export async function registerUser(
  username: string,
  email: string,
  password: string,
  name: string
) {
  // Check if user already exists
  const existingUser = await db.getUserByUsername(username);
  if (existingUser) {
    return { success: false, error: "Usuário já existe" };
  }

  const passwordHash = hashPassword(password);
  const userId = await db.createUser({
    username,
    email,
    passwordHash,
    name,
    role: "user",
  });

  if (!userId) {
    return { success: false, error: "Erro ao criar usuário" };
  }

  const user = await db.getUserById(userId);
  const sessionToken = createSessionToken(userId);

  return { success: true, sessionToken, user };
}
