import { Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  Brain,
  FileQuestion,
  Calendar,
  BarChart3,
  User,
} from "lucide-react";

export default function DashboardLayout() {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: BookOpen, label: "Subjects" },
    { icon: FolderOpen, label: "Materials" },
    { icon: Brain, label: "AI Tutor" },
    { icon: FileQuestion, label: "Quizzes" },
    { icon: Calendar, label: "Planner" },
    { icon: BarChart3, label: "Analytics" },
    { icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex">
        <aside className="w-72 min-h-screen border-r border-white/10 bg-black/20 backdrop-blur-xl p-6">
          <h1 className="text-3xl font-bold text-white mb-10">
            EduGenie
          </h1>

          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer transition"
              >
                <item.icon size={20} />
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          <header className="h-20 border-b border-white/10 flex items-center justify-between px-8">
            <h2 className="text-white text-xl font-semibold">
              EduGenie Dashboard
            </h2>

            <div className="h-10 w-10 rounded-full bg-indigo-500" />
          </header>

          <main className="p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}