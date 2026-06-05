import { useEffect, useState } from 'react';
import { Calendar, Check, Sparkles } from 'lucide-react';
import { plannerAPI } from '../api/client';

export default function Planner() {
  const [plans, setPlans] = useState([]);
  const [examDate, setExamDate] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [loading, setLoading] = useState(false);

  const loadPlans = () => {
    plannerAPI.listPlans().then((res) => setPlans(res.data));
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!examDate) return;
    setLoading(true);
    try {
      await plannerAPI.generate({
        exam_date: new Date(examDate).toISOString(),
        hours_per_day: hoursPerDay,
      });
      loadPlans();
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (planId) => {
    await plannerAPI.complete(planId);
    loadPlans();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Study Planner</h1>
      <p className="text-slate-500 mb-8">AI-generated adaptive study schedules</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Generate Plan</h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Exam Date</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hours per Day</label>
              <input
                type="number"
                min={1}
                max={12}
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 w-full justify-center bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Generating...' : 'Generate Study Plan'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Your Schedule</h2>
            {plans.length > 0 ? (
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-lg border ${
                      plan.completed
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <Calendar className="w-5 h-5 text-primary-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">
                            {new Date(plan.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          {plan.goal && (
                            <p className="text-xs text-primary-600 mt-0.5">{plan.goal}</p>
                          )}
                          <p className="text-sm text-slate-600 mt-1">{plan.tasks}</p>
                        </div>
                      </div>
                      {!plan.completed && (
                        <button
                          onClick={() => handleComplete(plan.id)}
                          className="text-emerald-600 hover:bg-emerald-100 p-2 rounded-lg transition-colors"
                          title="Mark complete"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                      {plan.completed && (
                        <span className="text-xs text-emerald-600 font-medium">Done</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">
                Generate a study plan to see your daily schedule.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
