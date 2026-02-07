import { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { saveScore, playSound } from '@/lib/gameStore';
import { Trophy, Eye, RotateCcw } from 'lucide-react';

const WORDS = [
  'BRAIN', 'MEMORY', 'FOCUS', 'LOGIC', 'THINK',
  'PUZZLE', 'MIND', 'SOLVE', 'LEARN', 'SMART',
  'QUICK', 'SHARP', 'CLEVER', 'BRIGHT', 'SPEED',
  'POWER', 'SKILL', 'GENIUS', 'WISDOM', 'BOOST',
  'NEURAL', 'CORTEX', 'SYNAPSE', 'REFLEX', 'VISION',
];

type DistortionType = 'reversed' | 'scrambled' | 'spaced' | 'mirrored' | 'rotated';

interface WordChallenge {
  original: string;
  distorted: string;
  type: DistortionType;
}

const distortWord = (word: string, type: DistortionType): string => {
  switch (type) {
    case 'reversed':
      return word.split('').reverse().join('');
    case 'scrambled':
      // Keep first and last letter, scramble middle
      if (word.length <= 3) return word.split('').reverse().join('');
      const first = word[0];
      const last = word[word.length - 1];
      const middle = word.slice(1, -1).split('');
      for (let i = middle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [middle[i], middle[j]] = [middle[j], middle[i]];
      }
      return first + middle.join('') + last;
    case 'spaced':
      return word.split('').join(' ');
    case 'mirrored':
      // Add mirror effect using CSS later, return reversed with indicator
      return '⟨ ' + word.split('').reverse().join('') + ' ⟩';
    case 'rotated':
      // Simulate rotation with special characters
      return word.split('').map(c => 
        Math.random() > 0.5 ? c.toLowerCase() : c
      ).join('');
    default:
      return word;
  }
};

const getDistortionStyle = (type: DistortionType): React.CSSProperties => {
  switch (type) {
    case 'reversed':
      return { transform: 'scaleX(-1)', letterSpacing: '0.1em' };
    case 'mirrored':
      return { transform: 'rotateY(180deg)', letterSpacing: '0.15em' };
    case 'rotated':
      return { transform: 'rotate(-5deg) skewX(-5deg)', letterSpacing: '0.2em' };
    case 'scrambled':
      return { letterSpacing: '0.05em', fontStyle: 'italic' };
    case 'spaced':
      return { letterSpacing: '0.5em', textTransform: 'uppercase' };
    default:
      return {};
  }
};

const WordBend = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState(60);
  const [challenge, setChallenge] = useState<WordChallenge | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());

  const ROUNDS_PER_LEVEL = 10;

  const generateChallenge = useCallback(() => {
    // Get available words (not used yet)
    const availableWords = WORDS.filter(w => !usedWords.has(w));
    if (availableWords.length < 4) {
      setUsedWords(new Set());
    }
    
    const wordsToUse = availableWords.length >= 4 ? availableWords : WORDS;
    
    // Select correct word
    const correctWord = wordsToUse[Math.floor(Math.random() * wordsToUse.length)];
    setUsedWords(prev => new Set([...prev, correctWord]));
    
    // Select distortion type based on level
    const distortionTypes: DistortionType[] = ['reversed', 'scrambled', 'spaced'];
    if (level >= 2) distortionTypes.push('mirrored');
    if (level >= 3) distortionTypes.push('rotated');
    
    const type = distortionTypes[Math.floor(Math.random() * distortionTypes.length)];
    const distorted = distortWord(correctWord, type);
    
    // Generate wrong options
    const wrongOptions = wordsToUse
      .filter(w => w !== correctWord)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [correctWord, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    setChallenge({ original: correctWord, distorted, type });
    setOptions(allOptions);
  }, [level, usedWords]);

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setRound(1);
    setTimer(60);
    setCorrectCount(0);
    setWrongCount(0);
    setUsedWords(new Set());
    setFeedback(null);
    generateChallenge();
  };

  useEffect(() => {
    if (isPlaying && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && isPlaying) {
      setIsPlaying(false);
      setGameOver(true);
      playSound('complete');
      
      if (score > 0) {
        saveScore({ game: 'WordBend', score, level });
      }
    }
  }, [isPlaying, timer, score, level]);

  const handleAnswer = (selectedWord: string) => {
    if (!challenge || !isPlaying) return;
    
    if (selectedWord === challenge.original) {
      playSound('success');
      setFeedback('correct');
      const timeBonus = Math.floor(timer / 10);
      const levelBonus = level * 5;
      setScore(prev => prev + 20 + timeBonus + levelBonus);
      setCorrectCount(prev => prev + 1);
    } else {
      playSound('error');
      setFeedback('wrong');
      setWrongCount(prev => prev + 1);
    }
    
    setTimeout(() => {
      setFeedback(null);
      if (round < ROUNDS_PER_LEVEL) {
        setRound(prev => prev + 1);
        generateChallenge();
      } else {
        // Level complete
        setLevel(prev => prev + 1);
        setRound(1);
        setTimer(prev => prev + 15); // Bonus time
        generateChallenge();
      }
    }, 500);
  };

  const handleRestart = () => {
    setLevel(1);
    startGame();
  };

  return (
    <GameLayout
      title="WordBend"
      score={score}
      level={level}
      timer={timer}
      onRestart={handleRestart}
      customStats={
        <div className="score-display">
          Round: {round}/{ROUNDS_PER_LEVEL}
        </div>
      }
    >
      <div className="flex flex-col items-center gap-6 w-full max-w-lg">
        {!isPlaying && !gameOver ? (
          // Start Screen
          <div className="text-center p-8 rounded-2xl bg-card border border-border">
            <Eye className="w-16 h-16 text-neon-purple mx-auto mb-4" />
            <h2 className="font-orbitron text-2xl font-bold text-foreground mb-4">WordBend</h2>
            <p className="text-muted-foreground font-rajdhani mb-6">
              Words will appear distorted, reversed, or scrambled.
              <br />
              Identify the correct word from the options!
            </p>
            <button onClick={startGame} className="neon-button" style={{ borderColor: 'hsl(var(--neon-purple))', color: 'hsl(var(--neon-purple))' }}>
              Start Challenge
            </button>
          </div>
        ) : gameOver ? (
          // Game Over Screen
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-lg">
            <div className="bg-card border-2 border-neon-purple rounded-2xl p-8 max-w-md w-full mx-4 animate-scale-in text-center">
              <Trophy className="w-16 h-16 text-neon-purple mx-auto mb-4" />
              <h2 className="font-orbitron text-2xl font-bold text-foreground mb-2">Time's Up!</h2>
              <div className="text-muted-foreground font-rajdhani mb-6 space-y-2">
                <p className="text-3xl font-orbitron text-primary">{score} pts</p>
                <p>Correct: <span className="text-neon-lime">{correctCount}</span></p>
                <p>Wrong: <span className="text-destructive">{wrongCount}</span></p>
                <p>Accuracy: {correctCount + wrongCount > 0 ? Math.round((correctCount / (correctCount + wrongCount)) * 100) : 0}%</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={handleRestart} className="neon-button text-sm flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Game Screen
          <div className="w-full">
            {/* Distorted Word Display */}
            <div 
              className={`word-distorted text-center mb-8 transition-all duration-200 ${
                feedback === 'correct' ? 'border-neon-lime' : 
                feedback === 'wrong' ? 'border-destructive' : ''
              }`}
              style={challenge ? getDistortionStyle(challenge.type) : {}}
            >
              {challenge?.distorted}
            </div>

            {/* Distortion Type Hint */}
            <div className="text-center mb-6">
              <span className="text-xs font-rajdhani text-muted-foreground px-3 py-1 rounded-full bg-muted">
                {challenge?.type === 'reversed' && '↔️ Reversed'}
                {challenge?.type === 'scrambled' && '🔀 Scrambled'}
                {challenge?.type === 'spaced' && '➡️ Spaced'}
                {challenge?.type === 'mirrored' && '🪞 Mirrored'}
                {challenge?.type === 'rotated' && '🔄 Rotated'}
              </span>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className="p-4 rounded-xl border-2 border-border bg-card hover:border-neon-purple hover:bg-neon-purple/10 transition-all font-orbitron text-lg text-foreground"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default WordBend;
