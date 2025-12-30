import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { VoteContextType } from './types';
import VotePage from './pages/VotePage';
import ResultPage from './pages/ResultPage';
import { UtensilsCrossed, BarChart3 } from 'lucide-react';
import { getPoll, getResults, postVote } from './api';

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
  const [poll, setPoll] = useState<VoteContextType['poll']>(null);
  const [results, setResults] = useState<VoteContextType['results']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voterToken, setVoterToken] = useState<string | null>(null);
  const [lastVotedOptionId, setLastVotedOptionId] = useState<number | null>(null);

  const storageKeys = useMemo(() => {
    if (!poll) {
      return null;
    }
    return {
      token: `voterToken:${poll.id}`,
      lastOption: `votedOptionId:${poll.id}`,
    };
  }, [poll]);

  const hydrateLocalState = (pollId: number) => {
    if (typeof window === 'undefined') {
      return;
    }
    const token = window.localStorage.getItem(`voterToken:${pollId}`);
    const lastOptionRaw = window.localStorage.getItem(`votedOptionId:${pollId}`);
    const lastOption = lastOptionRaw ? Number(lastOptionRaw) : null;
    setVoterToken(token);
    setLastVotedOptionId(Number.isFinite(lastOption) ? lastOption : null);
  };

  const persistLocalState = useCallback((nextToken: string | null, nextOptionId: number | null) => {
    if (!storageKeys || typeof window === 'undefined') {
      return;
    }
    if (nextToken) {
      window.localStorage.setItem(storageKeys.token, nextToken);
    }
    if (nextOptionId === null) {
      window.localStorage.removeItem(storageKeys.lastOption);
    } else {
      window.localStorage.setItem(storageKeys.lastOption, String(nextOptionId));
    }
  }, [storageKeys]);

  const refreshResults = useCallback(async () => {
    setError(null);
    try {
      const nextResults = await getResults();
      setResults(nextResults);
      const nextPoll = await getPoll(nextResults.pollId);
      setPoll(nextPoll);
      hydrateLocalState(nextPoll.id);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : '투표 정보를 불러오지 못했습니다.');
      throw refreshError;
    }
  }, []);

  const vote = useCallback(async (optionId: number) => {
    if (!poll) {
      throw new Error('활성 투표가 없습니다.');
    }
    const response = await postVote(poll.id, optionId, voterToken);
    setVoterToken(response.voterToken);
    const nextOptionId = response.action === 'canceled' ? null : response.optionId;
    setLastVotedOptionId(nextOptionId);
    persistLocalState(response.voterToken, nextOptionId);
    await refreshResults();
    return response;
  }, [poll, voterToken, persistLocalState, refreshResults]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        await refreshResults();
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : '투표 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <VoteContext.Provider
      value={{
        poll,
        results,
        isLoading,
        error,
        refreshResults,
        vote,
        voterToken,
        lastVotedOptionId,
        setLastVotedOptionId,
        setResults,
      }}
    >
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
