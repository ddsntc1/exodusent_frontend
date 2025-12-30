import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVote } from '../App';
import { Option } from '../types';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const VotePage: React.FC = () => {
  const { addVote, hasVoted } = useVote();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = () => {
    if (!selectedOption) return;
    
    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      addVote(selectedOption);
      setIsSubmitting(false);
      navigate('/result');
    }, 800);
  };

  if (hasVoted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
        <div className="bg-green-100 p-4 rounded-full text-green-600 mb-6">
          <CheckCircle2 size={64} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">투표가 완료되었습니다!</h2>
        <p className="text-slate-600 mb-8 max-w-md">
          소중한 한 표 감사합니다. 실시간 결과를 확인해보세요.
        </p>
        <button
          onClick={() => navigate('/result')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          결과 보러가기 <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-slate-900 mb-4">
          점심 메뉴 결정전
        </h1>
        <p className="text-lg text-slate-600">
          당신의 선택은? 짜장면 vs 짬뽕
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-12">
        {/* Jajangmyeon Card */}
        <button
          onClick={() => setSelectedOption('jajang')}
          className={`group relative overflow-hidden rounded-2xl transition-all duration-300 border-4 text-left h-80 flex flex-col justify-end p-8 ${
            selectedOption === 'jajang'
              ? 'border-slate-800 shadow-2xl scale-[1.02]'
              : 'border-transparent shadow-lg hover:shadow-xl hover:scale-[1.01] bg-white'
          }`}
        >
          <div className="absolute inset-0 bg-slate-900 transition-opacity duration-300 opacity-90 group-hover:opacity-100" />
          {/* Abstract Pattern / Image Placeholder */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center" />
          
          <div className="relative z-10">
            <div className={`w-8 h-8 rounded-full border-2 mb-4 flex items-center justify-center ${
              selectedOption === 'jajang' ? 'bg-white border-white text-slate-900' : 'border-white/50 text-transparent'
            }`}>
              {selectedOption === 'jajang' && <CheckCircle2 size={20} />}
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">짜장면</h3>
            <p className="text-slate-300 font-medium">
              달콤하고 짭짤한 춘장의 유혹. <br/>
              남녀노소 누구나 좋아하는 그 맛.
            </p>
          </div>
        </button>

        {/* Jjamppong Card */}
        <button
          onClick={() => setSelectedOption('jjamppong')}
          className={`group relative overflow-hidden rounded-2xl transition-all duration-300 border-4 text-left h-80 flex flex-col justify-end p-8 ${
            selectedOption === 'jjamppong'
              ? 'border-red-600 shadow-2xl scale-[1.02]'
              : 'border-transparent shadow-lg hover:shadow-xl hover:scale-[1.01] bg-white'
          }`}
        >
          <div className="absolute inset-0 bg-red-600 transition-opacity duration-300 opacity-90 group-hover:opacity-100" />
          {/* Abstract Pattern / Image Placeholder */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center" />

          <div className="relative z-10">
            <div className={`w-8 h-8 rounded-full border-2 mb-4 flex items-center justify-center ${
              selectedOption === 'jjamppong' ? 'bg-white border-white text-red-600' : 'border-white/50 text-transparent'
            }`}>
              {selectedOption === 'jjamppong' && <CheckCircle2 size={20} />}
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">짬뽕</h3>
            <p className="text-red-100 font-medium">
              얼큰하고 시원한 국물의 전율. <br/>
              해장과 식사를 동시에 해결.
            </p>
          </div>
        </button>
      </div>

      <button
        onClick={handleVote}
        disabled={!selectedOption || isSubmitting}
        className={`w-full max-w-md py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg ${
          !selectedOption
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : isSubmitting
            ? 'bg-orange-400 text-white cursor-wait'
            : 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-orange-500/30 transform hover:-translate-y-1'
        }`}
      >
        {isSubmitting ? '투표 반영 중...' : selectedOption ? '투표하기' : '메뉴를 선택해주세요'}
      </button>
    </div>
  );
};

export default VotePage;