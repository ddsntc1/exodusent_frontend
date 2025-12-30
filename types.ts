export type Option = 'jajang' | 'jjamppong';

export interface VoteCounts {
  jajang: number;
  jjamppong: number;
}

export interface VoteContextType {
  votes: VoteCounts;
  addVote: (option: Option) => void;
  hasVoted: boolean;
}