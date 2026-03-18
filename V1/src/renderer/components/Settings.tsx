import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { UserConfig } from '@/shared/types';

const Settings: React.FC = () => {
  const { userConfig, updateConfig, saveConfig, exportData, importData } = useAppContext();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  // 更新配置
  const handleUpdateConfig = (key: keyof UserConfig, value: any) => {
    updateConfig(key, value);
  };

  // 导出数据
  const handleExport = async () => {
    setExporting(true);
    try {
      await exportData();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  // 导入数据
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImporting(true);
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            await importData(data);
          } catch (error) {
            console.error('Import failed:', error);
          } finally {
            setImporting(false);
          }
        };
        reader.readAsText(file);
      } catch (error) {
        console.error('Import failed:', error);
        setImporting(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 观察引擎配置 */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span>观察引擎配置</span>
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={userConfig.observation.enabled}
                onChange={(e) =>
                  handleUpdateConfig('observation', {
                    ...userConfig.observation,
                    enabled: e.target.checked
                  })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">启用观察引擎</span>
            </label>
          </div>

          {userConfig.observation.enabled && (
            <div className="pl-6 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    屏幕捕获间隔 (毫秒)
                  </label>
                  <input
                    type="number"
                    value={userConfig.observation.captureInterval}
                    onChange={(e) =>
                      handleUpdateConfig('observation', {
                        ...userConfig.observation,
                        captureInterval: parseInt(e.target.value)
                      })
                    }
                    min="1000"
                    max="60000"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    屏幕捕获质量
                  </label>
                  <input
                    type="number"
                    value={userConfig.observation.screenQuality}
                    onChange={(e) =>
                      handleUpdateConfig('observation', {
                        ...userConfig.observation,
                        screenQuality: parseFloat(e.target.value)
                      })
                    }
                    min="0.1"
                    max="1"
                    step="0.1"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最大分辨率
                </label>
                <select
                  value={userConfig.observation.maxResolution}
                  onChange={(e) =>
                    handleUpdateConfig('observation', {
                      ...userConfig.observation,
                      maxResolution: e.target.value
                    })
                  }
                  className="select"
                >
                  <option value="1920x1080">1920x1080</option>
                  <option value="1280x720">1280x720</option>
                  <option value="1024x768">1024x768</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 学习引擎配置 */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>学习引擎配置</span>
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={userConfig.learning.enabled}
                onChange={(e) =>
                  handleUpdateConfig('learning', {
                    ...userConfig.learning,
                    enabled: e.target.checked
                  })
                }
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">启用学习引擎</span>
            </label>
          </div>

          {userConfig.learning.enabled && (
            <div className="pl-6 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  历史记录保留天数
                </label>
                <input
                  type="number"
                  value={userConfig.learning.maxHistoryDays}
                  onChange={(e) =>
                    handleUpdateConfig('learning', {
                      ...userConfig.learning,
                      maxHistoryDays: parseInt(e.target.value)
                    })
                  }
                  min="1"
                  max="365"
                  className="input"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={userConfig.learning.autoUpdatePatterns}
                    onChange={(e) =>
                      handleUpdateConfig('learning', {
                        ...userConfig.learning,
                        autoUpdatePatterns: e.target.checked
                      })
                    }
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">自动更新模式</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 执行引擎配置 */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>执行引擎配置</span>
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={userConfig.execution.enabled}
                onChange={(e) =>
                  handleUpdateConfig('execution', {
                    ...userConfig.execution,
                    enabled: e.target.checked
                  })
                }
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">启用执行引擎</span>
            </label>
          </div>

          {userConfig.execution.enabled && (
            <div className="pl-6 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最大并发任务数
                  </label>
                  <input
                    type="number"
                    value={userConfig.execution.maxConcurrency}
                    onChange={(e) =>
                      handleUpdateConfig('execution', {
                        ...userConfig.execution,
                        maxConcurrency: parseInt(e.target.value)
                      })
                    }
                    min="1"
                    max="10"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    任务超时时间 (秒)
                  </label>
                  <input
                    type="number"
                    value={userConfig.execution.timeout}
                    onChange={(e) =>
                      handleUpdateConfig('execution', {
                        ...userConfig.execution,
                        timeout: parseInt(e.target.value)
                      })
                    }
                    min="10"
                    max="300"
                    className="input"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={userConfig.execution.autoConfirm}
                    onChange={(e) =>
                      handleUpdateConfig('execution', {
                        ...userConfig.execution,
                        autoConfirm: e.target.checked
                      })
                    }
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">自动确认执行</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 数据管理 */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 12v10"
            />
          </svg>
          <span>数据管理</span>
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="btn btn-primary flex items-center justify-center space-x-2"
            >
              {exporting ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>导出中...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>导出数据</span>
                </>
              )}
            </button>

            <div className="relative">
              <input
                type="file"
                id="importFile"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <button
                onClick={() => document.getElementById('importFile')?.click()}
                disabled={importing}
                className="btn btn-secondary w-full flex items-center justify-center space-x-2"
              >
                {importing ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    />
                    <span>导入中...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    />
                    <span>导入数据</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 界面配置 */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-pink-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          />
          <span>界面配置</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              主题
            </label>
            <select
              value={userConfig.ui.theme}
              onChange={(e) =>
                handleUpdateConfig('ui', {
                  ...userConfig.ui,
                  theme: e.target.value as 'light' | 'dark' | 'system'
                })
              }
              className="select"
            >
              <option value="light">浅色</option>
              <option value="dark">深色</option>
              <option value="system">跟随系统</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              语言
            </label>
            <select
              value={userConfig.ui.language}
              onChange={(e) =>
                handleUpdateConfig('ui', {
                  ...userConfig.ui,
                  language: e.target.value as 'zh-CN' | 'en'
                })
              }
              className="select"
            >
              <option value="zh-CN">简体中文</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={userConfig.ui.showTrayIcon}
                onChange={(e) =>
                  handleUpdateConfig('ui', {
                    ...userConfig.ui,
                    showTrayIcon: e.target.checked
                  })
                }
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">显示系统托盘图标</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={userConfig.ui.startOnBoot}
                onChange={(e) =>
                  handleUpdateConfig('ui', {
                    ...userConfig.ui,
                    startOnBoot: e.target.checked
                  })
                }
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">开机自动启动</span>
            </label>
          </div>
        </div>
      </div>

      {/* 保存设置 */}
      <div className="flex justify-end">
        <button
          onClick={saveConfig}
          className="btn btn-primary"
        >
          保存设置
        </button>
      </div>
    </div>
  );
};

export default Settings;
