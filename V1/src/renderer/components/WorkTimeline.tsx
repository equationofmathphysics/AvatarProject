import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../contexts/AppContext';

const WorkTimeline: React.FC = () => {
  const { operations } = useAppContext();
  const [filteredOperations, setFilteredOperations] = useState(operations);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('all');

  // 获取应用列表
  const applications = Array.from(new Set(operations.map(op => op.application)));

  // 过滤操作
  useEffect(() => {
    let filtered = operations;

    if (selectedApp) {
      filtered = filtered.filter(op => op.application === selectedApp);
    }

    if (timeRange === 'today') {
      const today = dayjs().startOf('day').valueOf();
      filtered = filtered.filter(op => op.timestamp >= today);
    } else if (timeRange === 'week') {
      const weekAgo = dayjs().subtract(7, 'days').valueOf();
      filtered = filtered.filter(op => op.timestamp >= weekAgo);
    }

    setFilteredOperations(filtered);
  }, [operations, selectedApp, timeRange]);

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const time = dayjs(timestamp);
    if (time.isSame(dayjs(), 'day')) {
      return time.format('HH:mm:ss');
    }
    return time.format('MM-DD HH:mm');
  };

  // 获取事件类型的图标
  const getEventIcon = (eventType: string) => {
    const icons = {
      'window_switch': '🔄',
      'app_launch': '🚀',
      'app_close': '❌',
      'file_operation': '📁',
      'url_change': '🌐',
      'mouse_click': '🖱️',
      'key_stroke': '⌨️'
    };

    return icons[eventType as keyof typeof icons] || '📋';
  };

  // 获取事件类型的颜色
  const getEventTypeColor = (eventType: string) => {
    const colors = {
      'window_switch': 'bg-blue-100 text-blue-700',
      'app_launch': 'bg-green-100 text-green-700',
      'app_close': 'bg-red-100 text-red-700',
      'file_operation': 'bg-yellow-100 text-yellow-700',
      'url_change': 'bg-purple-100 text-purple-700',
      'mouse_click': 'bg-cyan-100 text-cyan-700',
      'key_stroke': 'bg-orange-100 text-orange-700'
    };

    return colors[eventType as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* 筛选控制面板 */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              按应用过滤
            </label>
            <select
              value={selectedApp || ''}
              onChange={(e) => setSelectedApp(e.target.value || null)}
              className="select"
            >
              <option value="">所有应用</option>
              {applications.map((app) => (
                <option key={app} value={app}>
                  {app}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              时间范围
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="select"
            >
              <option value="all">全部</option>
              <option value="today">今天</option>
              <option value="week">本周</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px] flex items-end">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                操作数量: {filteredOperations.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 操作时间轴 */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">操作时间轴</h3>
          {filteredOperations.length === 0 && (
            <span className="text-sm text-gray-500">暂无数据</span>
          )}
        </div>

        {filteredOperations.length > 0 ? (
          <div className="space-y-4">
            {filteredOperations.map((op) => (
              <div
                key={op.id}
                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* 时间 */}
                <div className="flex-shrink-0 w-24 text-sm text-gray-500">
                  {formatTime(op.timestamp)}
                </div>

                {/* 图标和事件类型 */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm
                    ${getEventTypeColor(op.eventType)}
                  `}>
                    {getEventIcon(op.eventType)}
                  </div>
                </div>

                {/* 详细信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{op.description}</span>
                    <span className={`
                      badge text-xs
                      ${getEventTypeColor(op.eventType).replace('text-', 'text-')}
                    `}>
                      {op.eventType}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">应用:</span>
                      <span className="font-medium">{op.application}</span>
                    </div>

                    {op.windowTitle && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">窗口:</span>
                        <span className="font-medium truncate">{op.windowTitle}</span>
                      </div>
                    )}

                    {op.url && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">URL:</span>
                        <a
                          href={op.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {op.url}
                        </a>
                      </div>
                    )}

                    {op.filePath && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">文件:</span>
                        <span className="font-medium">{op.filePath}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📋</div>
            <p>没有找到匹配的操作记录</p>
            <p className="text-sm mt-1">请尝试调整筛选条件</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkTimeline;
