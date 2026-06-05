import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, BookOpen, Brain, MessageCircle, TrendingUp } from 'lucide-react';
import { analyticsAPI } from '../api/client';
import { useAuth } from '../context/useAuth';

const quickLinks = [
  { to: '/materials', label: 'Upload Notes', icon: BookOpen, color: 'bg-blue-500' },
  { to: '/tutor', label: 'Ask AI Tutor', icon: MessageCircle, color: 'bg-emerald-500' },
  { to: '/quiz', label: 'Take a Quiz', icon: Brain, color: 'bg-purple-500' },
  { to: '/analytics', label: 'View Analytics', icon: BarChart3, color: 'bg-amber-500' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    analyticsAPI.dashboard().then((res) => setStats(res.data)).catch(() => {});
    analyticsAPI.prediction().then((res) => setPrediction(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-slate-500 mt-1">Your personalized learning dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Quizzes Taken"
          value={stats?.total_quizzes ?? 0}
          icon={Brain}
          color="text-purple-600"
        />
        <StatCard
          label="Average Score"
          value={`${stats?.average_score ?? 0}%`}
          icon={TrendingUp}
          color="text-emerald-600"
        />
        <StatCard
          label="Quiz Accuracy"
          value={`${stats?.quiz_accuracy ?? 0}%`}
          icon={BarChart3}
          color="text-blue-600"
        />
        <StatCard
          label="Predicted Score"
          value={`${prediction?.predicted_score ?? '--'}%`}
          icon={TrendingUp}
          color="text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickLinks.map(({ to, label, icon: Icon, color }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className={`${color} p-2 rounded-lg text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-sm">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Topic Mastery</h2>
          {stats?.topic_mastery?.length > 0 ? (
            <div className="space-y-3">
              {stats.topic_mastery.slice(0, 5).map((topic) => (
                <div key={topic.topic}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{topic.topic}</span>
                    <span className="font-medium">{topic.accuracy.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{ width: `${topic.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Take quizzes to see your topic mastery.</p>
          )}
        </div>
      </div>

      {prediction && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-3">AI Insights</h2>
          <div className="flex items-center gap-4 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              prediction.risk_level === 'high' ? 'bg-red-100 text-red-700' :
              prediction.risk_level === 'medium' ? 'bg-amber-100 text-amber-700' :
              'bg-emerald-100 text-emerald-700'
            }`}>
              Risk: {prediction.risk_level}
            </span>
            <span className="text-slate-600">
              Predicted exam score: <strong>{prediction.predicted_score}%</strong>
            </span>
          </div>
          <ul className="space-y-2">
            {prediction.improvement_suggestions?.map((s, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  );
}
