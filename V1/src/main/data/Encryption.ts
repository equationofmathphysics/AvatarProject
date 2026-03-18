import crypto from 'crypto';

export class EncryptionService {
  private static algorithm = 'aes-256-cbc';
  private static keyLength = 32; // 256 bits
  private static ivLength = 16; // 128 bits

  static generateKey(): string {
    return crypto.randomBytes(EncryptionService.keyLength).toString('hex');
  }

  static encrypt(text: string, key: string): EncryptedData {
    const keyBuffer = Buffer.from(key, 'hex');

    if (keyBuffer.length !== EncryptionService.keyLength) {
      throw new Error('Invalid key length. Must be 32 bytes (64 hex characters)');
    }

    const iv = crypto.randomBytes(EncryptionService.ivLength);
    const cipher = crypto.createCipheriv(EncryptionService.algorithm, keyBuffer, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      algorithm: EncryptionService.algorithm
    };
  }

  static decrypt(encryptedData: EncryptedData, key: string): string {
    const keyBuffer = Buffer.from(key, 'hex');
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const dataBuffer = Buffer.from(encryptedData.encryptedData, 'hex');

    if (keyBuffer.length !== EncryptionService.keyLength) {
      throw new Error('Invalid key length');
    }

    const decipher = crypto.createDecipheriv(
      encryptedData.algorithm || EncryptionService.algorithm,
      keyBuffer,
      iv
    );

    let decrypted = decipher.update(dataBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  }

  static hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static generateSecureId(): string {
    return crypto.randomUUID();
  }

  static generateRandomBytes(length: number): string {
    return crypto.randomBytes(length).toString('hex');
  }
}

export interface EncryptedData {
  iv: string;
  encryptedData: string;
  algorithm?: string;
}

// 密钥管理器
export class KeyManager {
  private static keyStorageKey = 'avatar-encryption-key';

  static async storeKey(key: string): Promise<void> {
    // 注意：实际生产中应该使用系统密钥链(keychain/credential manager)
    // 这里使用localStorage作为演示
    try {
      localStorage.setItem(KeyManager.keyStorageKey, key);
    } catch (error) {
      console.error('Failed to store encryption key:', error);
      throw new Error('Could not store encryption key');
    }
  }

  static async retrieveKey(): Promise<string | null> {
    try {
      return localStorage.getItem(KeyManager.keyStorageKey);
    } catch (error) {
      console.error('Failed to retrieve encryption key:', error);
      return null;
    }
  }

  static async generateAndStoreKey(): Promise<string> {
    let key = await KeyManager.retrieveKey();

    if (!key) {
      key = EncryptionService.generateKey();
      await KeyManager.storeKey(key);
    }

    return key;
  }

  static async hasKey(): Promise<boolean> {
    const key = await KeyManager.retrieveKey();
    return key !== null;
  }

  static async deleteKey(): Promise<void> {
    try {
      localStorage.removeItem(KeyManager.keyStorageKey);
    } catch (error) {
      console.error('Failed to delete encryption key:', error);
    }
  }
}
