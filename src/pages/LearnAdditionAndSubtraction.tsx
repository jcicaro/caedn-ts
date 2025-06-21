import React, { useState, useEffect, useRef } from 'react';

const LearnAdditionAndSubtraction = () => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState('+');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);

  const answerInputRef = useRef(null);

  const createVisual = (count) => {
    return (
      <span>
        {"🍎".repeat(count)}
        <sub className="ml-2 text-gray-500 text-xs">{count}</sub>
      </span>
    );
  };

  const generateProblem = () => {
    const isAddition = Math.random() > 0.5;
    const n1 = Math.floor(Math.random() * 6) + 1;
    const n2 = Math.floor(Math.random() * 6) + 1;

    setNum1(n1);
    setNum2(n2);
    setUserAnswer('');
    setFeedback('');

    if (isAddition) {
      setOperator('+');
      setCorrectAnswer(n1 + n2);
    } else {
      setOperator('-');
      const larger = Math.max(n1, n2);
      const smaller = Math.min(n1, n2);
      setNum1(larger); // Update for display
      setNum2(smaller); // Update for display
      setCorrectAnswer(larger - smaller);
    }
    answerInputRef.current?.focus();
  };

  const checkAnswer = () => {
    const parsedUserAnswer = parseInt(userAnswer);
    if (parsedUserAnswer === correctAnswer) {
      setFeedback('✅ Great Job!');
      setScore(prevScore => prevScore + 1);
    } else {
      setFeedback('❌ Try Again!');
    }
  };

  useEffect(() => {
    generateProblem();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      checkAnswer();
    } else if (e.key === ' ') {
      e.preventDefault();
      generateProblem();
    }
  };

  return (
    <section className="bg-gradient-to-b from-blue-100 to-white flex flex-col justify-center items-center py-10 min-h-screen">
      <div className="container mx-auto text-center">
        <h1 className="font-bold text-5xl mb-4 text-gray-900">Let's Practice Math!</h1>
        <p className="font-semibold text-lg mb-5 text-gray-900">
          ✅ Correct Answers: <span id="correct-count">{score}</span>
        </p>

        <div id="math-card" className="bg-white rounded-2xl shadow-xl p-6 mx-auto max-w-lg">
          <div className="mb-4">
            <h2 id="problem" className="text-gray-800 font-bold text-6xl mb-3">
              {num1} {operator} {num2} = ?
            </h2>

            <div id="visual-aid" className="text-4xl inline-block mx-auto text-left">
              <div id="visual-row-1" className="mb-2 text-left">
                {createVisual(num1)}
              </div>
              <div id="visual-row-2" className="text-left">
                {createVisual(num2)}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <input
              id="answer"
              type="number"
              className="input input-bordered input-lg w-full max-w-[120px] text-center"
              placeholder="?"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              ref={answerInputRef}
            />
            <button id="check-btn" className="btn btn-success btn-lg px-6" onClick={checkAnswer}>
              <i className="bi bi-check-circle-fill mr-2"></i> Check
            </button>
          </div>

          <div id="feedback" className={`text-xl font-bold mb-3 ${feedback.startsWith('✅') ? 'text-success' : 'text-error'}`}>
            {feedback}
          </div>
          <button id="new-problem-btn" className="btn btn-primary mt-2" onClick={generateProblem}>
            <i className="bi bi-arrow-clockwise mr-2"></i> New Problem
          </button>
        </div>
      </div>
    </section>
  );
};

export default LearnAdditionAndSubtraction;