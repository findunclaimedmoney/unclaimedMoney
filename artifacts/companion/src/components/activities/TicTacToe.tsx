import { useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function checkWinner(board: (string | null)[]) {
  for (const [a, b, c] of WINS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

function minimax(board: (string | null)[], isMax: boolean): number {
  const winner = checkWinner(board);
  if (winner === "O") return 10;
  if (winner === "X") return -10;
  if (!board.includes(null)) return 0;
  const scores = board.map((_, i) => {
    if (board[i]) return isMax ? -Infinity : Infinity;
    const b = [...board]; b[i] = isMax ? "O" : "X";
    return minimax(b, !isMax);
  });
  return isMax ? Math.max(...scores) : Math.min(...scores);
}

function bestMove(board: (string | null)[]) {
  let best = -Infinity, move = -1;
  board.forEach((cell, i) => {
    if (!cell) {
      const b = [...board]; b[i] = "O";
      const score = minimax(b, false);
      if (score > best) { best = score; move = i; }
    }
  });
  return move;
}

const AI_SAYS_WIN = ["You can't stop me now! 😈", "Winning is so fun 😄", "That's mine! ✨", "Did you see that coming? 😏"];
const AI_SAYS_BLOCK = ["Not so fast! I blocked you 😌", "Nice try!", "Oh no you don't 😏", "I see what you're doing 👀"];
const USER_WINS = ["You beat me! 😲", "Wow, great move! I didn't see that 🥺", "Okay okay, you got me 😄", "You're good at this! ❤️"];
const DRAW = ["It's a draw! You're a tough opponent 🤝", "Tie! I'll get you next time 😊", "Draw! Good game ❤️"];

function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]!; }

interface Props {
  companionName: string;
  onBack: () => void;
}

export function TicTacToe({ companionName, onBack }: Props) {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [message, setMessage] = useState("You're X — go first!");
  const [gameOver, setGameOver] = useState(false);
  const [winLine, setWinLine] = useState<number[] | null>(null);

  const findWinLine = (b: (string | null)[]) => WINS.find(([a, c, d]) => b[a] && b[a] === b[c] && b[a] === b[d]) ?? null;

  const handleClick = async (i: number) => {
    if (!isPlayerTurn || board[i] || gameOver) return;
    const newBoard = [...board]; newBoard[i] = "X";
    setBoard(newBoard);

    const line = findWinLine(newBoard);
    if (line) {
      setWinLine(line);
      setMessage(pick(USER_WINS));
      setGameOver(true);
      return;
    }
    if (!newBoard.includes(null)) {
      setMessage(pick(DRAW));
      setGameOver(true);
      return;
    }

    setIsPlayerTurn(false);
    setMessage(`${companionName} is thinking...`);

    await new Promise(r => setTimeout(r, 600 + Math.random() * 500));

    const move = bestMove(newBoard);
    const afterAI = [...newBoard]; afterAI[move] = "O";
    setBoard(afterAI);

    const aiLine = findWinLine(afterAI);
    if (aiLine) {
      setWinLine(aiLine);
      setMessage(pick(AI_SAYS_WIN));
      setGameOver(true);
    } else if (!afterAI.includes(null)) {
      setMessage(pick(DRAW));
      setGameOver(true);
    } else {
      const wasBlocking = newBoard[move] === null && (() => {
        const test = [...newBoard]; test[move] = "X";
        return checkWinner(test) === "X";
      })();
      setMessage(wasBlocking ? pick(AI_SAYS_BLOCK) : `${companionName}: Your move!`);
      setIsPlayerTurn(true);
    }
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setMessage("You're X — go first!");
    setGameOver(false);
    setWinLine(null);
  };

  return (
    <div className="flex flex-col items-center min-h-[100dvh] p-4 md:p-6 w-full max-w-sm mx-auto">
      <div className="flex items-center gap-3 mb-6 w-full">
        <button onClick={onBack} className="text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-medium">Tic-Tac-Toe</h2>
        <span className="text-sm text-muted-foreground">vs {companionName}</span>
        <Button size="sm" variant="ghost" className="ml-auto text-muted-foreground" onClick={reset}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <div className="bg-card/40 rounded-xl p-3 mb-6 border border-white/8 w-full">
        <p className="text-sm text-center">{message}</p>
      </div>

      <div className="flex gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">X</div>
          <span>You</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground font-bold">O</div>
          <span>{companionName}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
        {board.map((cell, i) => {
          const inWinLine = winLine?.includes(i);
          return (
            <button
              key={i}
              className={`aspect-square rounded-xl text-4xl font-black transition-all border ${
                cell === "X"
                  ? `text-primary ${inWinLine ? "bg-primary/20 border-primary/50" : "bg-primary/5 border-primary/20"}`
                  : cell === "O"
                  ? `text-muted-foreground ${inWinLine ? "bg-white/10 border-white/30" : "bg-secondary border-white/8"}`
                  : "bg-card/50 border-white/8 hover:bg-white/5 hover:border-white/15 cursor-pointer"
              }`}
              onClick={() => handleClick(i)}
              disabled={!!cell || !isPlayerTurn || gameOver}
            >
              {cell}
            </button>
          );
        })}
      </div>

      {gameOver && (
        <Button className="mt-8" onClick={reset}>
          Play again
        </Button>
      )}
    </div>
  );
}
