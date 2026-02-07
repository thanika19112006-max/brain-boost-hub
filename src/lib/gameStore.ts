// Game Store - LocalStorage utilities for Brain Games

export interface UserProfile {
  name: string;
  createdAt: string;
  gamesPlayed: number;
}

export interface GameScore {
  game: string;
  score: number;
  level: number;
  date: string;
  details?: string;
}

export interface DailyChallenge {
  date: string;
  game: string;
  completed: boolean;
  score?: number;
}

const STORAGE_KEYS = {
  PROFILE: 'brainboost_profile',
  SCORES: 'brainboost_scores',
  DAILY: 'brainboost_daily',
  SOUND: 'brainboost_sound',
} as const;

// Profile Management
export const getProfile = (): UserProfile | null => {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return data ? JSON.parse(data) : null;
};

export const saveProfile = (profile: UserProfile): void => {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
};

export const createProfile = (name: string): UserProfile => {
  const profile: UserProfile = {
    name,
    createdAt: new Date().toISOString(),
    gamesPlayed: 0,
  };
  saveProfile(profile);
  return profile;
};

export const updateGamesPlayed = (): void => {
  const profile = getProfile();
  if (profile) {
    profile.gamesPlayed += 1;
    saveProfile(profile);
  }
};

// Score Management
export const getScores = (): GameScore[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SCORES);
  return data ? JSON.parse(data) : [];
};

export const saveScore = (score: Omit<GameScore, 'date'>): void => {
  const scores = getScores();
  scores.push({ ...score, date: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores));
  updateGamesPlayed();
};

export const getBestScore = (game: string): number => {
  const scores = getScores().filter(s => s.game === game);
  return scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;
};

export const getRecentScores = (limit = 10): GameScore[] => {
  return getScores()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

// Daily Challenge
export const getDailyChallenge = (): DailyChallenge | null => {
  const data = localStorage.getItem(STORAGE_KEYS.DAILY);
  if (!data) return null;
  const challenge: DailyChallenge = JSON.parse(data);
  // Check if it's still today
  const today = new Date().toDateString();
  if (new Date(challenge.date).toDateString() !== today) {
    return null;
  }
  return challenge;
};

const GAMES = ['BrainMaze', 'MemoryFlip+', 'ThinkFast', 'ReflexIQ', 'WordBend'];

export const generateDailyChallenge = (): DailyChallenge => {
  const today = new Date().toDateString();
  const existingChallenge = getDailyChallenge();
  if (existingChallenge) return existingChallenge;
  
  // Use date as seed for consistent daily game
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const gameIndex = dayOfYear % GAMES.length;
  
  const challenge: DailyChallenge = {
    date: new Date().toISOString(),
    game: GAMES[gameIndex],
    completed: false,
  };
  localStorage.setItem(STORAGE_KEYS.DAILY, JSON.stringify(challenge));
  return challenge;
};

export const completeDailyChallenge = (score: number): void => {
  const challenge = getDailyChallenge();
  if (challenge) {
    challenge.completed = true;
    challenge.score = score;
    localStorage.setItem(STORAGE_KEYS.DAILY, JSON.stringify(challenge));
  }
};

// Sound Settings
export const getSoundEnabled = (): boolean => {
  const data = localStorage.getItem(STORAGE_KEYS.SOUND);
  return data !== null ? JSON.parse(data) : true;
};

export const setSoundEnabled = (enabled: boolean): void => {
  localStorage.setItem(STORAGE_KEYS.SOUND, JSON.stringify(enabled));
};

// Sound Effects (simple beep generator)
export const playSound = (type: 'success' | 'error' | 'click' | 'complete'): void => {
  if (!getSoundEnabled()) return;
  
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  const frequencies: Record<string, number[]> = {
    success: [523, 659, 784],
    error: [200, 150],
    click: [800],
    complete: [523, 659, 784, 1047],
  };
  
  const freqs = frequencies[type];
  const duration = type === 'complete' ? 0.15 : 0.1;
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  
  freqs.forEach((freq, i) => {
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + i * duration);
  });
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + freqs.length * duration);
};
