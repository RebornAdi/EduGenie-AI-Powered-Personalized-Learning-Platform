import numpy as np
from sklearn.linear_model import LinearRegression

from app.services.gemini_service import generate_text


def detect_weak_topics(progress_data: list[dict]) -> list[dict]:
    weak = []
    for item in progress_data:
        accuracy = item.get("accuracy", 0)
        if accuracy < 70:
            weak.append({
                "topic": item.get("topic"),
                "accuracy": accuracy,
                "status": "needs_improvement" if accuracy < 50 else "moderate",
            })
    weak.sort(key=lambda x: x["accuracy"])
    return weak


def predict_performance(scores: list[float], study_hours: list[float] | None = None) -> dict:
    if len(scores) < 2:
        avg = sum(scores) / len(scores) if scores else 50.0
        return {
            "predicted_score": round(avg, 1),
            "risk_level": "medium" if avg < 60 else "low",
            "trend": "stable",
        }

    X = np.array(range(len(scores))).reshape(-1, 1)
    y = np.array(scores)
    model = LinearRegression()
    model.fit(X, y)

    next_score = float(model.predict([[len(scores)]])[0])
    next_score = max(0, min(100, next_score))

    trend = "improving" if model.coef_[0] > 0 else "declining" if model.coef_[0] < 0 else "stable"

    if next_score < 50:
        risk = "high"
    elif next_score < 70:
        risk = "medium"
    else:
        risk = "low"

    return {
        "predicted_score": round(next_score, 1),
        "risk_level": risk,
        "trend": trend,
    }


def generate_recommendations(weak_topics: list[dict], performance: dict) -> list[str]:
    recommendations = []

    for topic in weak_topics[:3]:
        recommendations.append(
            f"Focus on '{topic['topic']}' — current accuracy is {topic['accuracy']:.0f}%. "
            "Review notes and take a practice quiz."
        )

    if performance.get("risk_level") == "high":
        recommendations.append("Your predicted score is low. Increase daily study time and retake quizzes.")
    elif performance.get("trend") == "declining":
        recommendations.append("Performance is declining. Revisit fundamentals and schedule focused review sessions.")
    else:
        recommendations.append("Maintain consistency with daily study sessions and regular self-assessment.")

    if not recommendations:
        recommendations.append("Great progress! Challenge yourself with harder quizzes on new topics.")

    return recommendations


def generate_study_plan(
    weak_topics: list[str],
    subjects: list[str],
    hours_per_day: int,
    days_until_exam: int,
) -> list[dict]:
    plan = []
    topics = weak_topics or subjects or ["General Review"]

    for day in range(min(days_until_exam, 14)):
        topic_idx = day % len(topics)
        topic = topics[topic_idx]
        plan.append({
            "day": day + 1,
            "tasks": (
                f"Study {topic} for {hours_per_day} hours. "
                f"Read notes, ask AI tutor questions, and complete a practice quiz."
            ),
            "focus": topic,
        })

    return plan


def ai_improvement_suggestions(weak_topics: list[dict], predicted_score: float) -> list[str]:
    topics_str = ", ".join(t["topic"] for t in weak_topics[:5]) or "general topics"
    prompt = (
        f"A student has weak areas in: {topics_str}. "
        f"Their predicted exam score is {predicted_score:.0f}%. "
        "Provide 3 specific, actionable study improvement suggestions as a JSON array of strings."
    )
    result = generate_text(prompt)
    try:
        import json
        import re
        cleaned = re.sub(r"```json\s*|\s*```", "", result).strip()
        suggestions = json.loads(cleaned)
        if isinstance(suggestions, list):
            return [str(s) for s in suggestions[:5]]
    except Exception:
        pass
    return generate_recommendations(weak_topics, {"risk_level": "medium"})
