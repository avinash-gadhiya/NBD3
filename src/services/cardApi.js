export async function fetchCardContent(signal) {
  const response = await fetch('/api/card', { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Card request failed: ${response.status}`);
  return response.json();
}
