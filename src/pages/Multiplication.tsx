import React, { useState, useEffect, useRef } from 'react';

const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

type Difficulty = typeof DIFFICULTY[keyof typeof DIFFICULTY];

const DIFFICULTY_MAX: Record<Difficulty, number> = {
  [DIFFICULTY.EASY]: 5,
  [DIFFICULTY.MEDIUM]: 10,
  [DIFFICULTY.HARD]: 12,
};

const generateProblem = (difficulty: Difficulty, multiples: number[]) => {
  const max = DIFFICULTY_MAX[difficulty];
  const n1 = multiples[Math.floor(Math.random() * multiples.length)];
  const n2 = Math.floor(Math.random() * max) + 1;
  return { num1: n1, num2: n2, answer: n1 * n2 };
};

const ProblemDisplay: React.FC<{ num1: number; num2: number }> = ({ num1, num2 }) => (
  <div className="text-6xl font-bold text-center lg:text-left text-primary">
    {num1} × {num2} = ?
  </div>
);

// SkipCountVisual shows rows for skip counting: each row represents one skip
const SkipCountVisual: React.FC<{ times: number; step: number; icon?: string }> = ({ times, step, icon = '⭐' }) => (
  <div className="flex flex-col gap-4 items-center lg:items-start">
    {Array.from({ length: times }).map((_, i) => {
      const count = (i + 1) * step;
      return (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: step }).map((_, j) => (
              <span key={j} className="text-3xl">{icon}</span>
            ))}
          </div>
          <span className="ml-4 text-lg font-semibold">= {count}</span>
        </div>
      );
    })}
  </div>
);

export default function Multiplication() {
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTY.EASY);
  const [problem, setProblem] = useState(() => generateProblem(DIFFICULTY.EASY, [2, 3]));
  const [selectedMultiples, setSelectedMultiples] = useState<number[]>([2, 3]);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);

  const allMultiples = Array.from({ length: 12 }, (_, i) => i + 1);
  const inputRef = useRef<HTMLInputElement>(null);

  const newProblem = () => {
    const p = generateProblem(difficulty, selectedMultiples);
    setProblem(p);
    setUserAnswer('');
    setFeedback('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    newProblem();
  }, [difficulty, selectedMultiples]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const check = () => {
    const val = parseInt(userAnswer, 10);
    if (isNaN(val)) {
      setFeedback('❌ Enter a number');
      return;
    }
    if (val === problem.answer) {
      setFeedback('✅ Correct!');
      setScore((s) => s + 1);
      setTimeout(newProblem, 700);
    } else {
      setFeedback(`❌ Wrong! ${problem.num1}×${problem.num2}=${problem.answer}`);
    }
  };

  const toggleMultiple = (n: number) => {
    setSelectedMultiples((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b)
    );
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      check();
    }
    if (e.key === ' ') {
      e.preventDefault();
      newProblem();
    }
  };

  return (
    <section className="hero">
      <div className="hero-content flex-col w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center">
          Luna's Fun with Products!
        </h1>

        <div className="stats stats-vertical md:stats-horizontal shadow my-4">
          <div className="stat text-center">
            <div className="stat-title">Correct Answers</div>
            <div className="stat-value">{score}</div>
          </div>
        </div>

        <div className="card shadow w-full mb-8">
          <div className="card-body lg:flex-row lg:items-center p-6">
            <div className="flex-1 border-b lg:border-b-0 lg:border-r border-base-300 pb-6 lg:pb-0 lg:pr-8 mb-6 lg:mb-0">
              <ProblemDisplay num1={problem.num1} num2={problem.num2} />
              {difficulty === DIFFICULTY.EASY && (
                <div className="mt-6">
                  <div className="text-xl font-semibold text-info mb-3">Skip Counting Visual:</div>
                  <SkipCountVisual times={problem.num2} step={problem.num1} />
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-center lg:pl-8">
              <div className="bg-base-200 border border-base-300 rounded-box p-6 shadow-inner">
                <div className="text-2xl font-bold text-accent mb-4">Answer</div>
                <input
                  type="number"
                  ref={inputRef}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={onKey}
                  className="input input-bordered input-primary input-lg w-full text-center text-3xl mb-4"
                />
                <button onClick={check} className="btn btn-success btn-block mb-2">
                  Check
                </button>
                <button onClick={newProblem} className="btn btn-info btn-block">
                  New
                </button>
                {feedback && (
                  <div className={`mt-4 text-xl font-bold text-center ${feedback.startsWith('✅') ? 'text-success' : 'text-error'}`}> 
                    {feedback}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow bg-base-100 w-full">
          <div className="card-body p-6">
            <h2 className="card-title text-3xl text-secondary mb-4">Settings</h2>

            <div className="form-control mb-4">
              <label htmlFor="difficulty" className="label-text mb-2 font-semibold block">
                Difficulty:
              </label>
              <select
                id="difficulty"
                className="select select-bordered w-full"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              >
                <option value={DIFFICULTY.EASY}>Easy</option>
                <option value={DIFFICULTY.MEDIUM}>Medium</option>
                <option value={DIFFICULTY.HARD}>Hard</option>
              </select>
            </div>

            <div className="form-control">
              <span className="label-text mb-2 font-semibold block">Select Multiples:</span>
              <div className="flex flex-wrap gap-3">
                {allMultiples.map((n) => (
                  <label key={n} className="label cursor-pointer flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedMultiples.includes(n)}
                      onChange={() => toggleMultiple(n)}
                      className="checkbox checkbox-primary"
                    />
                    <span className="label-text">{n}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
