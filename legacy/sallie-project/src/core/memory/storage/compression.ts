/**
 * Compression Service for Memory Data
 * Provides lossless and semantic compression
 */

import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

/**
 * Compression modes
 */
export enum CompressionMode {
  NONE = 'none',
  LOSSLESS = 'lossless',
  SEMANTIC = 'semantic',
}

/**
 * Compressed data structure
 */
export interface CompressedData {
  data: string;
  mode: CompressionMode;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Compression service for memory storage efficiency
 */
export class CompressionService {
  /**
   * Compress data using gzip (lossless)
   * @param data - Data to compress
   * @returns Compressed data structure
   */
  public async compressLossless(data: string): Promise<CompressedData> {
    const originalSize = Buffer.byteLength(data, 'utf8');
    const compressed = await gzip(Buffer.from(data, 'utf8'));
    const compressedSize = compressed.length;

    return {
      data: compressed.toString('base64'),
      mode: CompressionMode.LOSSLESS,
      originalSize,
      compressedSize,
      compressionRatio: originalSize / compressedSize,
    };
  }

  /**
   * Decompress lossless compressed data
   * @param compressedData - Compressed data to decompress
   * @returns Original data
   */
  public async decompressLossless(compressedData: string): Promise<string> {
    const buffer = Buffer.from(compressedData, 'base64');
    const decompressed = await gunzip(buffer);
    return decompressed.toString('utf8');
  }

  /**
   * Perform semantic compression (summarization while preserving meaning)
   * @param data - Data to compress semantically
   * @returns Semantically compressed data
   */
  public compressSemantic(data: string): CompressedData {
    const originalSize = Buffer.byteLength(data, 'utf8');
    
    // Basic semantic compression: remove redundant words, simplify structure
    let compressed = data
      .replace(/\s+/g, ' ')
      .replace(/\b(the|a|an|and|or|but|in|on|at|to|for)\b/gi, ' ')
      .replace(/,\s*/g, ',')
      .replace(/\.\s*/g, '.')
      .trim();

    const compressedSize = Buffer.byteLength(compressed, 'utf8');

    return {
      data: compressed,
      mode: CompressionMode.SEMANTIC,
      originalSize,
      compressedSize,
      compressionRatio: originalSize / compressedSize,
    };
  }

  /**
   * Compress data automatically based on size and age
   * @param data - Data to compress
   * @param age - Age of data in days
   * @param size - Size threshold for compression
   * @returns Compressed data structure
   */
  public async autoCompress(
    data: string,
    age: number,
    size: number = 1000
  ): Promise<CompressedData> {
    const dataSize = Buffer.byteLength(data, 'utf8');

    if (dataSize < size) {
      return {
        data,
        mode: CompressionMode.NONE,
        originalSize: dataSize,
        compressedSize: dataSize,
        compressionRatio: 1,
      };
    }

    if (age > 30) {
      return this.compressSemantic(data);
    }

    return this.compressLossless(data);
  }

  /**
   * Decompress data based on compression mode
   * @param compressedData - Compressed data structure
   * @returns Decompressed data
   */
  public async decompress(compressedData: CompressedData): Promise<string> {
    switch (compressedData.mode) {
      case CompressionMode.NONE:
        return compressedData.data;
      case CompressionMode.LOSSLESS:
        return this.decompressLossless(compressedData.data);
      case CompressionMode.SEMANTIC:
        return compressedData.data;
      default:
        throw new Error(`Unknown compression mode: ${compressedData.mode}`);
    }
  }

  /**
   * Calculate compression ratio for data
   * @param original - Original data
   * @param compressed - Compressed data
   * @returns Compression ratio
   */
  public calculateRatio(original: string, compressed: string): number {
    const originalSize = Buffer.byteLength(original, 'utf8');
    const compressedSize = Buffer.byteLength(compressed, 'utf8');
    return originalSize / compressedSize;
  }
}

/**
 * Singleton instance of compression service
 */
export const compressionService = new CompressionService();
