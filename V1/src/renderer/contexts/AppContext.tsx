import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  OperationEvent,
  DailySummary,
  UserConfig,
  TaskModel
} from '@/shared/types';

interface AppContextType {
  // 观察引擎状态
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;

  // 数据
  operations: OperationEvent[];
  dailySummaries: DailySummary[];
  taskModels: TaskModel[];

  // 操作
  addOperation: (event: OperationEvent) => void;
  clearOperations: () => void;
  generateDailySummary: (date: string) => Promise<DailySummary>;
  refreshData: () => Promise<void>;

  // 用户配置
  userConfig: UserConfig;
  updateConfig: <K extends keyof UserConfig>(key: K, value: UserConfig[K]) => void;
  saveConfig: () => Promise<void>;

  // 数据导出/导入
  exportData: () => Promise<void>;
  importData: (data: any) => Promise<void>;
}

const defaultUserConfig: UserConfig = {
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

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [operations, setOperations] = useState<OperationEvent[]>([]);
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [taskModels, setTaskModels] = useState<TaskModel[]>([]);
  const [userConfig, setUserConfig] = useState<UserConfig>(defaultUserConfig);

  // 初始化加载数据
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // 模拟加载一些测试数据
      const testOperations = generateTestOperations();
      setOperations(testOperations);

      // 模拟加载用户配置
      const savedConfig = localStorage.getItem('avatar-config');
      if (savedConfig) {
        setUserConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const generateTestOperations = (): OperationEvent[] => {
    const testData: OperationEvent[] = [];
    const now = Date.now();
    const eventTypes = [
      'window_switch',
      'app_launch',
      'file_operation',
      'url_change',
      'mouse_click',
      'key_stroke'
    ] as const;

    const applications = [
      'Visual Studio Code',
      'Google Chrome',
      'Notion',
      'Slack',
      'Terminal',
      'System Settings'
    ];

    for (let i = 0; i < 50; i++) {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const application = applications[Math.floor(Math.random() * applications.length)];

      testData.push({
        id: `test-op-${i}`,
        timestamp: now - (i * 30000), // 每30秒一个事件
        eventType,
        application,
        windowTitle: getWindowTitle(application),
        description: getDescription(eventType, application),
        url: eventType === 'url_change' ? 'https://github.com' : undefined,
        filePath: eventType === 'file_operation' ? '/home/user/documents/report.md' : undefined
      });
    }

    return testData;
  };

  const getWindowTitle = (app: string) => {
    switch (app) {
      case 'Visual Studio Code':
        return 'Avatar Project - main.tsx - Visual Studio Code';
      case 'Google Chrome':
        return 'GitHub - avatar-project · GitHub - Google Chrome';
      case 'Notion':
        return '产品设计文档 - Notion';
      case 'Slack':
        return '工作群 - Slack';
      default:
        return '无标题窗口';
    }
  };

  const getDescription = (eventType: string, app: string) => {
    switch (eventType) {
      case 'window_switch':
        return `切换到 ${app}`;
      case 'app_launch':
        return `启动 ${app}`;
      case 'file_operation':
        return `在 ${app} 中操作文件`;
      case 'url_change':
        return `在 ${app} 中访问新页面`;
      case 'mouse_click':
        return `在 ${app} 中点击`;
      case 'key_stroke':
        return `在 ${app} 中输入内容`;
      default:
        return '未知操作';
    }
  };

  const startRecording = async () => {
    setIsRecording(true);
    console.log('Started recording');
  };

  const stopRecording = () => {
    setIsRecording(false);
    console.log('Stopped recording');
  };

  const addOperation = (event: OperationEvent) => {
    setOperations(prev => [event, ...prev]);
  };

  const clearOperations = () => {
    setOperations([]);
  };

  const generateDailySummary = async (date: string): Promise<DailySummary> => {
    // 模拟生成日报
    const summary: DailySummary = {
      id: `summary-${date}`,
      date,
      totalWorkTime: 8 * 3600, // 8小时
      applicationBreakdown: [
        { appName: 'Visual Studio Code', duration: 4 * 3600, percentage: 50, launchCount: 12 },
        { appName: 'Google Chrome', duration: 2 * 3600, percentage: 25, launchCount: 8 },
        { appName: 'Notion', duration: 1.5 * 3600, percentage: 18.75, launchCount: 5 },
        { appName: 'Slack', duration: 0.5 * 3600, percentage: 6.25, launchCount: 15 }
      ],
      taskStatistics: [
        { taskName: '编写代码', count: 23, totalDuration: 3 * 3600, avgDuration: 470 },
        { taskName: '阅读文档', count: 12, totalDuration: 2 * 3600, avgDuration: 600 },
        { taskName: '写周报', count: 1, totalDuration: 1 * 3600, avgDuration: 3600 },
        { taskName: '团队沟通', count: 8, totalDuration: 1 * 3600, avgDuration: 450 }
      ],
      efficiencyScore: 75.5,
      autoSummary: `今天是高效的一天！您主要使用了 Visual Studio Code 进行开发工作，总共编写了约 4 小时的代码。在 Google Chrome 中花费了 2 小时查阅资料和文档，这是一个很好的学习过程。在 Notion 中整理了 1.5 小时的项目笔记，有助于知识沉淀。\n\n建议：可以尝试将一些重复性的操作自动化，这样可以节省更多时间用于创造性工作。`,
      repeatedPatterns: [
        {
          name: '启动开发环境',
          description: '每天上午 10 点左右启动 VS Code 和 Chrome',
          count: 5,
          sampleOperations: []
        },
        {
          name: '代码审查',
          description: '每次提交代码前都会在 Chrome 中打开 GitHub 页面',
          count: 12,
          sampleOperations: []
        }
      ],
      createdAt: Date.now()
    };

    setDailySummaries(prev => [...prev, summary]);
    return summary;
  };

  const refreshData = async () => {
    await loadInitialData();
  };

  const updateConfig = <K extends keyof UserConfig>(
    key: K,
    value: UserConfig[K]
  ) => {
    setUserConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveConfig = async () => {
    try {
      localStorage.setItem('avatar-config', JSON.stringify(userConfig));
      alert('配置已保存！');
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('保存配置失败');
    }
  };

  const exportData = async () => {
    try {
      const data = {
        operations,
        dailySummaries,
        userConfig,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `avatar-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败');
    }
  };

  const importData = async (data: any) => {
    try {
      if (data.operations) {
        setOperations(data.operations);
      }
      if (data.dailySummaries) {
        setDailySummaries(data.dailySummaries);
      }
      if (data.userConfig) {
        setUserConfig(data.userConfig);
      }

      alert('数据导入成功！');
    } catch (error) {
      console.error('Import failed:', error);
      alert('导入失败');
    }
  };

  const value: AppContextType = {
    isRecording,
    startRecording,
    stopRecording,
    operations,
    dailySummaries,
    taskModels,
    addOperation,
    clearOperations,
    generateDailySummary,
    refreshData,
    userConfig,
    updateConfig,
    saveConfig,
    exportData,
    importData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
