import { useState } from 'react';
import { CheckCircle, XCircle, Brain } from 'lucide-react';
import { quizAPI } from '../api/client';

export default function Quiz() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const res = await quizAPI.generate({
        topic: topic.trim(),
        difficulty,
        num_questions: numQuestions,
      });
      setQuiz(res.data);
      setAnswers(new Array(res.data.questions.length).fill(null));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || answers.some((a) => a === null)) return;
    setLoading(true);
    try {
      const res = await quizAPI.submit(quiz.id, answers);
      setResults(res.data);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setQuiz(null);
    setAnswers([]);
    setResults(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Quiz Generator</h1>
      <p className="text-slate-500 mb-8">AI-generated quizzes from your study materials</p>

      {!quiz ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-lg">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Topic</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Photosynthesis, Data Structures"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Questions</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <Brain className="w-5 h-5" />
              {loading ? 'Generating...' : 'Generate Quiz'}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {quiz.topic} — {quiz.difficulty}
            </h2>
            <button onClick={reset} className="text-sm text-primary-600 hover:underline">
              New Quiz
            </button>
          </div>

          {results ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="text-center mb-6">
                <p className="text-4xl font-bold text-primary-600">{results.percentage}%</p>
                <p className="text-slate-500">
                  {results.score} / {results.total} correct
                </p>
              </div>
              <div className="space-y-4">
                {results.results.map((r, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${
                    r.is_correct ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start gap-2">
                      {r.is_correct
                        ? <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        : <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
                      <div>
                        <p className="font-medium text-sm">{r.question}</p>
                        {!r.is_correct && (
                          <p className="text-xs text-slate-500 mt-1">
                            Correct answer: {String(r.correct_answer)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {quiz.questions.map((q, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <p className="font-medium mb-4">
                    {i + 1}. {q.question}
                  </p>
                  {q.type === 'mcq' ? (
                    <div className="space-y-2">
                      {q.options?.map((opt, j) => (
                        <label
                          key={j}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            answers[i] === j
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${i}`}
                            checked={answers[i] === j}
                            onChange={() => {
                              const newAnswers = [...answers];
                              newAnswers[i] = j;
                              setAnswers(newAnswers);
                            }}
                            className="text-primary-600"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      {[true, false].map((val) => (
                        <label
                          key={String(val)}
                          className={`flex-1 text-center p-3 rounded-lg border cursor-pointer ${
                            answers[i] === val
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${i}`}
                            checked={answers[i] === val}
                            onChange={() => {
                              const newAnswers = [...answers];
                              newAnswers[i] = val;
                              setAnswers(newAnswers);
                            }}
                            className="sr-only"
                          />
                          {val ? 'True' : 'False'}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={handleSubmit}
                disabled={loading || answers.some((a) => a === null)}
                className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
