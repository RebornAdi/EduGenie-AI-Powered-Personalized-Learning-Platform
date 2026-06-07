import { useState } from "react";
import {
  GraduationCap,
  BarChart3,
  Flame,
  BookOpen,
} from "lucide-react";

import api from "../api/client";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      login(response.data.access_token);

      window.location.href = "/dashboard";
      console.log(response.data);

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-white">

      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute bottom-20 right-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
      </div>

      {/* Mock Dashboard Background */}
      <div className="absolute inset-0 opacity-20 p-10 hidden lg:block">
        <div className="grid grid-cols-3 gap-6 h-full">

          <div className="bg-white/5 rounded-3xl border border-white/10" />

          <div className="space-y-6">
            <div className="bg-white/5 rounded-3xl h-48 border border-white/10" />
            <div className="bg-white/5 rounded-3xl h-80 border border-white/10" />
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 rounded-3xl h-64 border border-white/10" />
            <div className="bg-white/5 rounded-3xl h-64 border border-white/10" />
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">

        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Side */}
          <div className="hidden lg:block">

            <div className="flex items-center gap-4 mb-8">
              <GraduationCap size={42} />
              <h1 className="text-5xl font-bold">
                EduGenie
              </h1>
            </div>

            <h2 className="text-4xl font-bold leading-tight">
              Your Personal
              <br />
              Learning Operating System
            </h2>

            <p className="text-slate-300 mt-6 text-lg">
              Track progress, identify weak topics,
              generate quizzes, and improve exam readiness.
            </p>

            <div className="grid grid-cols-3 gap-4 mt-12">

              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                <BarChart3 className="mb-3" />
                <p className="text-2xl font-bold">82%</p>
                <p className="text-sm text-slate-300">
                  Exam Readiness
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                <Flame className="mb-3" />
                <p className="text-2xl font-bold">14</p>
                <p className="text-sm text-slate-300">
                  Day Streak
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                <BookOpen className="mb-3" />
                <p className="text-2xl font-bold">6</p>
                <p className="text-sm text-slate-300">
                  Active Subjects
                </p>
              </div>

            </div>

          </div>

          {/* Login Card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl p-8 lg:p-10 shadow-2xl">

            <h2 className="text-3xl font-bold">
              Welcome Back
            </h2>

            <p className="text-slate-300 mt-2">
              Sign in to continue your learning journey.
            </p>

            <form
              onSubmit={handleLogin}
              className="mt-8 space-y-5"
            >

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none"
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none"
                required
              />

              {error && (
                <p className="text-red-400 text-sm">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 font-semibold transition"
              >
                {loading
                  ? "Signing In..."
                  : "Sign In"}
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}