import { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { saveScore, playSound } from '@/lib/gameStore';
import { Trophy, Zap } from 'lucide-react';

interface Question {
  question: string;
  answer: number;
  options: number[];
}

const generateMathQuestion = (level: number): Question => {
  const difficulty = Math.min(level, 5);
  const operations = ['+', '-', '*'];
  const op = operations[Math.floor(Math.random() * Math.min(difficulty, operations.length))];
  
  let a: number, b: number, answer: number;
  
  switch (op) {
    case '+':
      a = Math.floor(Math.random() * (10 * difficulty)) + 1;
      b = Math.floor(Math.random() * (10 * difficulty)) + 1;
      answer = a + b;
      break;
    case '-':
      a = Math.floor(Math.random() * (10 * difficulty)) + 10;
      b = Math.floor(Math.random() * Math.min(a, 10 * difficulty)) + 1;
      answer = a - b;
      break;
    case '*':
      a = Math.floor(Math.random() * (5 + difficulty)) + 2;
      b = Math.floor(Math.random() * (5 + difficulty)) + 2;
      answer = a * b;
      break;
    default:
      a = 1; b = 1; answer = 2;
  }
  
  const question = `${a} ${op} ${b} = ?`;
  
  // Generate wrong options
  const options = [answer];
  while (options.length < 4) {
    const wrongAnswer = answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 10) + 1);
    if (!options.includes(wrongAnswer) && wrongAnswer > 0) {
      options.push(wrongAnswer);
    }
  }
  
  // Shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  return { question, answer, options };
};

const generateLogicQuestion = (): Question => {
  const patterns = [
    { q: "2, 4, 6, 8, ?", a: 10, opts: [10, 12, 9, 11] },
    { q: "1, 4, 9, 16, ?", a: 25, opts: [25, 20, 24, 36] },
    { q: "3, 6, 12, 24, ?", a: 48, opts: [48, 36, 30, 42] },
    { q: "5, 10, 15, 20, ?", a: 25, opts: [25, 30, 22, 24] },
    { q: "1, 1, 2, 3, 5, ?", a: 8, opts: [8, 7, 6, 9] },
    { q: "2, 6, 18, 54, ?", a: 162, opts: [162, 108, 72, 180] },
  ];
  
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  
  // Shuffle options
  const options = [...pattern.opts];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  return { question: pattern.q, answer: pattern.a, options };
};

const ThinkFast = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [question, setQuestion] = useState<Question | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const generateQuestion = useCallback(() => {
    const isMath = Math.random() > 0.3;
    const newQuestion = isMath ? generateMathQuestion(level) : generateLogicQuestion();
    setQuestion(newQuestion);
  }, [level]);

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setTimer(30);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setStreak(0);
    setFeedback(null);
    generateQuestion();
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
      
      // Save score
      if (score > 0) {
        saveScore({ game: 'ThinkFast', score, level });
      }
    }
  }, [isPlaying, timer, score, level]);

  const handleAnswer = (selectedAnswer: number) => {
    if (!question || !isPlaying) return;
    
    setQuestionsAnswered(prev => prev + 1);
    
    if (selectedAnswer === question.answer) {
      playSound('success');
      setFeedback('correct');
      const streakBonus = streak >= 3 ? streak * 5 : 0;
      const timeBonus = Math.floor(timer / 5) * 2;
      const points = 10 + streakBonus + timeBonus;
      setScore(prev => prev + points);
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      playSound('error');
      setFeedback('wrong');
      setStreak(0);
    }
    
    setTimeout(() => {
      setFeedback(null);
      generateQuestion();
    }, 300);
  };

  const handleRestart = () => {
    setLevel(1);
    startGame();
  };

  const nextLevel = () => {
    setLevel(prev => prev + 1);
    startGame();
  };

  return (
    <GameLayout
      title="ThinkFast"
      score={score}
      level={level}
      timer={timer}
      onRestart={handleRestart}
      customStats={
        streak >= 3 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-lime/20 border border-neon-lime">
            <Zap className="w-4 h-4 text-neon-lime" />
            <span className="font-orbitron text-neon-lime text-sm">{streak}x Streak!</span>
          </div>
        )
      }
    >
      <div className="flex flex-col items-center gap-6 w-full max-w-lg">
        {!isPlaying && !gameOver ? (
          // Start Screen
          <div className="text-center p-8 rounded-2xl bg-card border border-border">
            <Zap className="w-16 h-16 text-neon-lime mx-auto mb-4" />
            <h2 className="font-orbitron text-2xl font-bold text-foreground mb-4">Ready to Think Fast?</h2>
            <p className="text-muted-foreground font-rajdhani mb-6">
              Solve as many math and logic problems as you can in 30 seconds!
              <br />Build streaks for bonus points.
            </p>
            <button onClick={startGame} className="neon-button neon-button-lime">
              Start Challenge
            </button>
          </div>
        ) : gameOver ? (
          // Game Over Screen
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-lg">
            <div className="bg-card border-2 border-neon-lime rounded-2xl p-8 max-w-md w-full mx-4 animate-scale-in text-center">
              <Trophy className="w-16 h-16 text-neon-lime mx-auto mb-4" />
              <h2 className="font-orbitron text-2xl font-bold text-foreground mb-2">Time's Up!</h2>
              <div className="text-muted-foreground font-rajdhani mb-6 space-y-2">
                <p className="text-3xl font-orbitron text-primary">{score} pts</p>
                <p>Correct: {correctAnswers} / {questionsAnswered}</p>
                <p>Accuracy: {questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0}%</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={handleRestart} className="neon-button text-sm">
                  Try Again
                </button>
                <button onClick={nextLevel} className="neon-button neon-button-lime text-sm">
                  Next Level
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Game Screen
          <div 
            className={`w-full p-8 rounded-2xl bg-card border-2 transition-colors duration-200 ${
              feedback === 'correct' ? 'border-neon-lime' : 
              feedback === 'wrong' ? 'border-destructive' : 
              'border-border'
            }`}
            style={{ 
              boxShadow: feedback === 'correct' 
                ? '0 0 30px hsl(var(--neon-lime) / 0.3)' 
                : feedback === 'wrong' 
                ? '0 0 30px hsl(var(--destructive) / 0.3)'
                : '0 0 30px hsl(var(--neon-lime) / 0.2)',
            }}
          >
            {/* Question */}
            <div className="text-center mb-8">
              <p className="font-orbitron text-3xl md:text-4xl font-bold text-foreground">
                {question?.question}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4">
              {question?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className="p-4 rounded-xl border-2 border-border bg-muted hover:border-primary hover:bg-primary/10 transition-all font-orbitron text-xl text-foreground"
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Progress */}
            <div className="mt-6 text-center text-muted-foreground font-rajdhani">
              Questions answered: {questionsAnswered}
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default ThinkFast;
