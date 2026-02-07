import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface GameLayoutProps {
  title: string;
  children: ReactNode;
  score?: number;
  level?: number;
  timer?: number;
  onRestart?: () => void;
  showTimer?: boolean;
  customStats?: ReactNode;
}

const GameLayout = ({
  title,
  children,
  score,
  level,
  timer,
  onRestart,
  showTimer = true,
  customStats,
}: GameLayoutProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="p-2 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-primary transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-orbitron text-2xl md:text-3xl font-bold text-foreground">
              {title}
            </h1>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-4 flex-wrap">
            {customStats}
            
            {level !== undefined && (
              <div className="score-display">
                Level: {level}
              </div>
            )}
            
            {score !== undefined && (
              <div className="score-display">
                Score: {score}
              </div>
            )}
            
            {showTimer && timer !== undefined && (
              <div className="timer-display">
                {formatTime(timer)}
              </div>
            )}

            {onRestart && (
              <button
                onClick={onRestart}
                className="p-3 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-primary transition-all"
                title="Restart Game"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Game Area */}
        <div className="flex justify-center">
          {children}
        </div>
      </main>
    </div>
  );
};

export default GameLayout;
