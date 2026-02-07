import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Zap, Trophy, ArrowRight } from 'lucide-react';
import { generateDailyChallenge, DailyChallenge as DailyChallengeType } from '@/lib/gameStore';

const gameRoutes: Record<string, string> = {
  'BrainMaze': '/games/brain-maze',
  'MemoryFlip+': '/games/memory-flip',
  'ThinkFast': '/games/think-fast',
  'ReflexIQ': '/games/reflex-iq',
  'WordBend': '/games/word-bend',
};

const DailyChallenge = () => {
  const [challenge, setChallenge] = useState<DailyChallengeType | null>(null);

  useEffect(() => {
    setChallenge(generateDailyChallenge());
  }, []);

  if (!challenge) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-neon-orange bg-gradient-to-br from-neon-orange/10 via-card to-neon-magenta/10 p-6">
      {/* Animated Background Effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-neon-orange/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-neon-magenta/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-neon-orange/20">
            <Calendar className="w-6 h-6 text-neon-orange" />
          </div>
          <div>
            <h3 className="font-orbitron font-bold text-lg text-neon-orange">
              Daily Challenge
            </h3>
            <p className="text-muted-foreground text-sm font-rajdhani">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          {challenge.completed && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-neon-lime/20 text-neon-lime text-sm font-orbitron">
              <Trophy className="w-4 h-4" />
              Completed!
            </div>
          )}
        </div>

        {/* Challenge Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-neon-orange animate-pulse" />
            <div>
              <p className="font-rajdhani text-foreground">
                Today's Game:
              </p>
              <p className="font-orbitron font-bold text-xl text-foreground">
                {challenge.game}
              </p>
            </div>
          </div>

          <Link
            to={gameRoutes[challenge.game] || '/dashboard'}
            className="neon-button flex items-center gap-2 text-sm"
            style={{ borderColor: 'hsl(var(--neon-orange))', color: 'hsl(var(--neon-orange))' }}
          >
            {challenge.completed ? 'Play Again' : 'Start Challenge'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Score Display */}
        {challenge.completed && challenge.score !== undefined && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-muted-foreground text-sm font-rajdhani">
              Your Score: <span className="text-neon-orange font-bold">{challenge.score}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyChallenge;
