export const baseURL = "http://localhost:8080/api";

export function apiFetch(path, options = {}) {
	const headers = {
		"Content-Type": "application/json",
		...(options.headers || {}),
	};

	return fetch(baseURL + path, {
		...options,
		headers,
		credentials: "include",
	});
}