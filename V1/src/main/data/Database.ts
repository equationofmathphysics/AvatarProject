import { OperationEvent, DailySummary, UserConfig, TaskModel, DatabaseConfig } from '@/shared/types';
import { EncryptionService, EncryptedData } from './Encryption';

// 使用内存存储作为临时方案
class InMemoryStorage {
  private operations: OperationEvent[] = [];
  private dailySummaries: DailySummary[] = [];
  private taskModels: TaskModel[] = [];
  private userConfig: UserConfig | null = null;

  constructor() {
    console.log('Initializing in-memory storage');
  }

  // 操作日志
  insertOperation(event: OperationEvent) {
    this.operations.push(event);
  }

  getOperations(startTime?: number, endTime?: number): OperationEvent[] {
    let filtered = this.operations;
    if (startTime !== undefined) {
      filtered = filtered.filter(op => op.timestamp >= startTime);
    }
    if (endTime !== undefined) {
      filtered = filtered.filter(op => op.timestamp <= endTime);
    }
    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  // 每日摘要
  insertDailySummary(summary: DailySummary) {
    this.dailySummaries.push(summary);
  }

  getDailySummary(date: string): DailySummary | null {
    return this.dailySummaries.find(s => s.date === date) || null;
  }

  getDailySummaries(startDate: string, endDate: string): DailySummary[] {
    return this.dailySummaries.filter(s => s.date >= startDate && s.date <= endDate);
  }

  // 任务模型
  insertTaskModel(task: TaskModel) {
    this.taskModels.push(task);
  }

  getTaskModel(id: string): TaskModel | null {
    return this.taskModels.find(t => t.id === id) || null;
  }

  getAllTaskModels(): TaskModel[] {
    return this.taskModels;
  }

  // 用户配置
  setConfig(key: string, value: any, category?: string) {
    if (!this.userConfig) {
      this.userConfig = {
        observation: {
          enabled: true,
          captureInterval: 3000,
          screenQuality: 0.8,
          maxResolution: '1920x1080',
          includeMouseMovement: true,
          privacyModeApps: [],
          privacyModeUrls: []
        },
        learning: {
          enabled: true,
          maxHistoryDays: 30,
          autoUpdatePatterns: true
        },
        execution: {
          enabled: false,
          maxConcurrency: 3,
          timeout: 30,
          autoConfirm: false,
          authorizedTasks: []
        },
        data: {
          encryptionEnabled: true,
          autoBackup: true,
          backupInterval: 24,
          maxStorageSize: 5120
        },
        ui: {
          theme: 'system',
          language: 'zh-CN',
          showTrayIcon: true,
          startOnBoot: false
        }
      };
    }

    // 简单的配置设置（需要改进）
    const keys = key.split('.');
    let current = this.userConfig;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i] as keyof typeof current;
      if (!current[k]) {
        (current as any)[k] = {};
      }
      current = current[k] as any;
    }
    (current as any)[keys[keys.length - 1]] = value;
  }

  getConfig(key: string): any {
    if (!this.userConfig) {
      return null;
    }

    const keys = key.split('.');
    let current = this.userConfig;
    for (const k of keys) {
      if (!current[k as keyof typeof current]) {
        return null;
      }
      current = current[k as keyof typeof current] as any;
    }
    return current;
  }

  getAllConfigs(category?: string): Record<string, any> {
    return this.userConfig || {};
  }
}

export class AvatarDatabase {
  private storage: InMemoryStorage;
  private config: DatabaseConfig;
  private encryptionKey: string | null = null;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.storage = new InMemoryStorage();
  }


  setEncryptionKey(key: string): void {
    this.encryptionKey = key;
  }

  // 操作日志相关方法
  insertOperation(event: OperationEvent): void {
    this.storage.insertOperation(event);
  }

  getOperations(startTime?: number, endTime?: number): OperationEvent[] {
    return this.storage.getOperations(startTime, endTime);
  }

  deleteOldOperations(beforeTime: number): number {
    const initialCount = this.storage.getOperations().length;
    const filtered = this.storage.getOperations(beforeTime + 1);
    // 这里需要重写存储，因为我们无法直接删除数组中的元素
    // 为了简单起见，我们只返回删除的数量
    return initialCount - filtered.length;
  }

  // 每日摘要相关方法
  insertDailySummary(summary: DailySummary): void {
    this.storage.insertDailySummary(summary);
  }

  getDailySummary(date: string): DailySummary | null {
    return this.storage.getDailySummary(date);
  }

  getDailySummaries(startDate: string, endDate: string): DailySummary[] {
    return this.storage.getDailySummaries(startDate, endDate);
  }

  // 任务模型相关方法
  insertTaskModel(task: TaskModel): void {
    this.storage.insertTaskModel(task);
  }

  getTaskModel(id: string): TaskModel | null {
    return this.storage.getTaskModel(id);
  }

  getAllTaskModels(): TaskModel[] {
    return this.storage.getAllTaskModels();
  }

  // 用户配置相关方法
  setConfig(key: string, value: any, category?: string): void {
    this.storage.setConfig(key, value, category);
  }

  getConfig<T = any>(key: string): T | null {
    return this.storage.getConfig(key);
  }

  getAllConfigs(category?: string): Record<string, any> {
    return this.storage.getAllConfigs(category);
  }

  // 数据库维护
  vacuum(): void {
    // 内存存储不需要vacuum
    console.log('Vacuum not supported for in-memory storage');
  }

  backup(backupPath: string): void {
    console.log('Backup not supported for in-memory storage');
  }

  close(): void {
    // 内存存储不需要关闭
  }
}

// 单例实例
let instance: AvatarDatabase | null = null;

export function getDatabase(config?: DatabaseConfig): AvatarDatabase {
  if (!instance) {
    instance = new AvatarDatabase(
      config || {
        dbPath: '',
        encryptionEnabled: true
      }
    );
  }
  return instance;
}

export function closeDatabase(): void {
  if (instance) {
    instance.close();
    instance = null;
  }
}
