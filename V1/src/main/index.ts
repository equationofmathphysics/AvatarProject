// 这是一个临时的模拟文件，用于UI预览
// 实际的Electron主进程会在后续实现

console.log('This is a placeholder for Electron main process');
console.log('For UI preview, please use the renderer directly');

export {};

// 全局变量
let mainWindow: BrowserWindow | null = null;
let observationEngine: ObservationEngine | null = null;
let database: AvatarDatabase | null = null;

// 开发环境检测
const isDev = process.env.NODE_ENV === 'development';

// 应用菜单项
const menuTemplate = [
  {
    label: '文件',
    submenu: [
      {
        label: '导出数据',
        click: () => mainWindow?.webContents.send('export-data')
      },
      {
        label: '导入数据',
        click: () => mainWindow?.webContents.send('import-data')
      },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: '查看',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: '帮助',
    submenu: [
      {
        label: '文档',
        click: () => shell.openExternal('https://github.com/avatar-project')
      },
      {
        label: '问题反馈',
        click: () => shell.openExternal('https://github.com/avatar-project/issues')
      },
      { type: 'separator' },
      { role: 'about' }
    ]
  }
];

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // 创建主窗口
  mainWindow = new BrowserWindow({
    width: Math.floor(width * 0.85),
    height: Math.floor(height * 0.85),
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      devTools: isDev
    },
    icon: path.join(__dirname, '../resources/icons/icon.png'),
    show: false, // 先不显示，等加载完成后再显示
    backgroundColor: '#f8fafc'
  });

  // 加载HTML文件
  if (isDev) {
    // 开发模式加载本地服务器
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式加载本地文件
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // 窗口准备好后显示
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  // 窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 窗口大小调整事件
  mainWindow.on('resize', () => {
    // 可以在这里处理响应式布局
  });

  // 设置菜单
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // 窗口事件监听
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

// 应用程序准备好后创建窗口
app.whenReady().then(() => {
  console.log('Avatar Project starting...');

  // 初始化核心模块
  initializeCoreModules();

  // 创建主窗口
  createWindow();

  // 系统托盘（可选）
  // setupTray();
});

// 窗口全部关闭时退出应用程序
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// macOS 应用程序激活时重新创建窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 应用程序即将退出时的清理
app.on('before-quit', () => {
  console.log('Shutting down Avatar Project...');

  // 停止观察引擎
  if (observationEngine) {
    observationEngine.stop();
  }

  // 关闭数据库
  if (database) {
    // 如果需要清理数据库资源
  }
});

// 初始化核心模块
function initializeCoreModules() {
  try {
    // 初始化观察引擎
    observationEngine = getObservationEngine();

    // 初始化数据库
    database = getDatabase();

    console.log('Core modules initialized successfully');
  } catch (error) {
    console.error('Failed to initialize core modules:', error);
  }
}

// 启动观察引擎
ipcMain.handle('start-observation', async () => {
  try {
    if (!observationEngine) {
      observationEngine = getObservationEngine();
    }

    await observationEngine.start();
    console.log('Observation engine started');
    return { success: true, message: '观察引擎已启动' };
  } catch (error) {
    console.error('Failed to start observation engine:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
});

// 停止观察引擎
ipcMain.handle('stop-observation', async () => {
  try {
    if (observationEngine) {
      observationEngine.stop();
      console.log('Observation engine stopped');
      return { success: true, message: '观察引擎已停止' };
    }
    return { success: false, error: '观察引擎未初始化' };
  } catch (error) {
    console.error('Failed to stop observation engine:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
});

// 获取观察引擎状态
ipcMain.handle('get-observation-status', async () => {
  try {
    if (observationEngine) {
      const isActive = observationEngine.isActive();
      const config = observationEngine.getConfig();

      return {
        success: true,
        data: {
          isActive,
          config
        }
      };
    }

    return {
      success: false,
      error: '观察引擎未初始化'
    };
  } catch (error) {
    console.error('Failed to get observation status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
});

// 获取操作日志
ipcMain.handle('get-operations', async (event, { startTime, endTime }) => {
  try {
    if (observationEngine) {
      const operations = observationEngine.getEvents(startTime, endTime);
      return {
        success: true,
        data: operations
      };
    }
    return { success: false, error: '观察引擎未初始化' };
  } catch (error) {
    console.error('Failed to get operations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
});

// 导出数据
ipcMain.handle('export-data', async () => {
  try {
    // 这里是数据导出逻辑
    const data = {
      operations: observationEngine?.getEvents() || [],
      config: observationEngine?.getConfig(),
      exportedAt: new Date().toISOString(),
      version: app.getVersion()
    };

    return { success: true, data };
  } catch (error) {
    console.error('Failed to export data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
});

// 导入数据
ipcMain.handle('import-data', async (event, data) => {
  try {
    // 这里是数据导入逻辑
    console.log('Data import received');
    return { success: true, message: '数据导入成功' };
  } catch (error) {
    console.error('Failed to import data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
});

// 系统信息
ipcMain.handle('get-system-info', async () => {
  try {
    const info = {
      os: process.platform,
      arch: os.arch(),
      platform: process.platform,
      platformVersion: os.release(),
      version: app.getVersion(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpuUsage: process.getCPUUsage(),
      uptime: os.uptime()
    };

    return { success: true, data: info };
  } catch (error) {
    console.error('Failed to get system info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
});

// 主进程入口点
if (require.main === module) {
  // 防止应用程序在调试模式下被多个实例同时运行
  if (!app.requestSingleInstanceLock()) {
    app.quit();
  } else {
    app.on('second-instance', () => {
      // 如果用户尝试打开第二个实例，我们就聚焦到主窗口
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    });
  }
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  // 可以在这里添加错误报告机制
  // 例如：向服务器发送错误报告，或者显示错误对话框
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

// 日志记录
console.log('Avatar Project main process loaded');
console.log(`Platform: ${os.platform()} ${os.arch()}`);
console.log(`Version: ${app.getVersion()}`);
console.log(`Node: ${process.version}`);
