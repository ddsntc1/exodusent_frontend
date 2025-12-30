import { Poll, PollResults, VoteResponse } from './types';

const rawApiBase = import.meta.env.VITE_API_BASE_URL ?? '';
const API_BASE = rawApiBase.replace(/\/$/, '');

const buildUrl = (path: string) => {
  if (!path.startsWith('/')) {
    return `${API_BASE}/${path}`;
  }
  return `${API_BASE}${path}`;
};

const fetchJson = async <T,>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const getPoll = (pollId: number) => fetchJson<Poll>(`/polls/${pollId}`);

export const getResults = () => fetchJson<PollResults>('/polls/results');

export const postVote = (pollId: number, optionId: number, voterToken?: string | null) => {
  const payload = voterToken ? { optionId, voterToken } : { optionId };
  return fetchJson<VoteResponse>(`/polls/${pollId}/votes`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getWsUrl = (pollId: number) => {
  const rawWsBase = import.meta.env.VITE_WS_BASE_URL ?? '';
  const wsBase = rawWsBase.replace(/\/$/, '');
  const httpBase = API_BASE || window.location.origin;
  const resolvedBase = wsBase || httpBase.replace(/^http/, 'ws');
  return `${resolvedBase}/ws/polls/${pollId}`;
};
