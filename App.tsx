import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { VoteContextType, VoteCounts, Option } from './types';
import VotePage from './pages/VotePage';
import ResultPage from './pages/ResultPage';
import { UtensilsCrossed, BarChart3 } from 'lucide-react';

// Context for managing vote state across pages (simulating backend)
const VoteContext = createContext<VoteContextType | undefined>(undefined);

export const useVote = () => {
  const context = useContext(VoteContext);
  if (!context) {
    throw new Error('useVote must be used within a VoteProvider');
  }
  return context;
};

const VoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with some mock data to make the result page look interesting
  const [votes, setVotes] = useState<VoteCounts>({
    jajang: 142,
    jjamppong: 128,
  });
  const [hasVoted, setHasVoted] = useState(false);

  const addVote = (option: Option) => {
    setVotes((prev) => ({
      ...prev,
      [option]: prev[option] + 1,
    }));
    setHasVoted(true);
  };

  return (
    <VoteContext.Provider value={{ votes, addVote, hasVoted }}>
      {children}
    </VoteContext.Provider>
  );
};

const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/vote" className="flex items-center gap-2">
              <div className="bg-orange-500 p-2 rounded-lg text-white">
                <UtensilsCrossed size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">Noodle Battle</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/vote"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/vote') 
                  ? 'bg-orange-50 text-orange-600' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              투표하기
            </Link>
            <Link
              to="/result"
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/result') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 size={16} />
              실시간 결과
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} Noodle Battle. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <VoteProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/vote" element={<VotePage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/" element={<Navigate to="/vote" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </VoteProvider>
  );
};

export default App;