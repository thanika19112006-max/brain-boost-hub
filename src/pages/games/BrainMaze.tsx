import { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { saveScore, playSound } from '@/lib/gameStore';
import { Trophy, HelpCircle, CheckCircle, XCircle } from 'lucide-react';

// Maze cell types
type CellType = 'path' | 'wall' | 'player' | 'goal' | 'locked';

interface Cell {
  type: CellType;
  x: number;
  y: number;
  unlocked?: boolean;
}

interface LogicQuestion {
  question: string;
  options: string[];
  correct: number;
}

const LOGIC_QUESTIONS: LogicQuestion[] = [
  { question: "What comes next: 2, 4, 8, 16, ?", options: ["24", "32", "30", "28"], correct: 1 },
  { question: "If all cats are animals, and some animals are pets, then:", options: ["All cats are pets", "Some cats might be pets", "No cats are pets", "All pets are cats"], correct: 1 },
  { question: "Complete: FACE is to HEAD as HAND is to:", options: ["FOOT", "ARM", "LEG", "FINGER"], correct: 1 },
  { question: "What is 15% of 200?", options: ["25", "30", "35", "40"], correct: 1 },
  { question: "If yesterday was Wednesday, what day is tomorrow?", options: ["Thursday", "Friday", "Saturday", "Sunday"], correct: 1 },
  { question: "Find the odd one out:", options: ["Apple", "Banana", "Carrot", "Orange"], correct: 2 },
  { question: "3 × 4 + 5 × 2 = ?", options: ["22", "26", "34", "18"], correct: 0 },
  { question: "What letter comes next: A, C, E, G, ?", options: ["H", "I", "J", "K"], correct: 1 },
];

// Generate maze with locked paths
const generateMaze = (level: number): Cell[][] => {
  const size = 7 + Math.min(level, 3);
  const maze: Cell[][] = [];
  
  // Initialize with walls
  for (let y = 0; y < size; y++) {
    maze[y] = [];
    for (let x = 0; x < size; x++) {
      maze[y][x] = { type: 'wall', x, y };
    }
  }
  
  // Simple maze generation using recursive backtracking (simplified)
  const stack: [number, number][] = [[1, 1]];
  maze[1][1] = { type: 'path', x: 1, y: 1 };
  
  while (stack.length > 0) {
    const [cx, cy] = stack[stack.length - 1];
    const neighbors: [number, number][] = [];
    
    // Check all directions (2 cells away)
    const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]];
    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && maze[ny][nx].type === 'wall') {
        neighbors.push([nx, ny]);
      }
    }
    
    if (neighbors.length > 0) {
      const [nx, ny] = neighbors[Math.floor(Math.random() * neighbors.length)];
      // Carve path
      maze[ny][nx] = { type: 'path', x: nx, y: ny };
      maze[cy + (ny - cy) / 2][cx + (nx - cx) / 2] = { type: 'path', x: cx + (nx - cx) / 2, y: cy + (ny - cy) / 2 };
      stack.push([nx, ny]);
    } else {
      stack.pop();
    }
  }
  
  // Set player start
  maze[1][1] = { type: 'player', x: 1, y: 1 };
  
  // Find goal position (furthest corner)
  let goalX = size - 2;
  let goalY = size - 2;
  while (maze[goalY][goalX].type === 'wall') {
    goalX--;
    if (goalX < size / 2) {
      goalX = size - 2;
      goalY--;
    }
  }
  maze[goalY][goalX] = { type: 'goal', x: goalX, y: goalY };
  
  // Add locked cells (more with higher levels)
  const numLocked = 1 + level;
  let lockedCount = 0;
  for (let y = 1; y < size - 1 && lockedCount < numLocked; y++) {
    for (let x = 1; x < size - 1 && lockedCount < numLocked; x++) {
      if (maze[y][x].type === 'path' && Math.random() < 0.15) {
        maze[y][x] = { type: 'locked', x, y, unlocked: false };
        lockedCount++;
      }
    }
  }
  
  return maze;
};

