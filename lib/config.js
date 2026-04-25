export const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

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