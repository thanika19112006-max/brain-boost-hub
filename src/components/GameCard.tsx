import { Link } from 'react-router-dom';
import { LucideIcon, Trophy } from 'lucide-react';
import { getBestScore } from '@/lib/gameStore';

interface GameCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color: 'cyan' | 'magenta' | 'lime' | 'orange' | 'purple';
  delay?: number;
}

const colorClasses = {
  cyan: {
    border: 'hover:border-neon-cyan',
    text: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    glow: 'group-hover:shadow-[0_0_30px_hsl(185,100%,50%,0.3)]',
  },
  magenta: {
    border: 'hover:border-neon-magenta',
    text: 'text-neon-magenta',
    bg: 'bg-neon-magenta/10',
    glow: 'group-hover:shadow-[0_0_30px_hsl(315,100%,60%,0.3)]',
  },
  lime: {
    border: 'hover:border-neon-lime',
    text: 'text-neon-lime',
    bg: 'bg-neon-lime/10',
    glow: 'group-hover:shadow-[0_0_30px_hsl(120,100%,50%,0.3)]',
  },
  orange: {
    border: 'hover:border-neon-orange',
    text: 'text-neon-orange',
    bg: 'bg-neon-orange/10',
    glow: 'group-hover:shadow-[0_0_30px_hsl(25,100%,55%,0.3)]',
  },
  purple: {
    border: 'hover:border-neon-purple',
    text: 'text-neon-purple',
    bg: 'bg-neon-purple/10',
    glow: 'group-hover:shadow-[0_0_30px_hsl(270,100%,65%,0.3)]',
  },
};

const GameCard = ({ title, description, icon: Icon, path, color, delay = 0 }: GameCardProps) => {
  const colors = colorClasses[color];
  const bestScore = getBestScore(title);

  return (
    <Link
      to={path}
      className={`game-card group ${colors.border} ${colors.glow} opacity-0 animate-slide-up`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Icon */}
      <div className={`w-16 h-16 rounded-xl ${colors.bg} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
        <Icon className={`w-8 h-8 ${colors.text}`} />
      </div>

      {/* Content */}
      <h3 className={`font-orbitron font-bold text-xl mb-2 ${colors.text} transition-all duration-300`}>
        {title}
      </h3>
      <p className="text-muted-foreground font-rajdhani text-sm leading-relaxed mb-4">
        {description}
      </p>

      {/* Best Score */}
      {bestScore > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Trophy className="w-4 h-4 text-neon-orange" />
          <span className="font-rajdhani">Best: {bestScore}</span>
        </div>
      )}

      {/* Play Button Hint */}
      <div className={`mt-4 py-2 px-4 rounded-lg border ${colors.text} border-current opacity-0 group-hover:opacity-100 transition-all duration-300 text-center text-sm font-orbitron`}>
        Play Now
      </div>
    </Link>
  );
};

export default GameCard;
