import { apiFetch } from "./config.js";

async function parseJsonSafe(response) {
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

async function parseOrThrow(response, fallbackMessage) {
  const body = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(body?.error || fallbackMessage);
  }

  return body;
}

export async function getOAuthClients() {
  const response = await apiFetch("/oauth/client", { method: "GET" });
  const body = await parseOrThrow(response, "Failed to fetch OAuth clients");
  return body.clients || [];
}

export async function getOAuthClientById(clientId) {
  const response = await apiFetch(`/oauth/client/${clientId}`, { method: "GET" });
  const body = await parseOrThrow(response, "Failed to fetch OAuth client");
  return body.client;
}

export async function createOAuthClient(payload) {
  const response = await apiFetch("/oauth/client", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return parseOrThrow(response, "Failed to create OAuth client");
}

export async function updateOAuthClient(clientId, payload) {
  const response = await apiFetch(`/oauth/client/${clientId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return parseOrThrow(response, "Failed to update OAuth client");
}

export async function deleteOAuthClient(clientId) {
  const response = await apiFetch(`/oauth/client/${clientId}`, {
    method: "DELETE",
  });

  if (response.status === 204) {
    return { message: "Client deleted" };
  }

  return parseOrThrow(response, "Failed to delete OAuth client");
}

export async function getOAuthScopes() {
  const response = await apiFetch("/oauth/scope", { method: "GET" });
  const body = await parseOrThrow(response, "Failed to fetch OAuth scopes");
  return body.scopes || [];
}

export async function createOAuthScope(payload) {
  const response = await apiFetch("/oauth/scope", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return parseOrThrow(response, "Failed to create OAuth scope");
}

export async function deleteOAuthScope(scopeName) {
  const response = await apiFetch(`/oauth/scope/${encodeURIComponent(scopeName)}`, {
    method: "DELETE",
  });

  if (response.status === 204) {
    return { message: "Scope deleted" };
  }

  return parseOrThrow(response, "Failed to delete OAuth scope");
}
