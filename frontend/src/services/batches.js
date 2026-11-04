const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function getBatches({ page, limit, search, status, centre }, signal) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), search, status, centre });
  const response = await fetch(`${API_URL}/batches?${params}`, { signal });
  if (!response.ok) throw new Error(`Could not load batches (HTTP ${response.status}).`);
  const result = await response.json();
  if (!result.success) throw new Error('The server could not load the batches.');
  return result;
}
