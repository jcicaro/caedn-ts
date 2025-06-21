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
    <div className="text-5xl leading-none mb-2">
      {'🍎'.repeat(count)}
      <div className="text-sm text-gray-400 mt-1">{count}</div>
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
    <section className="bg-gradient-to-br from-blue-100 to-white p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-6xl font-extrabold text-gray-800 mb-4">Let's Practice Math!</h1>
          <p className="text-2xl font-medium text-gray-700">
            ✅ Correct Answers: <span className="font-bold text-green-600">{score}</span>
          </p>
        </header>

        <div className="card bg-white shadow-2xl p-10 rounded-3xl">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
            {/* Visual Aid */}
            <div className="flex-1 text-center lg:text-left">
              <div className="text-6xl font-bold text-gray-800 mb-6">
                {num1} {operator} {num2} = ?
              </div>
              <div className="grid grid-cols-1 gap-4">
                {createVisual(num1)}
                {createVisual(num2)}
              </div>
            </div>

            {/* Card-styled Form */}
            <div className="flex-1 text-center">
              <div className="card bg-white shadow-lg p-6 rounded-2xl mx-auto w-full max-w-xs">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    checkAnswer();
                  }}
                >
                  {/* Label + Input */}
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text text-lg font-medium">Answer</span>
                    </label>
                    <input
                      type="number"
                      placeholder="?"
                      className="input input-bordered input-lg w-full text-center text-3xl"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyDown={handleKeyDown}
                      ref={answerInputRef}
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-center gap-4">
                    <button type="submit" className="btn btn-success btn-lg">
                      ✅ Check
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={generateProblem}
                    >
                      🔄 New
                    </button>
                  </div>
                </form>

                {feedback && (
                  <div
                    className={`text-2xl font-bold mt-4 transition-all duration-300 ${
                      feedback.startsWith('✅') ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {feedback}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BasicMath;
