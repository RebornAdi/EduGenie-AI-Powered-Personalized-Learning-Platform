from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer

from app.config import settings
from app.services.gemini_service import generate_text
from app.services.pdf_service import chunk_text, extract_text_from_pdf

_embedder = None
_chroma_client = None


def _get_embedder():
    global _embedder
    if _embedder is None:
        _embedder = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedder


def _get_chroma():
    global _chroma_client
    if _chroma_client is None:
        Path(settings.chroma_dir).mkdir(parents=True, exist_ok=True)
        _chroma_client = chromadb.PersistentClient(path=settings.chroma_dir)
    return _chroma_client


def _collection_name(user_id: int, subject_id: int | None) -> str:
    suffix = f"subject_{subject_id}" if subject_id else "all"
    return f"user_{user_id}_{suffix}"


def index_document(user_id: int, subject_id: int, note_id: int, file_path: str, title: str):
    text = extract_text_from_pdf(file_path)
    chunks = chunk_text(text)
    if not chunks:
        return

    embedder = _get_embedder()
    embeddings = embedder.encode(chunks).tolist()

    client = _get_chroma()
    collection = client.get_or_create_collection(name=_collection_name(user_id, subject_id))

    ids = [f"note_{note_id}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"note_id": note_id, "title": title, "chunk_index": i} for i in range(len(chunks))]

    collection.upsert(ids=ids, documents=chunks, embeddings=embeddings, metadatas=metadatas)


def query_context(user_id: int, question: str, subject_id: int | None = None, top_k: int = 4) -> tuple[str, list[str]]:
    embedder = _get_embedder()
    query_embedding = embedder.encode([question]).tolist()

    client = _get_chroma()
    collection_name = _collection_name(user_id, subject_id)

    try:
        collection = client.get_collection(name=collection_name)
    except Exception:
        if subject_id is not None:
            return query_context(user_id, question, subject_id=None, top_k=top_k)
        return "", []

    results = collection.query(query_embeddings=query_embedding, n_results=top_k)
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    sources = []
    for meta in metadatas:
        title = meta.get("title", "Unknown")
        if title not in sources:
            sources.append(title)

    context = "\n\n".join(documents)
    return context, sources


def ask_tutor(user_id: int, question: str, subject_id: int | None = None) -> tuple[str, list[str]]:
    context, sources = query_context(user_id, question, subject_id)

    if context:
        prompt = (
            "You are EduGenie, a helpful AI tutor. Answer the student's question "
            "based on the provided study material context. Be clear and educational.\n\n"
            f"Context:\n{context}\n\n"
            f"Student Question: {question}\n\n"
            "Answer:"
        )
    else:
        prompt = (
            "You are EduGenie, a helpful AI tutor. The student has no uploaded notes yet. "
            "Answer their question using general educational knowledge.\n\n"
            f"Student Question: {question}\n\n"
            "Answer:"
        )

    reply = generate_text(prompt)
    return reply, sources
