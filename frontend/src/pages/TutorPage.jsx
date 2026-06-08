import { useState } from "react";

import { useAuth } from "../contexts/AuthContext";

import { askTutor } from "../api/tutorApi";

export default function TutorPage() {
  const { token } = useAuth();

  const [question, setQuestion] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  async function handleAsk() {
    if (!question.trim()) return;

    const userMessage = {
      role: "user",
      text: question,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setLoading(true);

    try {
      const response =
        await askTutor(
          token,
          question
        );

      const aiMessage = {
        role: "assistant",
        text: response.answer,
      };

      setMessages((prev) => [
        ...prev,
        aiMessage,
      ]);
    } catch (error) {
      console.error(error);
    }

    setQuestion("");

    setLoading(false);
  }

  return (
    <div className="h-[80vh] flex flex-col">

      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white">
          AI Tutor
        </h1>

        <p className="text-slate-400 mt-2">
          Ask questions about your notes.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto bg-white/10 border border-white/10 rounded-3xl p-6 space-y-4">

        {messages.length === 0 && (
          <div className="text-slate-400">
            Ask your first question.
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-3xl p-4 rounded-2xl ${
              msg.role === "user"
                ? "ml-auto bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-100"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="bg-slate-800 text-white p-4 rounded-2xl">
            Thinking...
          </div>
        )}

      </div>

      <div className="mt-4 flex gap-4">

        <input
          type="text"
          placeholder="Ask anything..."
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAsk();
            }
          }}
          className="flex-1 px-4 py-4 rounded-2xl bg-slate-900 border border-white/10 text-white"
        />

        <button
          onClick={handleAsk}
          className="px-8 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Ask
        </button>

      </div>

    </div>
  );
}