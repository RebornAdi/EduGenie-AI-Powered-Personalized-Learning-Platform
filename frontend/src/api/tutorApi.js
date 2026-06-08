import api from "./client";

export async function askTutor(
  token,
  question
) {
  const response = await api.post(
    "/tutor",
    {
      question,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}