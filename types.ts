export interface PollOption {
  id: number;
  label: string;
}

export interface Poll {
  id: number;
  title: string;
  description: string;
  options: PollOption[];
}

export interface PollResultItem {
  optionId: number;
  label: string;
  count: number;
}

export interface PollResults {
  pollId: number;
  totalVotes: number;
  results: PollResultItem[];
}

export type VoteAction = 'created' | 'updated' | 'canceled';

export interface VoteResponse {
  voteId: number;
  pollId: number;
  optionId: number;
  voterToken: string;
  action: VoteAction;
}

export interface VoteContextType {
  poll: Poll | null;
  results: PollResults | null;
  isLoading: boolean;
  error: string | null;
  refreshResults: () => Promise<void>;
  vote: (optionId: number) => Promise<VoteResponse>;
  voterToken: string | null;
  lastVotedOptionId: number | null;
  setLastVotedOptionId: (optionId: number | null) => void;
  setResults: Dispatch<SetStateAction<PollResults | null>>;
}
import type { Dispatch, SetStateAction } from 'react';
