import api from "./client";

export async function getSubjects(token) {
  const response = await api.get("/subjects", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function createSubject(
  token,
  subjectName
) {
  const response = await api.post(
    "/subjects",
    {
      name: subjectName,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}