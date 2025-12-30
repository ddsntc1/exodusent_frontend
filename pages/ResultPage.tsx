import React, { useEffect, useMemo, useState } from 'react';
import { useVote } from '../App';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Trophy, TrendingUp, Users } from 'lucide-react';
import { getWsUrl } from '../api';

const ResultPage: React.FC = () => {
  const { poll, results, isLoading, error, refreshResults, setResults } = useVote();
  const [wsError, setWsError] = useState<string | null>(null);

  const totalVotes = results?.totalVotes ?? 0;

  const chartData = useMemo(() => {
    if (!results) {
      return [];
    }
    const palette = ['#1e293b', '#dc2626', '#0ea5e9', '#16a34a', '#f97316'];
    return results.results.map((item, index) => ({
      name: item.label,
      value: item.count,
      color: palette[index % palette.length],
    }));
  }, [results]);

  const winner = useMemo(() => {
    if (!results || results.results.length === 0) {
      return { name: '집계 중', color: 'text-slate-500', bar: 'bg-slate-300' };
    }
    const maxCount = Math.max(...results.results.map((item) => item.count));
    const top = results.results.filter((item) => item.count === maxCount);
    if (top.length !== 1) {
      return { name: '박빙!', color: 'text-orange-600', bar: 'bg-orange-400' };
    }
    return { name: top[0].label, color: 'text-slate-800', bar: 'bg-slate-800' };
  }, [results]);

  useEffect(() => {
    refreshResults().catch(() => undefined);
  }, [refreshResults]);

  useEffect(() => {
    if (!results?.pollId) {
      return;
    }

    setWsError(null);
    const ws = new WebSocket(getWsUrl(results.pollId));
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'poll_results_updated') {
          setResults({
            pollId: data.pollId,
            totalVotes: data.totalVotes,
            results: data.results,
          });
        }
      } catch (parseError) {
        setWsError(parseError instanceof Error ? parseError.message : '실시간 메시지 처리 실패');
      }
    };
    ws.onerror = () => {
      setWsError('실시간 연결에 실패했습니다.');
    };

    return () => {
      ws.close();
    };
  }, [results?.pollId, setResults]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-slate-500">결과를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-slate-600">실시간 결과를 불러올 수 없습니다.</div>
        {error && <div className="text-sm text-slate-400 mt-2">{error}</div>}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-blue-600" />
            실시간 투표 현황
          </h1>
          <p className="text-slate-500 mt-2">
            {poll ? poll.title : '현재까지 집계된 실시간 결과입니다.'}
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2">
          <Users size={18} className="text-slate-400" />
          <span className="font-semibold text-slate-700">{totalVotes.toLocaleString()}명</span> 참여 중
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Statistics Cards */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="text-sm font-medium text-slate-500 mb-1">현재 1위</div>
          <div className={`text-2xl font-bold ${winner.color} flex items-center gap-2`}>
            {winner.name !== '박빙!' && winner.name !== '집계 중' && <Trophy size={24} />}
            {winner.name}
          </div>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all duration-500 ${winner.bar}`} style={{ width: '100%' }}></div>
          </div>
        </div>

        {results.results.slice(0, 2).map((item, index) => {
          const percent = totalVotes === 0 ? 0 : Math.round((item.count / totalVotes) * 100);
          const badge = index === 0 ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-600';
          const valueColor = index === 0 ? 'text-slate-800' : 'text-red-600';
          return (
            <div key={item.optionId} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium text-slate-500">{item.label} 득표</div>
                <div className={`text-xs font-bold px-2 py-1 rounded ${badge}`}>{percent}%</div>
              </div>
              <div className={`text-3xl font-black mb-1 ${valueColor}`}>{item.count}</div>
              <div className="text-xs text-slate-400">Votes</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 min-h-[400px]">
          <h2 className="text-lg font-bold text-slate-800 mb-6">투표 분포</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart Comparison */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 min-h-[400px]">
          <h2 className="text-lg font-bold text-slate-800 mb-6">상세 비교</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 14, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Live Indicator mock */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-full animate-pulse">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          실시간 집계 중
        </div>
      </div>

      {wsError && (
        <div className="mt-4 text-center text-xs text-slate-400">
          {wsError}
        </div>
      )}
    </div>
  );
};

export default ResultPage;
