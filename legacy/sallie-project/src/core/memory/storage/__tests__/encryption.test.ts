/**
 * Encryption Service Tests
 */

import { EncryptionService } from '../encryption';

describe('EncryptionService', () => {
  let encryptionService: EncryptionService;

  beforeEach(() => {
    encryptionService = new EncryptionService();
  });

  describe('Initialization', () => {
    it('should initialize with a password', () => {
      expect(() => {
        encryptionService.initialize('test-password');
      }).not.toThrow();
    });
  });

  describe('Encryption and Decryption', () => {
    it('should encrypt and decrypt data successfully', () => {
      const password = 'secure-password-123';
      const originalData = 'This is sensitive information';

      const encrypted = encryptionService.encrypt(originalData, password);

      expect(encrypted.encrypted).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.tag).toBeDefined();
      expect(encrypted.salt).toBeDefined();

      const decrypted = encryptionService.decrypt(encrypted, password);

      expect(decrypted).toBe(originalData);
    });

    it('should fail decryption with wrong password', () => {
      const password = 'correct-password';
      const wrongPassword = 'wrong-password';
      const data = 'Secret data';

      const encrypted = encryptionService.encrypt(data, password);

      expect(() => {
        encryptionService.decrypt(encrypted, wrongPassword);
      }).toThrow();
    });

    it('should produce different ciphertexts for same plaintext', () => {
      const password = 'password123';
      const data = 'Same data';

      const encrypted1 = encryptionService.encrypt(data, password);
      const encrypted2 = encryptionService.encrypt(data, password);

      expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      expect(encrypted1.salt).not.toBe(encrypted2.salt);
    });

    it('should handle empty strings', () => {
      const password = 'password';
      const data = '';

      const encrypted = encryptionService.encrypt(data, password);
      const decrypted = encryptionService.decrypt(encrypted, password);

      expect(decrypted).toBe(data);
    });

    it('should handle special characters', () => {
      const password = 'p@ssw0rd!';
      const data = 'Special chars: 😀🎉✨ and symbols: @#$%^&*()';

      const encrypted = encryptionService.encrypt(data, password);
      const decrypted = encryptionService.decrypt(encrypted, password);

      expect(decrypted).toBe(data);
    });

    it('should handle large data', () => {
      const password = 'password';
      const data = 'A'.repeat(10000);

      const encrypted = encryptionService.encrypt(data, password);
      const decrypted = encryptionService.decrypt(encrypted, password);

      expect(decrypted).toBe(data);
    });
  });

  describe('Password Generation', () => {
    it('should generate a random password', () => {
      const password = encryptionService.generatePassword();

      expect(password).toBeDefined();
      expect(password.length).toBe(32);
    });

    it('should generate passwords of specified length', () => {
      const length = 64;
      const password = encryptionService.generatePassword(length);

      expect(password.length).toBe(length);
    });

    it('should generate different passwords each time', () => {
      const password1 = encryptionService.generatePassword();
      const password2 = encryptionService.generatePassword();

      expect(password1).not.toBe(password2);
    });
  });

  describe('Hashing', () => {
    it('should hash data consistently', () => {
      const data = 'Data to hash';

      const hash1 = encryptionService.hash(data);
      const hash2 = encryptionService.hash(data);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different data', () => {
      const data1 = 'Data 1';
      const data2 = 'Data 2';

      const hash1 = encryptionService.hash(data1);
      const hash2 = encryptionService.hash(data2);

      expect(hash1).not.toBe(hash2);
    });

    it('should verify hash correctly', () => {
      const data = 'Original data';
      const hash = encryptionService.hash(data);

      expect(encryptionService.verifyHash(data, hash)).toBe(true);
      expect(encryptionService.verifyHash('Different data', hash)).toBe(false);
    });

    it('should produce 64-character hex hash', () => {
      const data = 'Test data';
      const hash = encryptionService.hash(data);

      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });
});
