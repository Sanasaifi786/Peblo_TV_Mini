import React, { useState, useEffect } from 'react';
import { CatalogueFile, CatalogueShow, catalogApi } from './api/catalog';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { ShowDetail } from './pages/ShowDetail';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'search'>('home');
  const [catalogue, setCatalogue] = useState<CatalogueFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string | undefined>();

  // Selected Show for detail modal
  const [selectedShow, setSelectedShow] = useState<CatalogueShow | null>(null);

  const fetchCatalog = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await catalogApi.getCatalogue();
      setCatalogue(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load streaming catalogue.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleNavigate = (view: 'home' | 'search', filter?: string) => {
    setCurrentView(view);
    setSearchFilter(filter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        activeFilter={searchFilter}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <Home
            catalogue={catalogue}
            isLoading={isLoading}
            error={error}
            onSelectShow={setSelectedShow}
            onRetry={fetchCatalog}
          />
        )}

        {currentView === 'search' && (
          <Search
            initialCatalogue={catalogue}
            onSelectShow={setSelectedShow}
            defaultFilter={searchFilter}
          />
        )}
      </main>

      {/* Show Detail Modal */}
      {selectedShow && (
        <ShowDetail
          show={selectedShow}
          onClose={() => setSelectedShow(null)}
        />
      )}

      {/* Footer matching Image 3 & Image 1 */}
      <footer className="border-t border-white/5 bg-[#080b13] py-8 px-4 sm:px-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/peblo-logo.png"
              alt="Peblo Kids Logo"
              className="w-6 h-6 object-contain"
            />
            <span className="font-bold text-slate-200">Peblo Kids</span>
            <span className="text-slate-500">© 2025 Safe Bedtime Co.</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <button className="hover:text-slate-200 transition-colors">Parental Controls</button>
            <button className="hover:text-slate-200 transition-colors">Sleep Timer</button>
            <button className="hover:text-slate-200 transition-colors">Bedtime Safe Mode</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
