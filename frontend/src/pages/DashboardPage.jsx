export default function DashboardPage() {
  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold text-slate-800">
          Good Evening, Aditya 👋
        </h1>

        <p className="text-slate-500 mt-2">
          Here's your learning overview for today.
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-slate-500 text-sm">
            Exam Readiness
          </h3>
          <p className="text-3xl font-bold mt-2">
            82%
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-slate-500 text-sm">
            Study Streak
          </h3>
          <p className="text-3xl font-bold mt-2">
            14 Days
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-slate-500 text-sm">
            Active Subjects
          </h3>
          <p className="text-3xl font-bold mt-2">
            6
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-slate-500 text-sm">
            Quizzes Taken
          </h3>
          <p className="text-3xl font-bold mt-2">
            28
          </p>
        </div>

      </div>

    </div>
  );
}