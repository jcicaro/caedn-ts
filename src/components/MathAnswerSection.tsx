import React, { forwardRef } from 'react';

export interface MathAnswerSectionProps {
  score: number;
  userAnswer: string;
  onAnswerChange: (val: string) => void;
  onCheck: () => void;
  onNew: () => void;
  feedback?: string;
}

const MathAnswerSection = forwardRef<HTMLInputElement, MathAnswerSectionProps>(({
  score,
  userAnswer,
  onAnswerChange,
  onCheck,
  onNew,
  feedback
}, ref) => (
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
      onChange={e => onAnswerChange(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          e.preventDefault(); onCheck();
        } else if (e.key === ' ') {
          e.preventDefault(); onNew();
        }
      }}
      ref={ref}
      className="input input-bordered input-lg mb-4 w-full text-center"
    />

    <div className="flex flex-col justify-center gap-2">
      <button
        onClick={e => { e.preventDefault(); onCheck(); }}
        className="btn btn-outline btn-success w-full"
      >
        Check
      </button>
      <button
        onClick={onNew}
        className="btn btn-outline btn-primary w-full"
      >
        New 
      </button>
    </div>

    {feedback && (
      <div className={`text-lg text-center mt-4 ${
        feedback.startsWith('✅') ? 'text-success' : 'text-error'
      }`}>
        {feedback}
      </div>
    )}
  </fieldset>
));

export default MathAnswerSection;
