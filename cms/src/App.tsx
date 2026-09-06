import React, { useState, useEffect } from 'react';
import { Sidebar, CmsTab } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { ShowList } from './pages/ShowList';
import { PublishDashboard } from './pages/PublishDashboard';
import { Login } from './pages/Login';

export const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('peblo_token'));
  const [activeTab, setActiveTab] = useState<CmsTab>('catalogue');

  useEffect(() => {
    const handleAuthExpired = () => {
      setToken(null);
    };
    window.addEventListener('auth_expired', handleAuthExpired);
    return () => window.removeEventListener('auth_expired', handleAuthExpired);
  }, []);

  if (!token) {
    return <Login onLoginSuccess={() => setToken(localStorage.getItem('peblo_token'))} />;
  }

  return (
    <div className="min-h-screen bg-[#090b14] text-slate-100 flex font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Left Sidebar matching Image 5 */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={() => setToken(null)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#090b14] overflow-y-auto">
        {/* Top Header matching Image 5 */}
        <TopHeader />

        <main className="flex-1">
          {activeTab === 'catalogue' && <ShowList />}
          {activeTab === 'episodes' && <ShowList />}
          {activeTab === 'publish' && (
            <PublishDashboard onNavigateToEntity={() => setActiveTab('catalogue')} />
          )}
          {activeTab === 'assets' && (
            <div className="p-8 max-w-4xl mx-auto space-y-4">
              <h2 className="text-xl font-bold text-white">Asset Library</h2>
              <p className="text-xs text-slate-400">
                Browse stored posters, banners, and episodic thumbnails served by the Pebble CDN/Storage layer.
              </p>
              <ShowList />
            </div>
          )}
          {activeTab === 'localization' && (
            <div className="p-8 max-w-4xl mx-auto space-y-4">
              <h2 className="text-xl font-bold text-white">Localization Desk (EN / HI)</h2>
              <p className="text-xs text-slate-400">
                Configure episode language variants, title translations, and multi-track audio descriptors.
              </p>
              <ShowList />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
