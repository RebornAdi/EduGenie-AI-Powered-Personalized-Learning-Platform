import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getSubjects } from "../api/subjectApi";

export default function useSubjects() {
  const { token } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadSubjects() {
    try {
      const data = await getSubjects(token);
      setSubjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadSubjects();
    }
  }, [token]);

  return {
    subjects,
    loading,
    refreshSubjects: loadSubjects,
  };
}