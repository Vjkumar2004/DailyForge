import React, { useEffect, useState } from 'react';

// Lightweight quiz viewer that counts correct answers and time spent.
// For now it renders questions with checkboxes and compares against correctAnswers indices.
const QuizTaskViewer = ({ task, onEngagementChange }) => {
  const [answers, setAnswers] = useState({}); // {questionIndex: Set(optionIndex)}
  const [seconds, setSeconds] = useState(0);
  const [cheatingDetected, setCheatingDetected] = useState(false);

  const questions = task?.quizData?.questions || task?.specificTaskData?.questions || [];
  const minCorrect = task?.requirements?.minCorrectAnswers ?? task?.quizData?.minCorrectAnswers ?? 1;

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      if (!visible) setCheatingDetected(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(timer);
    };
  }, []);

  const toggleAnswer = (qIndex, optionIndex) => {
    setAnswers((prev) => {
      const current = prev[qIndex] ? new Set(prev[qIndex]) : new Set();
      if (current.has(optionIndex)) current.delete(optionIndex);
      else current.add(optionIndex);
      return { ...prev, [qIndex]: Array.from(current) };
    });
  };

  const correctCount = questions.reduce((count, q, idx) => {
    const selected = new Set(answers[idx] || []);
    const correct = new Set(q.correctAnswers || []);
    if (correct.size === 0) return count;
    if (selected.size !== correct.size) return count;
    for (const n of correct) {
      if (!selected.has(n)) return count;
    }
    return count + 1;
  }, 0);

  useEffect(() => {
    const canComplete = !cheatingDetected && correctCount >= minCorrect;

    if (onEngagementChange) {
      onEngagementChange({
        canComplete,
        correctAnswersCount: correctCount,
        timeSpentSeconds: seconds,
        cheatingDetected,
      });
    }
  }, [correctCount, seconds, cheatingDetected, minCorrect, onEngagementChange]);

  if (!questions.length) {
    return <p className="text-[11px] text-slate-400">Quiz content not configured yet.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-slate-400">
        Answer the questions below. You must get at least {minCorrect} correct to complete this task.
      </p>
      <div className="space-y-3">
        {questions.map((q, qi) => (
          <div key={qi} className="rounded-2xl border border-white/10 bg-slate-950/90 p-3 text-[11px]">
            <p className="font-semibold text-slate-100">Q{qi + 1}. {q.question}</p>
            <div className="mt-2 space-y-1">
              {q.options?.map((opt, oi) => {
                const selected = (answers[qi] || []).includes(oi);
                return (
                  <label key={oi} className="flex items-center gap-2 text-slate-200">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleAnswer(qi, oi)}
                      className="h-3 w-3 rounded border-slate-600 bg-slate-900 text-cyan-400"
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-slate-300">
        Correct answers: <span className="font-mono text-emerald-300">{correctCount}</span> / {questions.length} • Time:{' '}
        <span className="font-mono text-cyan-300">{seconds}s</span>
      </p>
      {cheatingDetected && (
        <p className="text-[11px] text-rose-300">
          We detected tab switches or loss of focus. Please fully engage with the task to complete it.
        </p>
      )}
    </div>
  );
};

export default QuizTaskViewer;
