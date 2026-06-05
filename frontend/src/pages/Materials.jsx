import { useEffect, useState } from 'react';
import { FileText, Plus, Upload } from 'lucide-react';
import { materialsAPI } from '../api/client';

export default function Materials() {
  const [subjects, setSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newSubject, setNewSubject] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadSubjects = () => {
    materialsAPI.listSubjects().then((res) => setSubjects(res.data));
  };

  const loadNotes = (subjectId) => {
    materialsAPI.listNotes(subjectId).then((res) => setNotes(res.data));
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) loadNotes(selectedSubject);
  }, [selectedSubject]);

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    await materialsAPI.createSubject(newSubject.trim());
    setNewSubject('');
    loadSubjects();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedSubject || !uploadFile || !uploadTitle.trim()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('subject_id', selectedSubject);
    formData.append('title', uploadTitle.trim());
    formData.append('file', uploadFile);

    try {
      await materialsAPI.uploadNote(formData);
      setUploadTitle('');
      setUploadFile(null);
      loadNotes(selectedSubject);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Study Materials</h1>
      <p className="text-slate-500 mb-8">Upload PDFs and organize your notes by subject</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Subjects</h2>
          <form onSubmit={handleCreateSubject} className="flex gap-2 mb-4">
            <input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="New subject name"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button type="submit" className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700">
              <Plus className="w-5 h-5" />
            </button>
          </form>
          <div className="space-y-2">
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSubject(s.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedSubject === s.id
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                {s.name}
              </button>
            ))}
            {subjects.length === 0 && (
              <p className="text-sm text-slate-500">Create a subject to get started.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedSubject ? (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold mb-4">Upload PDF</h2>
                <form onSubmit={handleUpload} className="space-y-4">
                  <input
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Document title"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="w-full text-sm"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {loading ? 'Uploading...' : 'Upload & Index'}
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold mb-4">Uploaded Notes</h2>
                {notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div key={note.id} className="flex items-center gap-3 p-4 border border-slate-100 rounded-lg">
                        <FileText className="w-8 h-8 text-primary-500" />
                        <div>
                          <p className="font-medium">{note.title}</p>
                          <p className="text-xs text-slate-500">
                            Uploaded {new Date(note.upload_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No notes uploaded yet for this subject.</p>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Select a subject to upload and manage notes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
