import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../contexts/AppContext';
import { DailySummary } from '@/shared/types';

const DailyReport: React.FC = () => {
  const { dailySummaries, generateDailySummary } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [isGenerating, setIsGenerating] = useState(false);

  const summary = dailySummaries.find(
    (s) => s.date === selectedDate
  ) || null;

  // 生成日报
  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      await generateDailySummary(selectedDate);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${minutes}分钟`;
  };

  // 计算任务统计
  const getTaskStatistics = () => {
    if (!summary) return null;

    const taskStats = summary.taskStatistics;
    return taskStats.map((stat: any) => (
      <div key={stat.taskName} className="flex items-center justify-between p-2">
        <span className="text-sm text-gray-700">{stat.taskName}</span>
        <span className="text-sm font-medium">{stat.count}次</span>
      </div>
    ));
  };

  // 获取应用使用饼图数据
  const getAppUsageData = () => {
    if (!summary) return null;

    const totalTime = summary.totalWorkTime;

    return summary.applicationBreakdown.map((app: any) => ({
      name: app.appName,
      percentage: (app.duration / totalTime) * 100,
      duration: app.duration,
      color: getRandomColor()
    }));
  };

  // 获取随机颜色
  const getRandomColor = () => {
    const colors = [
      '#3b82f6',
      '#8b5cf6',
      '#ec4899',
      '#f59e0b',
      '#10b981',
      '#06b6d4',
      '#ef4444',
      '#6366f1'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">
              选择日期:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={dayjs().format('YYYY-MM-DD')}
              className="input max-w-[200px]"
            />
          </div>

          <button
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            className="btn btn-primary flex items-center space-x-2"
          >
            {isGenerating ? (
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
                <span>生成中...</span>
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>生成日报</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 日报内容 */}
      {summary ? (
        <div className="space-y-6">
          {/* 概览卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card card-hover">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-2xl">⏱️</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">总工作时长</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatTime(summary.totalWorkTime)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card card-hover">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-2xl">📈</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">效率得分</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.efficiencyScore.toFixed(1)}/100
                  </p>
                </div>
              </div>
            </div>

            <div className="card card-hover">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-2xl">🎯</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">任务数量</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.taskStatistics.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 自动摘要 */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">自动工作摘要</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              {summary.autoSummary}
            </p>
          </div>

          {/* 应用使用分布 */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">应用使用分布</h3>
            {getAppUsageData() ? (
              <div className="space-y-4">
                {getAppUsageData()?.map((app) => (
                  <div key={app.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: app.color }}
                      />
                      <span className="text-sm text-gray-700">{app.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${app.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {app.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📱</div>
                <p>没有应用使用数据</p>
              </div>
            )}
          </div>

          {/* 任务统计 */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">任务统计</h3>
            {getTaskStatistics() ? (
              <div className="border rounded-lg divide-y divide-gray-200">
                {getTaskStatistics()}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📊</div>
                <p>没有任务统计数据</p>
              </div>
            )}
          </div>

          {/* 重复模式 */}
          {summary.repeatedPatterns.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">重复工作模式</h3>
              <div className="space-y-4">
                {summary.repeatedPatterns.map((pattern: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 bg-yellow-50">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-yellow-600 text-lg">🔄</span>
                      <h4 className="font-medium text-gray-900">
                        {pattern.name}
                      </h4>
                      <span className="badge badge-yellow">
                        {pattern.count}次
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{pattern.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-semibold mb-2">未找到当天的工作日报</h3>
          <p className="text-gray-600 mb-4">
            我们需要生成{selectedDate}的工作日报。
          </p>
          <button
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            className="btn btn-primary"
          >
            {isGenerating ? '生成中...' : '生成日报'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DailyReport;
