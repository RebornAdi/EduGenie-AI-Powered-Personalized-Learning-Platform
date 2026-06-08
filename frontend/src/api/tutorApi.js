import api from "./client";

export async function askTutor(
  token,
  subjectId,
  question
) {
  const response = await api.post(
    "/tutor",
    {
      subject_id: subjectId,
      question: question,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}