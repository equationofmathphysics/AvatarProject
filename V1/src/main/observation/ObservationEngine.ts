import { ScreenCaptureModule, getScreenCaptureModule } from './ScreenCapture';
import { ActionRecorderModule, getActionRecorderModule } from './ActionRecorder';
import { OperationEvent, CapturedFrame, ObservationEngineConfig } from '@/shared/types';

export class ObservationEngine {
  private screenCapture: ScreenCaptureModule;
  private actionRecorder: ActionRecorderModule;
  private config: ObservationEngineConfig;

  constructor(config: Partial<ObservationEngineConfig> = {}) {
    this.config = this.getDefaultConfig(config);
    this.screenCapture = getScreenCaptureModule(this.config.screenCapture);
    this.actionRecorder = getActionRecorderModule();
    this.setupEventHandlers();
  }

  private getDefaultConfig(partial: Partial<ObservationEngineConfig>): ObservationEngineConfig {
    return {
      screenCapture: {
        enabled: true,
        interval: 3000,
        quality: 0.8,
        maxResolution: '1920x1080',
        ...partial.screenCapture
      },
      actionRecording: {
        enabled: true,
        captureMouse: true,
        captureKeyboard: true,
        sensitiveDataFilter: true,
        ...partial.actionRecording
      },
      storage: {
        maxMemorySize: 512,
        flushInterval: 60000,
        ...partial.storage
      }
    };
  }

  private setupEventHandlers(): void {
    // 监听操作事件
    this.actionRecorder.onEvent(event => {
      this.handleOperationEvent(event);
    });

    // 监听屏幕捕获
    this.screenCapture.onFrame(frame => {
      this.handleFrameCapture(frame);
    });
  }

  private handleOperationEvent(event: OperationEvent): void {
    console.log('Operation event received:', event.description);
    // 这里可以添加更多事件处理逻辑
    this.saveEventToDatabase(event);
  }

  private handleFrameCapture(frame: CapturedFrame): void {
    console.log('Frame captured at:', new Date(frame.timestamp).toLocaleTimeString());
    // 这里可以添加更多帧处理逻辑
    this.processFrameOCR(frame);
  }

  private async saveEventToDatabase(event: OperationEvent): Promise<void> {
    // 这里是数据存储的占位方法
    // 实际应该存储到SQLite数据库
    try {
      console.log('Saving event to database:', event.id);
    } catch (error) {
      console.error('Failed to save event to database:', error);
    }
  }

  private async processFrameOCR(frame: CapturedFrame): Promise<void> {
    // 这里是OCR处理的占位方法
    // 实际应该使用Tesseract等OCR引擎
    try {
      console.log('Processing OCR for frame');
    } catch (error) {
      console.error('OCR processing failed:', error);
    }
  }

  async start(): Promise<void> {
    console.log('Starting observation engine...');

    if (this.config.screenCapture.enabled) {
      await this.screenCapture.start();
    }

    if (this.config.actionRecording.enabled) {
      this.actionRecorder.start();
    }

    console.log('Observation engine started');
  }

  stop(): void {
    console.log('Stopping observation engine...');

    this.screenCapture.stop();
    this.actionRecorder.stop();

    console.log('Observation engine stopped');
  }

  async pause(): Promise<void> {
    this.stop();
    console.log('Observation engine paused');
  }

  isActive(): boolean {
    return (
      (this.config.screenCapture.enabled && this.screenCapture.isActive) ||
      (this.config.actionRecording.enabled && this.actionRecorder.isActive)
    );
  }

  updateConfig(newConfig: Partial<ObservationEngineConfig>): void {
    this.config = this.getDefaultConfig({ ...this.config, ...newConfig });
    console.log('Configuration updated');
  }

  getConfig(): ObservationEngineConfig {
    return { ...this.config };
  }

  getEvents(startTime?: number, endTime?: number) {
    return this.actionRecorder.getEvents(startTime, endTime);
  }

  getRecentFrames(limit?: number) {
    return this.screenCapture.getRecentFrames(limit);
  }
}

// 单例实例
let instance: ObservationEngine | null = null;

export function getObservationEngine(config?: Partial<ObservationEngineConfig>): ObservationEngine {
  if (!instance) {
    instance = new ObservationEngine(config);
  }
  return instance;
}

export function initializeObservationEngine(
  config?: Partial<ObservationEngineConfig>
): ObservationEngine {
  instance = new ObservationEngine(config);
  return instance;
}
