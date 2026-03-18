import { CapturedFrame } from '@/shared/types';
import { v4 as uuidv4 } from 'uuid';

export interface ScreenCaptureConfig {
  captureInterval: number;
  quality: number;
  maxResolution: string;
}

export class ScreenCaptureModule {
  private config: ScreenCaptureConfig;
  private isRunning: boolean = false;
  private captureTimer: NodeJS.Timeout | null = null;
  private frameCallbacks: ((frame: CapturedFrame) => void)[] = [];
  private recentFrames: CapturedFrame[] = [];
  private maxRecentFrames: number = 100;

  constructor(config: ScreenCaptureConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.captureTimer = setInterval(() => {
      this.captureCurrentFrame().catch(console.error);
    }, this.config.captureInterval);

    console.log('Screen capture started');
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    if (this.captureTimer) {
      clearInterval(this.captureTimer);
      this.captureTimer = null;
    }

    console.log('Screen capture stopped');
  }

  private async captureCurrentFrame(): Promise<void> {
    try {
      // 根据平台使用不同的捕获方法
      const frame = await this.platformCaptureFrame();

      // 添加到最近帧历史
      this.recentFrames.unshift(frame);
      if (this.recentFrames.length > this.maxRecentFrames) {
        this.recentFrames.pop();
      }

      // 通知回调
      for (const callback of this.frameCallbacks) {
        callback(frame);
      }
    } catch (error) {
      console.error('Screen capture failed:', error);
    }
  }

  private async platformCaptureFrame(): Promise<CapturedFrame> {
    // 占位实现，实际需要根据平台实现
    const width = 1920;
    const height = 1080;

    // 模拟捕获一个简单的缓冲区
    const buffer = Buffer.from('');

    // 实际应该调用系统API获取屏幕内容
    const frame: CapturedFrame = {
      id: uuidv4(),
      timestamp: Date.now(),
      buffer,
      width,
      height,
      windowTitle: this.getCurrentWindowTitle(),
      application: this.getCurrentApplication()
    };

    return frame;
  }

  private getCurrentWindowTitle(): string {
    // 占位实现，实际需要根据平台获取当前窗口标题
    return '无标题窗口';
  }

  private getCurrentApplication(): string {
    // 占位实现，实际需要根据平台获取当前应用程序
    return '未知应用';
  }

  getRecentFrames(limit?: number): CapturedFrame[] {
    if (!limit || limit > this.recentFrames.length) {
      return [...this.recentFrames];
    }
    return this.recentFrames.slice(0, limit);
  }

  onFrame(callback: (frame: CapturedFrame) => void): void {
    this.frameCallbacks.push(callback);
  }

  offFrame(callback: (frame: CapturedFrame) => void): void {
    const index = this.frameCallbacks.indexOf(callback);
    if (index !== -1) {
      this.frameCallbacks.splice(index, 1);
    }
  }

  get isActive(): boolean {
    return this.isRunning;
  }
}

// 单例实例
let instance: ScreenCaptureModule | null = null;

export function getScreenCaptureModule(
  config: ScreenCaptureConfig = {
    captureInterval: 3000,
    quality: 0.8,
    maxResolution: '1920x1080'
  }
): ScreenCaptureModule {
  if (!instance) {
    instance = new ScreenCaptureModule(config);
  }
  return instance;
}
