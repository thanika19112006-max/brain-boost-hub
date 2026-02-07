import { Puzzle, Grid3X3, Calculator, Zap, Type } from 'lucide-react';
import Navbar from '@/components/Navbar';
import GameCard from '@/components/GameCard';
import DailyChallenge from '@/components/DailyChallenge';

const games = [
  {
    title: 'BrainMaze',
    description: 'Navigate through challenging mazes. Solve logic puzzles to unlock hidden paths and reach the goal.',
    icon: Puzzle,
    path: '/games/brain-maze',
    color: 'cyan' as const,
  },
  {
    title: 'MemoryFlip+',
    description: 'Classic card matching with a twist. Test your memory with increasing difficulty levels.',
    icon: Grid3X3,
    path: '/games/memory-flip',
    color: 'magenta' as const,
  },
  {
    title: 'ThinkFast',
    description: 'Race against time! Solve math and logic problems before the clock runs out.',
    icon: Calculator,
    path: '/games/think-fast',
    color: 'lime' as const,
  },
  {
    title: 'ReflexIQ',
    description: 'Test your reaction speed. Click only when the signal changes – beware of fake triggers!',
    icon: Zap,
    path: '/games/reflex-iq',
    color: 'orange' as const,
  },
  {
    title: 'WordBend',
    description: 'Decode distorted words. Letters are twisted, reversed, and scrambled – can you read them?',
    icon: Type,
    path: '/games/word-bend',
    color: 'purple' as const,
  },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-4xl md:text-5xl font-bold text-foreground mb-4 animate-slide-up">
            Game <span className="text-primary neon-text-cyan">Arena</span>
          </h1>
          <p className="text-muted-foreground font-rajdhani text-lg max-w-2xl mx-auto animate-slide-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            Choose your challenge and push your cognitive limits. Each game targets different areas of your brain.
          </p>
        </div>

        {/* Daily Challenge */}
        <div className="max-w-3xl mx-auto mb-12 animate-slide-up opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          <DailyChallenge />
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {games.map((game, index) => (
            <GameCard
              key={game.title}
              title={game.title}
              description={game.description}
              icon={game.icon}
              path={game.path}
              color={game.color}
              delay={400 + index * 100}
            />
          ))}
        </div>

        {/* Stats Hint */}
        <div className="text-center mt-16 animate-slide-up opacity-0" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
          <p className="text-muted-foreground font-rajdhani">
            Your progress is automatically saved. Visit your{' '}
            <a href="/profile" className="text-primary hover:underline">profile</a>
            {' '}to see your stats!
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
