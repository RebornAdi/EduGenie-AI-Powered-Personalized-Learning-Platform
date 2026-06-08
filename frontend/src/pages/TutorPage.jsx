import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

import { useAuth } from "../contexts/AuthContext";

import { askTutor } from "../api/tutorApi";
import { getSubjects } from "../api/subjectApi";

export default function TutorPage() {
  const { token } = useAuth();

  const messagesEndRef = useRef(null);

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    async function loadSubjects() {
      try {
        const data = await getSubjects(token);

        setSubjects(data);

        if (data.length > 0) {
          setSelectedSubject(data[0].id);
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (token) {
      loadSubjects();
    }
  }, [token]);

  async function handleAsk() {
    if (!question.trim()) return;

    if (!selectedSubject) {
      alert("Please select a subject.");
      return;
    }

    const currentQuestion = question;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: currentQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await askTutor(
        token,
        selectedSubject,
        currentQuestion
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: response.answer,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Something went wrong while contacting the AI Tutor.",
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="h-[85vh] flex flex-col">

      {/* Header */}

      <div className="mb-6">
        <h1 className="text-5xl font-bold text-white">
          🤖 EduGenie AI Tutor
        </h1>

        <p className="text-slate-400 mt-3 text-lg">
          Learn directly from your uploaded notes using AI.
        </p>
      </div>

      {/* Subject Selector */}

      <div className="flex flex-col gap-4 mb-4">

        <select
          value={selectedSubject}
          onChange={(e) =>
            setSelectedSubject(e.target.value)
          }
          className="bg-slate-900 border border-white/10 text-white px-4 py-3 rounded-xl w-full md:w-80"
        >
          {subjects.map((subject) => (
            <option
              key={subject.id}
              value={subject.id}
            >
              {subject.name}
            </option>
          ))}
        </select>

        <div>
          <span className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm">
            📚 Current Subject:{" "}
            {
              subjects.find(
                (s) =>
                  String(s.id) ===
                  String(selectedSubject)
              )?.name
            }
          </span>
        </div>

      </div>

      {/* Chat Area */}

      <div className="flex-1 overflow-y-auto bg-white/10 border border-white/10 rounded-3xl p-6 space-y-4">

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">

            <h2 className="text-3xl font-bold text-white mb-3">
              Welcome to EduGenie AI
            </h2>

            <p className="text-slate-400 mb-8 max-w-xl">
              Select a subject and ask questions based on your uploaded study material.
            </p>

            <div className="grid md:grid-cols-2 gap-4 w-full max-w-3xl">

              {[
                "Summarize this entire subject",
                "Generate 10 important viva questions",
                "Create 5 MCQs with answers",
                "What are the most important exam topics?",
                "Explain a difficult concept simply",
                "Give me a quick revision sheet",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() =>
                    setQuestion(prompt)
                  }
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left hover:bg-white/10 transition text-slate-200"
                >
                  {prompt}
                </button>
              ))}

            </div>

          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-4xl p-5 rounded-3xl shadow-xl ${
              msg.role === "user"
                ? "ml-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                : "bg-slate-900 border border-white/10 text-slate-100"
            }`}
          >
            {msg.role === "assistant" ? (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>
                  {msg.text}
                </ReactMarkdown>
              </div>
            ) : (
              msg.text
            )}
          </div>
        ))}

        {loading && (
          <div className="bg-slate-900 border border-white/10 text-white p-5 rounded-3xl">
            <div className="flex items-center gap-3">

              <div className="animate-pulse text-2xl">
                🤖
              </div>

              <div>
                <div className="font-semibold">
                  EduGenie AI
                </div>

                <div className="text-slate-400 text-sm">
                  Analyzing study material...
                </div>
              </div>

            </div>
          </div>
        )}

        <div ref={messagesEndRef} />

      </div>

      {/* Input */}

      <div className="mt-4 flex gap-4">

        <input
          type="text"
          placeholder="Ask a concept, summary, MCQ, explanation, or exam question..."
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
          disabled={loading}
          className="px-8 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          Ask
        </button>

      </div>

    </div>
  );
}