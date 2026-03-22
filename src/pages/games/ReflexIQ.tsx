import { useState, useEffect, useCallback, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { saveScore, playSound } from '@/lib/gameStore';
import { Trophy, Zap, Timer } from 'lucide-react';

type GameState = 'waiting' | 'countdown' | 'ready' | 'clicked' | 'early' | 'result';

const ReflexIQ = () => {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(1);
  const [reactions, setReactions] = useState<number[]>([]);
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const TOTAL_ROUNDS = 5;

  const startRound = useCallback(() => {
    setGameState('countdown');
    setReactionTime(null);
    
    // Random delay between 1.5 and 4 seconds (shorter at higher levels)
    const minDelay = Math.max(1000, 2000 - level * 200);
    const maxDelay = Math.max(2500, 4000 - level * 300);
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    
    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      startTimeRef.current = performance.now();
      playSound('click');
    }, delay);
  }, [level]);

  const handleClick = () => {
    if (gameState === 'waiting') {
      startRound();
      return;
    }
    
    if (gameState === 'countdown') {
      // Clicked too early!
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setGameState('early');
      playSound('error');
      setReactionTime(null);
      
      setTimeout(() => {
        if (round < TOTAL_ROUNDS) {
          setRound(prev => prev + 1);
          setGameState('waiting');
        } else {
          finishGame();
        }
      }, 1500);
      return;
    }
    
    if (gameState === 'ready') {
      const endTime = performance.now();
      const time = Math.round(endTime - startTimeRef.current);
      setReactionTime(time);
      setReactions(prev => [...prev, time]);
      setGameState('clicked');
      
      if (!bestTime || time < bestTime) {
        setBestTime(time);
      }
      
      // Calculate points (faster = more points)
      const basePoints = Math.max(0, 500 - time);
      const levelBonus = level * 20;
      const points = Math.max(10, Math.round(basePoints + levelBonus));
      setScore(prev => prev + points);
      
      playSound('success');
      
      setTimeout(() => {
        if (round < TOTAL_ROUNDS) {
          setRound(prev => prev + 1);
          setGameState('waiting');
        } else {
          finishGame();
        }
      }, 1500);
    }
  };

  const finishGame = () => {
    setGameOver(true);
    setGameState('result');
    playSound('complete');
    
    if (score > 0) {
      saveScore({ 
        game: 'ReflexIQ', 
        score, 
        level,
        details: bestTime ? `Best: ${bestTime}ms` : undefined
      });
    }
  };

  const handleRestart = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setLevel(1);
    setRound(1);
    setReactions([]);
    setScore(0);
    setBestTime(null);
    setGameOver(false);
    setReactionTime(null);
    setGameState('waiting');
  };

  const nextLevel = () => {
    setLevel(prev => prev + 1);
    setRound(1);
    setReactions([]);
    setGameOver(false);
    setReactionTime(null);
    setGameState('waiting');
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getAverageTime = () => {
    if (reactions.length === 0) return null;
    return Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length);
  };

  const getZoneClass = () => {
    switch (gameState) {
      case 'ready':
        return 'ready';
      case 'early':
        return 'early';
      default:
        return 'waiting';
    }
  };

  const getZoneText = () => {
    switch (gameState) {
      case 'waiting':
        return 'Click to Start';
      case 'countdown':
        return 'Wait...';
      case 'ready':
        return 'CLICK!';
      case 'clicked':
        return `${reactionTime}ms`;
      case 'early':
        return 'Too Early!';
      default:
        return '';
    }
  };

  return (
    <GameLayout
      title="ReflexIQ"
      score={score}
      level={level}
      onRestart={handleRestart}
      showTimer={false}
      customStats={
        <>
          <div className="score-display">
            Round: {round}/{TOTAL_ROUNDS}
          </div>
          {bestTime && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-orange/20 border border-neon-orange">
              <Timer className="w-4 h-4 text-neon-orange" />
              <span className="font-orbitron text-neon-orange text-sm">Best: {bestTime}ms</span>
            </div>
          )}
        </>
      }
    >
      <div className="flex flex-col items-center gap-6">
        {/* Instructions */}
        <p className="text-muted-foreground font-rajdhani text-center max-w-md">
          Click the circle when it turns <span className="text-neon-lime">GREEN</span>.
          <br />
          Don't click too early – watch out for fake triggers!
        </p>

        {/* Reaction Zone */}
        {!gameOver && (
          <button
            onClick={handleClick}
            className={`reaction-zone ${getZoneClass()}`}
            style={{
              boxShadow: gameState === 'ready' 
                ? '0 0 50px hsl(var(--neon-lime)), 0 0 100px hsl(var(--neon-lime) / 0.5)' 
                : gameState === 'early'
                ? '0 0 50px hsl(var(--destructive))'
                : 'none',
            }}
          >
            {gameState === 'ready' && <Zap className="w-12 h-12 animate-pulse" />}
            {gameState !== 'ready' && <span>{getZoneText()}</span>}
          </button>
        )}

        {/* Recent Times */}
        {reactions.length > 0 && !gameOver && (
          <div className="flex gap-2 flex-wrap justify-center">
            {reactions.map((time, i) => (
              <div
                key={i}
                className={`px-3 py-1 rounded-lg text-sm font-orbitron ${
                  time === bestTime
                    ? 'bg-neon-orange/20 text-neon-orange border border-neon-orange'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {time}ms
              </div>
            ))}
          </div>
        )}

        {/* Game Over Modal */}
        {gameOver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-lg">
            <div className="bg-card border-2 border-neon-orange rounded-2xl p-8 max-w-md w-full mx-4 animate-scale-in text-center">
              <Trophy className="w-16 h-16 text-neon-orange mx-auto mb-4" />
              <h2 className="font-orbitron text-2xl font-bold text-foreground mb-2">Results</h2>
              <div className="text-muted-foreground font-rajdhani mb-6 space-y-3">
                <p className="text-3xl font-orbitron text-primary">{score} pts</p>
                {getAverageTime() && (
                  <p>Average: <span className="text-foreground font-bold">{getAverageTime()}ms</span></p>
                )}
                {bestTime && (
                  <p>Best: <span className="text-neon-orange font-bold">{bestTime}ms</span></p>
                )}
                <p>Valid clicks: {reactions.length}/{TOTAL_ROUNDS}</p>
              </div>
              
              {/* Reaction Rating */}
              <div className="mb-6 p-4 rounded-xl bg-muted">
                <p className="font-orbitron text-lg">
                  {bestTime && bestTime < 200 ? '⚡ Lightning Fast!' :
                   bestTime && bestTime < 250 ? '🔥 Great Reflexes!' :
                   bestTime && bestTime < 300 ? '👍 Good Job!' :
                   '💪 Keep Practicing!'}
                </p>
              </div>
              
              <div className="flex gap-3 justify-center">
                <button onClick={handleRestart} className="neon-button text-sm">
                  Try Again
                </button>
                <button onClick={nextLevel} className="neon-button neon-button-magenta text-sm">
                  Next Level
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default ReflexIQ;
