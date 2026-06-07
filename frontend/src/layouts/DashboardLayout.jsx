import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-100">

      <div className="flex">

        {/* Sidebar */}

        <aside className="w-72 bg-slate-950 text-white min-h-screen p-6">

          <h1 className="text-3xl font-bold mb-10">
            EduGenie
          </h1>

          <nav className="space-y-3">

            <div className="p-3 rounded-xl bg-indigo-600">
              Dashboard
            </div>

            <div className="p-3 rounded-xl hover:bg-slate-800 cursor-pointer">
              Subjects
            </div>

            <div className="p-3 rounded-xl hover:bg-slate-800 cursor-pointer">
              Materials
            </div>

            <div className="p-3 rounded-xl hover:bg-slate-800 cursor-pointer">
              AI Tutor
            </div>

            <div className="p-3 rounded-xl hover:bg-slate-800 cursor-pointer">
              Quizzes
            </div>

            <div className="p-3 rounded-xl hover:bg-slate-800 cursor-pointer">
              Planner
            </div>

            <div className="p-3 rounded-xl hover:bg-slate-800 cursor-pointer">
              Analytics
            </div>

          </nav>

        </aside>

        {/* Content */}

        <main className="flex-1 p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}