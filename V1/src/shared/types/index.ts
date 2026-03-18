// 操作事件类型定义
export interface OperationEvent {
  id: string;
  timestamp: number;
  eventType: 'window_switch' | 'app_launch' | 'app_close' | 'file_operation' | 'url_change' | 'mouse_click' | 'key_stroke';
  application: string;
  windowTitle?: string;
  url?: string;
  filePath?: string;
  description: string;
  metadata?: Record<string, any>;
}

// 屏幕捕获帧定义
export interface CapturedFrame {
  id: string;
  timestamp: number;
  buffer: Buffer;
  width: number;
  height: number;
  windowTitle?: string;
  application?: string;
  ocrText?: string;
}

// 任务模型定义
export interface TaskModel {
  id: string;
  name: string;
  description: string;
  triggerCondition: string;
  inputSource: string[];
  outputTarget: string[];
  standardFlow: TaskStep[];
  decisionPoints: DecisionPoint[];
  confidence: number;
  learnedCount: number;
  lastUpdated: number;
  tags: string[];
}

// 任务步骤
export interface TaskStep {
  id: string;
  order: number;
  action: string;
  description: string;
  expectedResult?: string;
  timeout?: number;
}

// 决策点
export interface DecisionPoint {
  id: string;
  position: number;
  question: string;
  options: DecisionOption[];
  defaultChoice?: string;
}

export interface DecisionOption {
  id: string;
  label: string;
  description: string;
  nextStepId?: string;
}

// 每日摘要
export interface DailySummary {
  id: string;
  date: string;
  totalWorkTime: number; // 秒
  applicationBreakdown: AppUsage[];
  taskStatistics: TaskStat[];
  efficiencyScore: number; // 0-100
  autoSummary: string;
  repeatedPatterns: RepeatedPattern[];
  createdAt: number;
}

export interface AppUsage {
  appName: string;
  duration: number; // 秒
  percentage: number;
  launchCount: number;
}

export interface TaskStat {
  taskName: string;
  count: number;
  totalDuration: number;
  avgDuration: number;
}

export interface RepeatedPattern {
  name: string;
  description: string;
  count: number;
  sampleOperations: OperationEvent[];
}

// 用户配置
export interface UserConfig {
  observation: {
    enabled: boolean;
    captureInterval: number; // 毫秒
    screenQuality: number; // 0-1
    maxResolution: string;
    includeMouseMovement: boolean;
    privacyModeApps: string[];
    privacyModeUrls: string[];
  };
  learning: {
    enabled: boolean;
    maxHistoryDays: number;
    autoUpdatePatterns: boolean;
  };
  execution: {
    enabled: boolean;
    maxConcurrency: number;
    timeout: number;
    autoConfirm: boolean;
    authorizedTasks: string[];
  };
  data: {
    encryptionEnabled: boolean;
    autoBackup: boolean;
    backupInterval: number; // 小时
    maxStorageSize: number; // MB
  };
  ui: {
    theme: 'light' | 'dark' | 'system';
    language: 'zh-CN' | 'en';
    showTrayIcon: boolean;
    startOnBoot: boolean;
  };
}

// 执行相关类型
export interface ExecutionRequest {
  taskId: string;
  taskName: string;
  parameters?: Record<string, any>;
  confirmationRequired: boolean;
}

export interface ExecutionResult {
  requestId: string;
  taskId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  startTime: number;
  endTime?: number;
  steps: ExecutionStep[];
  error?: string;
  finalOutput?: any;
}

export interface ExecutionStep {
  stepId: string;
  order: number;
  action: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: number;
  endTime?: number;
  result?: any;
  error?: string;
}

// 观察引擎配置
export interface ObservationEngineConfig {
  screenCapture: {
    enabled: boolean;
    interval: number;
    quality: number;
    maxResolution: string;
  };
  actionRecording: {
    enabled: boolean;
    captureMouse: boolean;
    captureKeyboard: boolean;
    sensitiveDataFilter: boolean;
  };
  storage: {
    maxMemorySize: number; // MB
    flushInterval: number; // 毫秒
  };
}

// 数据库相关类型
export interface DatabaseConfig {
  dbPath: string;
  encryptionEnabled: boolean;
  encryptionKey?: string;
}

// 平台特定类型
export type Platform = 'darwin' | 'win32' | 'linux';

// 系统信息
export interface SystemInfo {
  platform: Platform;
  platformVersion: string;
  arch: string;
  totalMemory: number;
  freeMemory: number;
  cpuUsage: number;
}
