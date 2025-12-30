import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVote } from '../App';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const VotePage: React.FC = () => {
  const { poll, isLoading, error, vote, lastVotedOptionId } = useVote();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedOption(lastVotedOptionId);
  }, [lastVotedOptionId]);

  const optionThemes = useMemo(
    () => [
      {
        borderSelected: 'border-slate-800',
        accent: 'bg-slate-900',
        text: 'text-white',
        subText: 'text-slate-300',
        image:
          "bg-[url('https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=800&auto=format&fit=crop')]",
      },
      {
        borderSelected: 'border-red-600',
        accent: 'bg-red-600',
        text: 'text-white',
        subText: 'text-red-100',
        image:
          "bg-[url('https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?q=80&w=800&auto=format&fit=crop')]",
      },
    ],
    []
  );

  const handleVote = async () => {
    if (selectedOption === null || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await vote(selectedOption);
      if (response.action === 'canceled') {
        setSelectedOption(null);
      } else {
        setSelectedOption(response.optionId);
      }
      navigate('/result');
    } catch (submitErr) {
      setSubmitError(submitErr instanceof Error ? submitErr.message : '투표 요청에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-slate-500">투표 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-slate-600">활성 투표 정보를 불러올 수 없습니다.</div>
        {error && <div className="text-sm text-slate-400 mt-2">{error}</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-slate-900 mb-4">
          {poll.title}
        </h1>
        <p className="text-lg text-slate-600">
          {poll.description}
        </p>
        {lastVotedOptionId !== null && (
          <p className="text-sm text-slate-400 mt-3">
            이미 투표했습니다. 다시 선택하면 변경되거나 취소됩니다.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-12">
        {poll.options.map((option, index) => {
          const theme = optionThemes[index] ?? {
            borderSelected: 'border-slate-700',
            accent: 'bg-slate-700',
            text: 'text-white',
            subText: 'text-slate-200',
            image: '',
          };
          const isSelected = selectedOption === option.id;

          return (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={`group relative overflow-hidden rounded-2xl transition-all duration-300 border-4 text-left h-72 flex flex-col justify-end p-8 ${
                isSelected
                  ? `${theme.borderSelected} shadow-2xl scale-[1.02]`
                  : 'border-transparent shadow-lg hover:shadow-xl hover:scale-[1.01] bg-white'
              }`}
            >
              <div className={`absolute inset-0 ${theme.accent} transition-opacity duration-300 opacity-90 group-hover:opacity-100`} />
              {theme.image && (
                <div className={`absolute inset-0 opacity-20 ${theme.image} bg-cover bg-center`} />
              )}

              <div className="relative z-10">
                <div
                  className={`w-8 h-8 rounded-full border-2 mb-4 flex items-center justify-center ${
                    isSelected ? 'bg-white border-white text-slate-900' : 'border-white/50 text-transparent'
                  }`}
                >
                  {isSelected && <CheckCircle2 size={20} />}
                </div>
                <h3 className={`text-3xl font-bold ${theme.text} mb-2`}>{option.label}</h3>
                <p className={`${theme.subText} font-medium`}>선택하면 투표가 반영됩니다.</p>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleVote}
        disabled={selectedOption === null || isSubmitting}
        className={`w-full max-w-md py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg ${
          selectedOption === null
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : isSubmitting
            ? 'bg-orange-400 text-white cursor-wait'
            : 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-orange-500/30 transform hover:-translate-y-1'
        }`}
      >
        {isSubmitting ? '투표 반영 중...' : selectedOption !== null ? '투표하기' : '메뉴를 선택해주세요'}
      </button>

      {submitError && (
        <div className="mt-4 text-sm text-red-500 text-center">{submitError}</div>
      )}

      {lastVotedOptionId !== null && (
        <button
          onClick={() => navigate('/result')}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md"
        >
          결과 보러가기 <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
};

export default VotePage;
