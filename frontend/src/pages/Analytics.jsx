import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import { analyticsAPI } from '../api/client';

export default function Analytics() {
  const [dashboard, setDashboard] = useState(null);
  const [weakTopics, setWeakTopics] = useState(null);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    analyticsAPI.dashboard().then((res) => setDashboard(res.data));
    analyticsAPI.weakTopics().then((res) => setWeakTopics(res.data));
    analyticsAPI.prediction().then((res) => setPrediction(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
      <p className="text-slate-500 mb-8">Track your learning progress and performance</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Performance Trends</h2>
          {dashboard?.performance_trends?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dashboard.performance_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => new Date(d).toLocaleDateString()}
                  fontSize={12}
                />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip
                  labelFormatter={(d) => new Date(d).toLocaleDateString()}
                  formatter={(v) => [`${v}%`, 'Score']}
                />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 py-12 text-center">No quiz data yet.</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Topic Mastery</h2>
          {dashboard?.topic_mastery?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboard.topic_mastery}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="topic" fontSize={11} />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip formatter={(v) => [`${v}%`, 'Accuracy']} />
                <Bar dataKey="accuracy" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 py-12 text-center">No topic data yet.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Weak Topics</h2>
          {weakTopics?.weak_topics?.length > 0 ? (
            <div className="space-y-3">
              {weakTopics.weak_topics.map((t) => (
                <div key={t.topic} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-sm">{t.topic}</span>
                  <span className="text-red-600 text-sm font-medium">{t.accuracy.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No weak topics detected. Great job!</p>
          )}
          {weakTopics?.recommendations?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold mb-2">Recommendations</h3>
              <ul className="space-y-1">
                {weakTopics.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-slate-600">• {r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Performance Prediction</h2>
          {prediction ? (
            <div>
              <div className="text-center py-6">
                <p className="text-5xl font-bold text-primary-600">{prediction.predicted_score}%</p>
                <p className="text-slate-500 mt-1">Predicted Exam Score</p>
                <span className={`inline-block mt-3 px-4 py-1 rounded-full text-sm font-medium ${
                  prediction.risk_level === 'high' ? 'bg-red-100 text-red-700' :
                  prediction.risk_level === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {prediction.risk_level} risk
                </span>
              </div>
              <h3 className="text-sm font-semibold mb-2">Improvement Suggestions</h3>
              <ul className="space-y-2">
                {prediction.improvement_suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-slate-600 p-2 bg-slate-50 rounded-lg">{s}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Loading prediction...</p>
          )}
        </div>
      </div>
    </div>
  );
}
