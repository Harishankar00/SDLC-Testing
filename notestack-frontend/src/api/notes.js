import CONFIG from "../config";
import { getIdToken } from "./auth";

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: getIdToken(),
  };
}

export async function createNote(title, content, fileKey) {
  const body = { title, content };
  if (fileKey) body.fileKey = fileKey;

  const res = await fetch(`${CONFIG.API_URL}/notes`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function getNotes() {
  const res = await fetch(`${CONFIG.API_URL}/notes`, {
    method: "GET",
    headers: headers(),
  });
  return res.json();
}

export async function updateNote(noteId, title, content) {
  const res = await fetch(`${CONFIG.API_URL}/notes`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ noteId, title, content }),
  });
  return res.json();
}

export async function deleteNote(noteId) {
  const res = await fetch(`${CONFIG.API_URL}/notes`, {
    method: "DELETE",
    headers: headers(),
    body: JSON.stringify({ noteId }),
  });
  return res.json();
}

export async function getUploadUrl(fileName, fileType) {
  const res = await fetch(`${CONFIG.API_URL}/notes/upload-url`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ fileName, fileType }),
  });
  return res.json();
}

export async function uploadFileToS3(uploadUrl, file) {
  await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
}
