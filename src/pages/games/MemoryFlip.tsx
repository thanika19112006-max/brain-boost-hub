import { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { saveScore, playSound } from '@/lib/gameStore';
import { Trophy, RotateCcw } from 'lucide-react';

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const SYMBOLS = ['🧠', '⚡', '🎯', '🔮', '💎', '🚀', '🌟', '🎮', '🔥', '💡', '🎨', '🌈'];

const generateCards = (pairs: number): Card[] => {
  const selectedSymbols = SYMBOLS.slice(0, pairs);
  const cards: Card[] = [];
  
  selectedSymbols.forEach((symbol, index) => {
    cards.push({ id: index * 2, symbol, isFlipped: false, isMatched: false });
    cards.push({ id: index * 2 + 1, symbol, isFlipped: false, isMatched: false });
  });
  
  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  
  return cards;
};

const getLevelConfig = (level: number) => {
  const configs = [
    { pairs: 4, cols: 4 }, // 8 cards
    { pairs: 6, cols: 4 }, // 12 cards
    { pairs: 8, cols: 4 }, // 16 cards
    { pairs: 10, cols: 5 }, // 20 cards
    { pairs: 12, cols: 6 }, // 24 cards
  ];
  return configs[Math.min(level - 1, configs.length - 1)];
};

const MemoryFlip = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const config = getLevelConfig(level);

  const initGame = useCallback(() => {
    setCards(generateCards(config.pairs));
    setFlippedCards([]);
    setMoves(0);
    setTimer(0);
    setIsPlaying(false);
    setGameComplete(false);
    setIsChecking(false);
  }, [config.pairs]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !gameComplete) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameComplete]);

  useEffect(() => {
    // Check for win
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setGameComplete(true);
      setIsPlaying(false);
      playSound('complete');
      
      // Calculate score based on moves and time
      const baseScore = config.pairs * 50;
      const moveBonus = Math.max(0, (config.pairs * 3 - moves) * 10);
      const timeBonus = Math.max(0, (config.pairs * 10 - timer) * 2);
      const levelBonus = level * 25;
      const finalScore = baseScore + moveBonus + timeBonus + levelBonus;
      
      setScore(prev => prev + finalScore);
    }
  }, [cards, config.pairs, moves, timer, level]);

  const handleCardClick = (index: number) => {
    if (isChecking || cards[index].isFlipped || cards[index].isMatched || flippedCards.length >= 2) {
      return;
    }

    if (!isPlaying) {
      setIsPlaying(true);
    }

    playSound('click');
    
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    
    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      setIsChecking(true);
      
      const [first, second] = newFlipped;
      
      if (cards[first].symbol === cards[second].symbol) {
        // Match!
        playSound('success');
        setTimeout(() => {
          setCards(prev => prev.map((card, i) => 
            i === first || i === second ? { ...card, isMatched: true } : card
          ));
          setFlippedCards([]);
          setIsChecking(false);
        }, 500);
      } else {
        // No match
        playSound('error');
        setTimeout(() => {
          setCards(prev => prev.map((card, i) => 
            i === first || i === second ? { ...card, isFlipped: false } : card
          ));
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const nextLevel = () => {
    setLevel(prev => Math.min(prev + 1, 5));
  };

  const handleRestart = () => {
    if (gameComplete && score > 0) {
      saveScore({ game: 'MemoryFlip+', score, level });
    }
    setLevel(1);
    setScore(0);
    initGame();
  };

  const cardSize = Math.min(80, (350 - config.cols * 8) / config.cols);

  return (
    <GameLayout
      title="MemoryFlip+"
      score={score}
      level={level}
      timer={timer}
      onRestart={handleRestart}
      customStats={
        <div className="score-display">
          Moves: {moves}
        </div>
      }
    >
      <div className="flex flex-col items-center gap-6">
        {/* Instructions */}
        <p className="text-muted-foreground font-rajdhani text-center">
          Match all pairs with the fewest moves. Faster = higher score!
        </p>

        {/* Card Grid */}
        <div 
          className="grid gap-2 p-4 rounded-xl bg-card border border-border"
          style={{ 
            gridTemplateColumns: `repeat(${config.cols}, ${cardSize}px)`,
            boxShadow: '0 0 30px hsl(var(--neon-magenta) / 0.2)',
          }}
        >
          {cards.map((card, index) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(index)}
              className={`memory-card ${card.isFlipped || card.isMatched ? 'flipped' : ''}`}
              style={{ width: cardSize, height: cardSize }}
            >
              <div className="memory-card-inner">
                {/* Back (hidden side) */}
                <div 
                  className="memory-card-front bg-gradient-to-br from-neon-magenta/20 to-neon-cyan/20 border-neon-magenta/50"
                >
                  <span className="text-2xl">?</span>
                </div>
                
                {/* Front (symbol side) */}
                <div 
                  className={`memory-card-back ${card.isMatched ? 'bg-neon-lime/20 border-neon-lime' : 'bg-card border-primary'}`}
                >
                  <span style={{ fontSize: cardSize * 0.5 }}>{card.symbol}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Game Complete Modal */}
        {gameComplete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-lg">
            <div className="bg-card border-2 border-neon-magenta rounded-2xl p-8 max-w-md w-full mx-4 animate-scale-in text-center">
              <Trophy className="w-16 h-16 text-neon-magenta mx-auto mb-4" />
              <h2 className="font-orbitron text-2xl font-bold text-foreground mb-2">Level Complete!</h2>
              <div className="text-muted-foreground font-rajdhani mb-6 space-y-1">
                <p>Moves: {moves}</p>
                <p>Time: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</p>
                <p className="text-primary font-bold">Score: +{Math.round(score / level)}</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={handleRestart} className="neon-button text-sm flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Restart
                </button>
                {level < 5 && (
                  <button onClick={nextLevel} className="neon-button neon-button-magenta text-sm">
                    Next Level
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default MemoryFlip;
