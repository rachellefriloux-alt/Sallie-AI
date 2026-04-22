/**
 * AES-256-GCM Encryption Implementation
 * Provides secure encryption for sensitive memory data
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const ITERATIONS = 100000;

/**
 * Encryption result structure
 */
export interface EncryptionResult {
  encrypted: string;
  iv: string;
  tag: string;
  salt: string;
}

/**
 * Encryption service for memory data
 */
export class EncryptionService {
  private masterKey: Buffer | null = null;

  /**
   * Initialize encryption service with a password
   * @param password - Master password for encryption
   */
  public initialize(password: string): void {
    const salt = crypto.randomBytes(SALT_LENGTH);
    this.masterKey = crypto.pbkdf2Sync(
      password,
      salt,
      ITERATIONS,
      KEY_LENGTH,
      'sha512'
    );
  }

  /**
   * Derive a key from password and salt
   * @param password - Password to derive key from
   * @param salt - Salt for key derivation
   * @returns Derived key
   */
  private deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');
  }

  /**
   * Encrypt data using AES-256-GCM
   * @param data - Data to encrypt
   * @param password - Password for encryption
   * @returns Encryption result with encrypted data, IV, tag, and salt
   */
  public encrypt(data: string, password: string): EncryptionResult {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = this.deriveKey(password, salt);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      salt: salt.toString('base64'),
    };
  }

  /**
   * Decrypt data using AES-256-GCM
   * @param encryptionResult - Encryption result to decrypt
   * @param password - Password for decryption
   * @returns Decrypted data
   * @throws Error if decryption fails
   */
  public decrypt(encryptionResult: EncryptionResult, password: string): string {
    try {
      const salt = Buffer.from(encryptionResult.salt, 'base64');
      const key = this.deriveKey(password, salt);
      const iv = Buffer.from(encryptionResult.iv, 'base64');
      const tag = Buffer.from(encryptionResult.tag, 'base64');

      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encryptionResult.encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generate a secure random password
   * @param length - Length of password to generate
   * @returns Random password
   */
  public generatePassword(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64').slice(0, length);
  }

  /**
   * Hash data using SHA-256
   * @param data - Data to hash
   * @returns Hashed data
   */
  public hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Verify if data matches a hash
   * @param data - Data to verify
   * @param hash - Hash to compare against
   * @returns True if data matches hash
   */
  public verifyHash(data: string, hash: string): boolean {
    return this.hash(data) === hash;
  }
}

/**
 * Singleton instance of encryption service
 */
export const encryptionService = new EncryptionService();
