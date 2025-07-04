import React, { useState, useEffect, useRef } from 'react';

const BasicMath = () => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState('+');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState<'addition' | 'subtraction' | 'mixed'>('mixed');

  // Ref to hold the timeout ID so we can clear it if needed
  const timeoutRef = useRef<number | null>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);

  const createVisual = (count: number, emoji: string = '🍎') => (
    <div className="text-5xl leading-none">
      {emoji.repeat(count)}
      <div className="text-sm mt-1">{count}</div>
    </div>
  );

  const generateProblem = () => {
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Determine operation based on mode
    const doAddition =
      mode === 'addition'
        ? true
        : mode === 'subtraction'
        ? false
        : Math.random() > 0.5;

    const n1 = Math.floor(Math.random() * 6) + 1;
    const n2 = Math.floor(Math.random() * 6) + 1;

    if (doAddition) {
      setOperator('+');
      setNum1(n1);
      setNum2(n2);
      setCorrectAnswer(n1 + n2);
    } else {
      const [larger, smaller] = [Math.max(n1, n2), Math.min(n1, n2)];
      setOperator('-');
      setNum1(larger);
      setNum2(smaller);
      setCorrectAnswer(larger - smaller);
    }

    setUserAnswer('');
    setFeedback('');
    answerInputRef.current?.focus();
  };

  const checkAnswer = () => {
    const parsed = parseInt(userAnswer, 10);
    if (parsed === correctAnswer) {
      setFeedback('✅ Great Job!');
      setScore((s) => s + 1);

      // Automatically go to next problem after 2 seconds
      timeoutRef.current = window.setTimeout(() => {
        generateProblem();
      }, 2000);
    } else {
      setFeedback('❌ Try Again!');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      checkAnswer();
    } else if (e.key === ' ') {
      e.preventDefault();
      generateProblem();
    }
  };

  // On unmount, clear any pending timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Generate first problem on mount
  useEffect(() => {
    generateProblem();
  }, [mode]);  // regenerate when mode changes

  return (
    <section className="hero">
      <div className="hero-content flex-col w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-4">Add and Subtract with Luna!</h1>


        <div className="card shadow-xl w-full">
          <div className="card-body lg:flex-row">
            {/* Problem Display */}
            <div className="flex-1 mb-4 lg:mb-0">
              <div className="text-5xl font-bold text-center lg:text-left">
                {num1} {operator} {num2} = ?
              </div>
              <div className="grid grid-cols-1 gap-4 mt-4 text-left">
                {createVisual(num1)}
                {createVisual(num2, operator === '-' ? '🍽️' : '🍎')}
              </div>
            </div>

            {/* Input Form */}
            <div className="flex-1 flex justify-center">
              <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                <legend className="fieldset-legend text-xl text-center">
                  <div className="badge badge-xl badge-success">
                    Score: {score}
                  </div>
                </legend>

                <input
                  type="number"
                  placeholder="?"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  ref={answerInputRef}
                  className="input input-bordered input-lg mb-4 w-full text-center"
                />

                <div className="flex flex-col justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      checkAnswer();
                    }}
                    className="btn btn-outline btn-success w-full"
                  >
                    Check
                  </button>
                  <button
                    onClick={generateProblem}
                    className="btn btn-outline btn-primary w-full"
                  >
                    New
                  </button>
                </div>

                {feedback && (
                  <div
                    className={`text-lg text-center mt-4 ${
                      feedback.startsWith('✅') ? 'text-success' : 'text-error'
                    }`}
                  >
                    {feedback}
                  </div>
                )}
              </fieldset>
            </div>
          </div>
        </div>


        {/* Mode Selection Tabs */}
        <div className="tabs tabs-border justify-center mb-6">
          <a
            className={`tab ${mode === 'addition' ? 'tab-active' : ''}`}
            onClick={() => setMode('addition')}
          >
            Add
          </a>
          <a
            className={`tab ${mode === 'subtraction' ? 'tab-active' : ''}`}
            onClick={() => setMode('subtraction')}
          >
            Subtract
          </a>
          <a
            className={`tab ${mode === 'mixed' ? 'tab-active' : ''}`}
            onClick={() => setMode('mixed')}
          >
            Mix them up!
          </a>
        </div>

        
      </div>
    </section>
  );
};

export default BasicMath;
