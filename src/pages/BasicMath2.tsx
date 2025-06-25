import React, { useState, useEffect, useRef } from 'react';
import MathAnswerSection from '../components/MathAnswerSection'; 

const BasicMath: React.FC = () => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState<'+' | '-'>('+');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState<'addition' | 'subtraction' | 'mixed'>('mixed');

  const timeoutRef = useRef<number | null>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);

  const createVisual = (count: number, emoji: string = '🍎') => (
    <div className="text-5xl leading-none">
      {emoji.repeat(count)}
      <div className="text-sm mt-1">{count}</div>
    </div>
  );

  const generateProblem = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const doAddition =
      mode === 'addition' ? true
      : mode === 'subtraction' ? false
      : Math.random() > 0.5;

    const n1 = Math.floor(Math.random() * 6) + 1;
    const n2 = Math.floor(Math.random() * 6) + 1;

    if (doAddition) {
      setOperator('+'); setNum1(n1); setNum2(n2); setCorrectAnswer(n1 + n2);
    } else {
      const [larger, smaller] = [Math.max(n1, n2), Math.min(n1, n2)];
      setOperator('-'); setNum1(larger); setNum2(smaller); setCorrectAnswer(larger - smaller);
    }

    setUserAnswer('');
    setFeedback('');
    answerInputRef.current?.focus();
  };

  const checkAnswer = () => {
    const parsed = parseInt(userAnswer, 10);
    if (parsed === correctAnswer) {
      setFeedback('✅ Great Job!');
      setScore(s => s + 1);
      timeoutRef.current = window.setTimeout(generateProblem, 2000);
    } else {
      setFeedback('❌ Try Again!');
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    generateProblem();
  }, [mode]);

  return (
    <section className="hero">
      <div className="hero-content flex-col w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-4">
          Add and Subtract with Luna!
        </h1>

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

            {/* Reusable Answer Section */}
            <div className="flex-1 flex justify-center">
              <MathAnswerSection
                ref={answerInputRef}
                score={score}
                userAnswer={userAnswer}
                onAnswerChange={setUserAnswer}
                onCheck={checkAnswer}
                onNew={generateProblem}
                feedback={feedback}
              />
            </div>
          </div>
        </div>

        {/* Mode Tabs */}
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
