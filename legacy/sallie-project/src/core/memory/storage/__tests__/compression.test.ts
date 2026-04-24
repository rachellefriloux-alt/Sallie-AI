/**
 * Compression Service Tests
 */

import { CompressionService, CompressionMode } from '../compression';

describe('CompressionService', () => {
  let compressionService: CompressionService;

  beforeEach(() => {
    compressionService = new CompressionService();
  });

  describe('Lossless Compression', () => {
    it('should compress and decompress data losslessly', async () => {
      const originalData = 'This is some text that should be compressed losslessly. It contains repeated words: repeated repeated repeated.';

      const compressed = await compressionService.compressLossless(originalData);

      expect(compressed.mode).toBe(CompressionMode.LOSSLESS);
      expect(compressed.originalSize).toBeGreaterThan(0);
      expect(compressed.compressedSize).toBeGreaterThan(0);
      expect(compressed.compressionRatio).toBeGreaterThan(1);

      const decompressed = await compressionService.decompressLossless(compressed.data);

      expect(decompressed).toBe(originalData);
    });

    it('should handle empty strings', async () => {
      const data = '';

      const compressed = await compressionService.compressLossless(data);
      const decompressed = await compressionService.decompressLossless(compressed.data);

      expect(decompressed).toBe(data);
    });

    it('should handle large data', async () => {
      const data = 'A'.repeat(10000);

      const compressed = await compressionService.compressLossless(data);

      expect(compressed.compressedSize).toBeLessThan(compressed.originalSize);

      const decompressed = await compressionService.decompressLossless(compressed.data);

      expect(decompressed).toBe(data);
    });

    it('should achieve good compression ratio for repetitive data', async () => {
      const data = 'repeat '.repeat(1000);

      const compressed = await compressionService.compressLossless(data);

      expect(compressed.compressionRatio).toBeGreaterThan(5);
    });
  });

  describe('Semantic Compression', () => {
    it('should semantically compress data', () => {
      const originalData = 'This is the data that should be compressed semantically and efficiently for storage.';

      const compressed = compressionService.compressSemantic(originalData);

      expect(compressed.mode).toBe(CompressionMode.SEMANTIC);
      expect(compressed.compressedSize).toBeLessThan(compressed.originalSize);
      expect(compressed.data.length).toBeLessThan(originalData.length);
    });

    it('should remove redundant words', () => {
      const data = 'The cat and the dog and the bird';

      const compressed = compressionService.compressSemantic(data);

      expect(compressed.data.includes('the')).toBe(false);
      expect(compressed.data.includes('and')).toBe(false);
    });

    it('should normalize whitespace', () => {
      const data = 'Text   with    extra     spaces';

      const compressed = compressionService.compressSemantic(data);

      expect(compressed.data).not.toContain('  ');
    });
  });

  describe('Auto Compression', () => {
    it('should not compress small recent data', async () => {
      const data = 'Small data';
      const age = 5;

      const compressed = await compressionService.autoCompress(data, age, 1000);

      expect(compressed.mode).toBe(CompressionMode.NONE);
      expect(compressed.data).toBe(data);
    });

    it('should semantically compress old data', async () => {
      const data = 'This is the old data that should be compressed semantically';
      const age = 35;

      const compressed = await compressionService.autoCompress(data, age, 10);

      expect(compressed.mode).toBe(CompressionMode.SEMANTIC);
    });

    it('should losslessly compress large recent data', async () => {
      const data = 'A'.repeat(2000);
      const age = 5;

      const compressed = await compressionService.autoCompress(data, age, 1000);

      expect(compressed.mode).toBe(CompressionMode.LOSSLESS);
    });
  });

  describe('Decompression', () => {
    it('should decompress lossless compressed data', async () => {
      const originalData = 'Test data for decompression';

      const compressed = await compressionService.compressLossless(originalData);
      const decompressed = await compressionService.decompress(compressed);

      expect(decompressed).toBe(originalData);
    });

    it('should return uncompressed data as is', async () => {
      const data = 'Uncompressed data';

      const compressed = {
        data,
        mode: CompressionMode.NONE,
        originalSize: data.length,
        compressedSize: data.length,
        compressionRatio: 1,
      };

      const decompressed = await compressionService.decompress(compressed);

      expect(decompressed).toBe(data);
    });

    it('should return semantic compressed data as is', async () => {
      const originalData = 'Semantic data with the and or';

      const compressed = compressionService.compressSemantic(originalData);
      const decompressed = await compressionService.decompress(compressed);

      expect(decompressed).toBe(compressed.data);
    });
  });

  describe('Compression Ratio', () => {
    it('should calculate compression ratio correctly', () => {
      const original = 'A'.repeat(1000);
      const compressed = 'A';

      const ratio = compressionService.calculateRatio(original, compressed);

      expect(ratio).toBeCloseTo(1000, 0);
    });

    it('should return 1 for equal sizes', () => {
      const data = 'Same size';

      const ratio = compressionService.calculateRatio(data, data);

      expect(ratio).toBe(1);
    });

    it('should handle empty strings', () => {
      const ratio = compressionService.calculateRatio('', '');

      expect(ratio).toBeNaN();
    });
  });
});
