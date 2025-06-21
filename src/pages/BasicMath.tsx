import React, { useState, useEffect, useRef } from 'react';

const BasicMath = () => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState('+');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const answerInputRef = useRef<HTMLInputElement>(null);

  const createVisual = (count: number) => (
    <div className="text-5xl leading-none">
      {'🍎'.repeat(count)}
      <div className="text-sm mt-1">{count}</div>
    </div>
  );

  const generateProblem = () => {
    const isAddition = Math.random() > 0.85;
    const n1 = Math.floor(Math.random() * 6) + 1;
    const n2 = Math.floor(Math.random() * 6) + 1;

    if (isAddition) {
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

  useEffect(() => {
    generateProblem();
  }, []);

  return (
    <section className="hero">
      <div className="hero-content flex-col w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center">Let's Practice Math!</h1>

        <div className="stats stats-vertical md:stats-horizontal shadow my-4">
          <div className="stat text-center">
            <div className="stat-title">Correct Answers</div>
            <div className="stat-value">{score}</div>
          </div>
        </div>

        <div className="card shadow-xl w-full">
          <div className="card-body lg:flex-row">
            {/* Problem Display */}
            <div className="flex-1 mb-4 lg:mb-0">
              <div className="text-5xl font-bold text-center lg:text-left">{num1} {operator} {num2} = ?</div>
              <div className="grid grid-cols-1 gap-4 mt-4 text-left">
                {createVisual(num1)}
                {createVisual(num2)}
              </div>
            </div>

            {/* Input Form */}
            <div className="flex-1 flex justify-center">
              <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                <legend className="fieldset-legend text-xl">Answer</legend>

                {/* <label className="label">
                  <span className="label-text">Your Answer</span>
                </label> */}
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
                    onClick={(e) => { e.preventDefault(); checkAnswer(); }}
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
                  <div className={`text-lg text-center mt-4 ${feedback.startsWith('✅') ? 'text-success' : 'text-error'}`}>{feedback}</div>
                )}

              </fieldset>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BasicMath;
