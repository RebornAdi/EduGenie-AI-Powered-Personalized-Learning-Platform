import { useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";

import {
  getSubjects,
  createSubject,
} from "../api/subjectApi";

export default function SubjectsPage() {
  const { token } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] =
    useState("");

  async function loadSubjects() {
    try {
      const data = await getSubjects(token);
      setSubjects(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCreateSubject(e) {
    e.preventDefault();

    if (!newSubject.trim()) return;

    try {
      await createSubject(
        token,
        newSubject
      );

      setNewSubject("");

      loadSubjects();
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold text-white">
          Subjects
        </h1>

        <p className="text-slate-400 mt-2">
          Manage your learning subjects.
        </p>
      </div>

      <div className="bg-white/10 border border-white/10 rounded-3xl p-6">
        <form
          onSubmit={handleCreateSubject}
          className="flex gap-4"
        >
          <input
            type="text"
            placeholder="Enter subject name..."
            value={newSubject}
            onChange={(e) =>
              setNewSubject(e.target.value)
            }
            className="flex-1 px-4 py-3 rounded-xl bg-slate-900 text-white border border-white/10"
          />

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Add Subject
          </button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="bg-white/10 border border-white/10 rounded-3xl p-6 text-white"
          >
            <h3 className="text-xl font-semibold">
              {subject.name}
            </h3>
          </div>
        ))}
      </div>

    </div>
  );
}