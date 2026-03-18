import { OperationEvent } from '@/shared/types';
import { v4 as uuidv4 } from 'uuid';
import activeWin from 'active-win';

export class ActionRecorderModule {
  private isRunning: boolean = false;
  private eventCallbacks: ((event: OperationEvent) => void)[] = [];
  private events: OperationEvent[] = [];
  private maxEventHistory: number = 10000;

  constructor() {
    this.setupEventListeners();
  }

  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    console.log('Action recorder started');
  }

  stop(): void {
    this.isRunning = false;
    console.log('Action recorder stopped');
  }

  private setupEventListeners(): void {
    // 监听系统级事件（实际需要根据平台实现）
    // 这里使用占位方法
    this.simulateEventsForTesting();
  }

  private simulateEventsForTesting(): void {
    // 用于开发测试的事件模拟
    const eventTypes: OperationEvent['eventType'][] = [
      'window_switch',
      'app_launch',
      'app_close',
      'file_operation',
      'url_change',
      'mouse_click',
      'key_stroke'
    ];

    const applications = [
      'Visual Studio Code',
      'Google Chrome',
      'Notion',
      'Slack',
      'Terminal',
      'System Settings'
    ];

    // 每5秒模拟一个事件
    setInterval(() => {
      if (!this.isRunning) {
        return;
      }

      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const application = applications[Math.floor(Math.random() * applications.length)];

      const event = this.createEvent(eventType, application);
      this.recordEvent(event);
    }, 5000);
  }

  private createEvent(
    eventType: OperationEvent['eventType'],
    application: string
  ): OperationEvent {
    const event: OperationEvent = {
      id: uuidv4(),
      timestamp: Date.now(),
      eventType,
      application,
      windowTitle: this.getWindowTitle(application),
      description: this.getEventDescription(eventType, application)
    };

    // 根据事件类型添加额外信息
    if (eventType === 'url_change') {
      event.url = this.getRandomUrl();
    } else if (eventType === 'file_operation') {
      event.filePath = this.getRandomFilePath();
    }

    return event;
  }

  private getWindowTitle(application: string): string {
    if (application === 'Visual Studio Code') {
      return 'Avatar Project - main.tsx - Visual Studio Code';
    } else if (application === 'Google Chrome') {
      return 'GitHub - avatar-project · GitHub - Google Chrome';
    } else if (application === 'Notion') {
      return '产品设计文档 - Notion';
    } else if (application === 'Slack') {
      return '工作群 - Slack';
    } else if (application === 'Terminal') {
      return 'bash - 80x24';
    }

    return '无标题';
  }

  private getEventDescription(eventType: string, application: string): string {
    const descriptions: Record<string, string> = {
      window_switch: `切换到 ${application}`,
      app_launch: `启动 ${application}`,
      app_close: `关闭 ${application}`,
      file_operation: `在 ${application} 中操作文件`,
      url_change: `在 ${application} 中访问新页面`,
      mouse_click: `在 ${application} 中点击`,
      key_stroke: `在 ${application} 中输入内容`
    };

    return descriptions[eventType] || '未知操作';
  }

  private getRandomUrl(): string {
    const domains = ['github.com', 'stackoverflow.com', 'notion.so', 'slack.com'];
    return `https://${domains[Math.floor(Math.random() * domains.length)]}`;
  }

  private getRandomFilePath(): string {
    const extensions = ['.ts', '.tsx', '.js', '.json', '.md'];
    const directories = ['src/main', 'src/renderer', 'src/shared', 'docs'];
    return `~/Documents/projects/avatar/${
      directories[Math.floor(Math.random() * directories.length)]
    }/file${extensions[Math.floor(Math.random() * extensions.length)]}`;
  }

  private recordEvent(event: OperationEvent): void {
    // 过滤敏感信息
    const filteredEvent = this.filterSensitiveData(event);

    // 添加到事件列表
    this.events.unshift(filteredEvent);
    if (this.events.length > this.maxEventHistory) {
      this.events.pop();
    }

    // 通知回调
    for (const callback of this.eventCallbacks) {
      callback(filteredEvent);
    }

    console.log('Recorded event:', filteredEvent.description);
  }

  private filterSensitiveData(event: OperationEvent): OperationEvent {
    // 这里可以添加更多的敏感信息过滤逻辑
    const filtered = { ...event };

    // 移除可能包含敏感信息的字段
    if (filtered.filePath && (filtered.filePath.includes('secret') || filtered.filePath.includes('password'))) {
      filtered.filePath = '[Sensitive Data]';
    }

    return filtered;
  }

  getEvents(startTime?: number, endTime?: number): OperationEvent[] {
    let filteredEvents = [...this.events];

    if (startTime !== undefined) {
      filteredEvents = filteredEvents.filter(event => event.timestamp >= startTime);
    }

    if (endTime !== undefined) {
      filteredEvents = filteredEvents.filter(event => event.timestamp <= endTime);
    }

    return filteredEvents;
  }

  onEvent(callback: (event: OperationEvent) => void): void {
    this.eventCallbacks.push(callback);
  }

  offEvent(callback: (event: OperationEvent) => void): void {
    const index = this.eventCallbacks.indexOf(callback);
    if (index !== -1) {
      this.eventCallbacks.splice(index, 1);
    }
  }

  async getCurrentWindow(): Promise<{ application: string; windowTitle?: string } | null> {
    try {
      const result = await activeWin();
      if (result) {
        return {
          application: result.owner.name || '未知应用',
          windowTitle: result.title
        };
      }
    } catch (error) {
      console.error('Failed to get active window:', error);
    }

    return null;
  }

  get isActive(): boolean {
    return this.isRunning;
  }
}

// 单例实例
let instance: ActionRecorderModule | null = null;

export function getActionRecorderModule(): ActionRecorderModule {
  if (!instance) {
    instance = new ActionRecorderModule();
  }
  return instance;
}
