import json

from app.services.gemini_service import generate_json
from app.services.rag_service import query_context


def generate_quiz(
    user_id: int,
    topic: str,
    difficulty: str,
    num_questions: int,
    subject_id: int | None = None,
) -> list[dict]:
    context, _ = query_context(user_id, topic, subject_id, top_k=6)

    context_block = f"\nStudy Material:\n{context}\n" if context else ""

    prompt = (
        f"Generate {num_questions} quiz questions about '{topic}' at {difficulty} difficulty."
        f"{context_block}\n"
        "Mix MCQ and true/false questions. Return JSON array with objects containing:\n"
        '- "question": string\n'
        '- "type": "mcq" or "true_false"\n'
        '- "options": array of 4 strings for mcq, null for true_false\n'
        '- "correct_answer": index (0-3) for mcq, or true/false for true_false'
    )

    result = generate_json(prompt)

    if isinstance(result, dict):
        result = result.get("questions", [])

    if not result:
        result = _fallback_questions(topic, num_questions)

    return result[:num_questions]


def evaluate_answers(questions: list[dict], answers: list) -> tuple[float, list[dict]]:
    results = []
    correct = 0

    for i, q in enumerate(questions):
        user_answer = answers[i] if i < len(answers) else None
        correct_answer = q.get("correct_answer")
        q_type = q.get("type", "mcq")

        if q_type == "true_false":
            is_correct = str(user_answer).lower() == str(correct_answer).lower()
        else:
            is_correct = user_answer == correct_answer

        if is_correct:
            correct += 1

        results.append({
            "question": q.get("question"),
            "your_answer": user_answer,
            "correct_answer": correct_answer,
            "is_correct": is_correct,
        })

    return float(correct), results


def _fallback_questions(topic: str, num: int) -> list[dict]:
    questions = []
    for i in range(num):
        questions.append({
            "question": f"What is an important concept in {topic}? (Question {i + 1})",
            "type": "mcq",
            "options": [
                f"Concept A related to {topic}",
                f"Concept B related to {topic}",
                f"Concept C related to {topic}",
                f"Concept D related to {topic}",
            ],
            "correct_answer": 0,
        })
    return questions
