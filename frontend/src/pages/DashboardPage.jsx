import { useEffect, useState } from "react";
import {
  TrendingUp,
  Flame,
  BookOpen,
  Trophy,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";

import { useAuth } from "../contexts/AuthContext";
import { getCurrentUser } from "../api/userApi";
import useSubjects from "../hooks/useSubjects";
const chartData = [
  { day: "Mon", score: 55 },
  { day: "Tue", score: 60 },
  { day: "Wed", score: 68 },
  { day: "Thu", score: 72 },
  { day: "Fri", score: 78 },
  { day: "Sat", score: 82 },
];

export default function DashboardPage() {
  const { token } = useAuth();
  const { subjects } = useSubjects();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getCurrentUser(token);
        setUser(data);
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    }

    if (token) {
      loadUser();
    }
  }, [token]);

  const stats = [
    {
      icon: TrendingUp,
      title: "Exam Readiness",
      value: "82%",
    },
    {
      icon: Flame,
      title: "Study Streak",
      value: "14 Days",
    },
    {
      icon: BookOpen,
      title: "Subjects",
      value: subjects.length,
    },
    {
      icon: Trophy,
      title: "Quizzes",
      value: "28",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Hero Section */}

      <div className="rounded-3xl p-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 text-white shadow-xl">
        <h1 className="text-5xl font-bold">
          Welcome Back, {user?.name || "Student"} 👋
        </h1>

        <p className="mt-4 text-lg opacity-90">
          Your readiness score improved by 12% this week.
        </p>

        <div className="mt-4 text-sm opacity-80">
          {user?.email}
        </div>
      </div>

      {/* Stats */}

      <div className="grid lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white hover:scale-105 transition"
          >
            <item.icon size={24} />

            <h3 className="text-slate-400 mt-4">
              {item.title}
            </h3>

            <p className="text-3xl font-bold mt-2">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Chart + Weak Topics */}

      <div className="grid lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-white/10 border border-white/10 rounded-3xl p-6">
          <h2 className="text-white text-xl font-semibold mb-6">
            Performance Trend
          </h2>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <XAxis
                  dataKey="day"
                  stroke="#94a3b8"
                />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#818cf8"
                  fill="#818cf8"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/10 border border-white/10 rounded-3xl p-6">
          <h2 className="text-white text-xl font-semibold mb-4">
            Weak Topics
          </h2>

          <div className="space-y-4 text-slate-300">
            <div>Operating Systems</div>
            <div>Dynamic Programming</div>
            <div>Computer Networks</div>
            <div>Graph Theory</div>
          </div>
        </div>

      </div>

    </div>
  );
}