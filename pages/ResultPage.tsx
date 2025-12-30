import React, { useMemo } from 'react';
import { useVote } from '../App';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Trophy, TrendingUp, Users } from 'lucide-react';

const ResultPage: React.FC = () => {
  const { votes } = useVote();

  const totalVotes = votes.jajang + votes.jjamppong;
  const jajangPercent = totalVotes === 0 ? 0 : Math.round((votes.jajang / totalVotes) * 100);
  const jjamppongPercent = totalVotes === 0 ? 0 : Math.round((votes.jjamppong / totalVotes) * 100);

  const chartData = useMemo(() => [
    { name: '짜장면', value: votes.jajang, color: '#1e293b' }, // slate-800
    { name: '짬뽕', value: votes.jjamppong, color: '#dc2626' }, // red-600
  ], [votes]);

  const winner = votes.jajang > votes.jjamppong 
    ? { name: '짜장면', color: 'text-slate-800', bg: 'bg-slate-100' }
    : votes.jjamppong > votes.jajang
    ? { name: '짬뽕', color: 'text-red-600', bg: 'bg-red-50' }
    : { name: '박빙!', color: 'text-orange-600', bg: 'bg-orange-50' };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-blue-600" />
            실시간 투표 현황
          </h1>
          <p className="text-slate-500 mt-2">
            현재까지 집계된 실시간 결과입니다.
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
            {votes.jajang !== votes.jjamppong && <Trophy size={24} />}
            {winner.name}
          </div>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all duration-500 ${winner.name === '짜장면' ? 'bg-slate-800' : winner.name === '짬뽕' ? 'bg-red-600' : 'bg-orange-400'}`} style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium text-slate-500">짜장면 득표</div>
            <div className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded">{jajangPercent}%</div>
          </div>
          <div className="text-3xl font-black text-slate-800 mb-1">{votes.jajang}</div>
          <div className="text-xs text-slate-400">Votes</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium text-slate-500">짬뽕 득표</div>
            <div className="text-xs font-bold bg-red-50 text-red-600 px-2 py-1 rounded">{jjamppongPercent}%</div>
          </div>
          <div className="text-3xl font-black text-red-600 mb-1">{votes.jjamppong}</div>
          <div className="text-xs text-slate-400">Votes</div>
        </div>
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
    </div>
  );
};

export default ResultPage;