const BrainMaze = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [maze, setMaze] = useState<Cell[][]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<LogicQuestion | null>(null);
  const [targetCell, setTargetCell] = useState<{ x: number; y: number } | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [moves, setMoves] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const initGame = useCallback(() => {
    const newMaze = generateMaze(level);
    setMaze(newMaze);
    setPlayerPos({ x: 1, y: 1 });
    setMoves(0);
    setShowQuestion(false);
    setCurrentQuestion(null);
    setTargetCell(null);
    setGameComplete(false);
    setFeedback(null);
  }, [level]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameComplete || showQuestion) return;
    
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    
    if (newX < 0 || newX >= maze[0]?.length || newY < 0 || newY >= maze.length) return;
    
    const targetCellData = maze[newY][newX];
    
    if (targetCellData.type === 'wall') return;
    
    if (targetCellData.type === 'locked' && !targetCellData.unlocked) {
      // Show logic question
      const question = LOGIC_QUESTIONS[Math.floor(Math.random() * LOGIC_QUESTIONS.length)];
      setCurrentQuestion(question);
      setTargetCell({ x: newX, y: newY });
      setShowQuestion(true);
      playSound('click');
      return;
    }
    
    // Move player
    const newMaze = maze.map(row => row.map(cell => ({ ...cell })));
    newMaze[playerPos.y][playerPos.x] = { type: 'path', x: playerPos.x, y: playerPos.y };
    
    if (targetCellData.type === 'goal') {
      // Level complete!
      playSound('complete');
      const levelScore = Math.max(100 - moves * 2, 10) * level;
      setScore(prev => prev + levelScore);
      setGameComplete(true);
      return;
    }
    
    newMaze[newY][newX] = { type: 'player', x: newX, y: newY };
    setMaze(newMaze);
    setPlayerPos({ x: newX, y: newY });
    setMoves(prev => prev + 1);
    playSound('click');
  }, [playerPos, maze, gameComplete, showQuestion]);

  const handleAnswer = (answerIndex: number) => {
    if (!currentQuestion || !targetCell) return;
    
    if (answerIndex === currentQuestion.correct) {
      // Correct! Unlock the path
      playSound('success');
      setFeedback('correct');
      const newMaze = maze.map(row => row.map(cell => ({ ...cell })));
      newMaze[targetCell.y][targetCell.x] = { type: 'path', x: targetCell.x, y: targetCell.y, unlocked: true };
      setMaze(newMaze);
      setScore(prev => prev + 25);
      
      setTimeout(() => {
        setShowQuestion(false);
        setCurrentQuestion(null);
        setTargetCell(null);
        setFeedback(null);
      }, 1000);
    } else {
      // Wrong!
      playSound('error');
      setFeedback('wrong');
      setTimeout(() => {
        setShowQuestion(false);
        setCurrentQuestion(null);
        setTargetCell(null);
        setFeedback(null);
      }, 1000);
    }
  };

  const nextLevel = () => {
    setLevel(prev => prev + 1);
  };

  const handleRestart = () => {
    if (gameComplete && score > 0) {
      saveScore({ game: 'BrainMaze', score, level });
    }
    setLevel(1);
    setScore(0);
    initGame();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movePlayer(1, 0);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  const cellSize = Math.min(40, 400 / (maze[0]?.length || 7));

  return (
    <GameLayout
      title="BrainMaze"
      score={score}
      level={level}
      onRestart={handleRestart}
      showTimer={false}
      customStats={
        <div className="score-display">
          Moves: {moves}
        </div>
      }
    >
      <div className="flex flex-col items-center gap-6">
        {/* Instructions */}
        <p className="text-muted-foreground font-rajdhani text-center max-w-md">
          Navigate to the <span className="text-neon-magenta">goal</span>. Solve logic puzzles to unlock <span className="text-neon-orange">locked paths</span>. Use arrow keys or WASD.
        </p>

        {/* Maze */}
        <div 
          className="relative rounded-xl border-2 border-border p-4 bg-card"
          style={{ 
            boxShadow: '0 0 30px hsl(var(--neon-cyan) / 0.2)',
          }}
        >
          <div 
            className="grid gap-0.5"
            style={{ 
              gridTemplateColumns: `repeat(${maze[0]?.length || 7}, ${cellSize}px)`,
            }}
          >
            {maze.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`maze-cell ${cell.type} ${cell.unlocked ? 'unlocked' : ''}`}
                  style={{ 
                    width: cellSize, 
                    height: cellSize,
                    borderRadius: cell.type === 'player' ? '50%' : '4px',
                  }}
                />
              ))
            )}
          </div>
          
          {/* Mobile Controls */}
          <div className="grid grid-cols-3 gap-2 mt-6 max-w-[180px] mx-auto">
            <div />
            <button 
              onClick={() => movePlayer(0, -1)} 
              className="p-4 rounded-lg bg-muted border border-border active:border-primary"
            >
              ↑
            </button>
            <div />
            <button 
              onClick={() => movePlayer(-1, 0)} 
              className="p-4 rounded-lg bg-muted border border-border active:border-primary"
            >
              ←
            </button>
            <button 
              onClick={() => movePlayer(0, 1)} 
              className="p-4 rounded-lg bg-muted border border-border active:border-primary"
            >
              ↓
            </button>
            <button 
              onClick={() => movePlayer(1, 0)} 
              className="p-4 rounded-lg bg-muted border border-border active:border-primary"
            >
              →
            </button>
          </div>
        </div>

        {/* Question Modal */}
        {showQuestion && currentQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-lg">
            <div className="bg-card border-2 border-neon-orange rounded-2xl p-8 max-w-md w-full mx-4 animate-scale-in">
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="w-8 h-8 text-neon-orange" />
                <h2 className="font-orbitron text-xl font-bold text-foreground">Logic Challenge!</h2>
              </div>
              
              {feedback ? (
                <div className={`flex flex-col items-center py-8 ${feedback === 'correct' ? 'text-neon-lime' : 'text-destructive'}`}>
                  {feedback === 'correct' ? (
                    <>
                      <CheckCircle className="w-16 h-16 mb-4" />
                      <p className="font-orbitron text-xl">Correct!</p>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-16 h-16 mb-4" />
                      <p className="font-orbitron text-xl">Wrong!</p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-foreground font-rajdhani text-lg mb-6">{currentQuestion.question}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {currentQuestion.options.map((option, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        className="p-3 rounded-lg border border-border hover:border-primary text-foreground hover:text-primary font-rajdhani transition-all"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Level Complete Modal */}
        {gameComplete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-lg">
            <div className="bg-card border-2 border-neon-lime rounded-2xl p-8 max-w-md w-full mx-4 animate-scale-in text-center">
              <Trophy className="w-16 h-16 text-neon-lime mx-auto mb-4" />
              <h2 className="font-orbitron text-2xl font-bold text-foreground mb-2">Level Complete!</h2>
              <p className="text-muted-foreground font-rajdhani mb-6">
                Completed in {moves} moves
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={handleRestart} className="neon-button text-sm">
                  Restart
                </button>
                <button onClick={nextLevel} className="neon-button neon-button-lime text-sm">
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

export default BrainMaze;
