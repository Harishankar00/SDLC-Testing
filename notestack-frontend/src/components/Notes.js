import React, { useState, useEffect, useCallback } from "react";
import { getNotes, createNote, updateNote, deleteNote, getUploadUrl, uploadFileToS3 } from "../api/notes";
import { getUserFromToken, signOut } from "../api/auth";
import "./Notes.css";

function Notes({ onLogout }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingNote, setEditingNote] = useState(null);

  const user = getUserFromToken();

  const loadNotes = useCallback(async () => {
    try {
      const data = await getNotes();
      setNotes(data.notes || []);
    } catch (err) {
      setError("Failed to load notes");
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    setError("");

    try {
      let fileKey = null;

      if (file) {
        const { uploadUrl, fileKey: key } = await getUploadUrl(file.name, file.type);
        await uploadFileToS3(uploadUrl, file);
        fileKey = key;
      }

      await createNote(title, content, fileKey);
      setTitle("");
      setContent("");
      setFile(null);
      await loadNotes();
    } catch (err) {
      setError("Failed to create note");
    }
    setLoading(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingNote) return;
    setLoading(true);
    setError("");

    try {
      await updateNote(editingNote.noteId, title, content);
      setEditingNote(null);
      setTitle("");
      setContent("");
      await loadNotes();
    } catch (err) {
      setError("Failed to update note");
    }
    setLoading(false);
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await deleteNote(noteId);
      await loadNotes();
    } catch (err) {
      setError("Failed to delete note");
    }
  };

  const startEdit = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setTitle("");
    setContent("");
  };

  const handleLogout = () => {
    signOut();
    onLogout();
  };

  const escapeHtml = (text) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="notes-container">
      <header className="notes-header">
        <div className="notes-header-left">
          <div className="header-logo">N</div>
          <h1>NoteStack</h1>
        </div>
        <div className="user-info">
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <span>{user?.name || user?.email}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      {error && <div className="notes-error">{error}</div>}

      <form onSubmit={editingNote ? handleUpdate : handleCreate} className="note-form">
        <h2>{editingNote ? "Edit Note" : "Create Note"}</h2>
        <input
          type="text"
          placeholder="Give your note a title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Write your thoughts here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          required
        />
        {!editingNote && (
          <div className="file-upload-area">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              accept=".pdf,.jpg,.png,.docx,.txt"
            />
            <p className="file-upload-text">
              {file ? (
                <span className="selected">{file.name}</span>
              ) : (
                "Drop a file here or click to upload (PDF, JPG, PNG, DOCX, TXT)"
              )}
            </p>
          </div>
        )}
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : editingNote ? "Update Note" : "Create Note"}
          </button>
          {editingNote && (
            <button type="button" onClick={cancelEdit} className="btn-cancel">Cancel</button>
          )}
        </div>
      </form>

      <div className="notes-list">
        <h2>Your Notes <span className="notes-count">{notes.length}</span></h2>
        {notes.length === 0 && (
          <div className="no-notes">
            <div className="no-notes-icon">&#128221;</div>
            <p>No notes yet. Create your first note above!</p>
          </div>
        )}
        {notes
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((note) => (
          <div key={note.noteId} className="note-card">
            <div className="note-card-header">
              <h3>{escapeHtml(note.title)}</h3>
              <div className="note-actions">
                <button onClick={() => startEdit(note)} className="btn-edit">Edit</button>
                <button onClick={() => handleDelete(note.noteId)} className="btn-delete">Delete</button>
              </div>
            </div>
            <p className="note-content">{escapeHtml(note.content)}</p>
            {note.fileKey && <p className="note-file">{note.fileKey.split("/").pop()}</p>}
            <p className="note-date">
              {new Date(note.createdAt).toLocaleString()}
              {note.updatedAt && ` (edited ${new Date(note.updatedAt).toLocaleString()})`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notes;
