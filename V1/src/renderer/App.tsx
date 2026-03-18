import React, { useState, useEffect } from 'react';
import WorkTimeline from './components/WorkTimeline';
import DailyReport from './components/DailyReport';
import Settings from './components/Settings';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { useAppContext } from './contexts/AppContext';
import { AppProvider } from './contexts/AppContext';

type ViewMode = 'timeline' | 'report' | 'patterns' | 'settings';

const AppContent: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isRecording, startRecording, stopRecording } = useAppContext();

  const renderContent = () => {
    switch (viewMode) {
      case 'timeline':
        return <WorkTimeline />;
      case 'report':
        return <DailyReport />;
      case 'patterns':
        return <PatternsView />;
      case 'settings':
        return <Settings />;
      default:
        return <WorkTimeline />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        isRecording={isRecording}
        onToggleRecording={() => isRecording ? stopRecording() : startRecording()}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <Sidebar viewMode={viewMode} setViewMode={setViewMode} />
        )}

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto animate-in">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

const PatternsView: React.FC = () => {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">工作模式识别</h2>
      <p className="text-gray-600">
        这里会显示系统识别到的重复性工作模式。
      </p>
      <div className="mt-6 text-center text-gray-500">
        <div className="text-6xl mb-4">🔍</div>
        <p>功能开发中...</p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
