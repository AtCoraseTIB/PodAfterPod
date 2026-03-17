// Change this to your backend's IP when running on a real device
// e.g. 'http://192.168.1.100:8000'
const BASE_URL = 'http://YOUR_MACHINE_IP:8000'; // e.g. http://192.168.1.50:8000

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Podcasts
  listPodcasts: () => request('GET', '/podcasts/'),
  subscribe: (feedUrl) => request('POST', '/podcasts/subscribe', { feed_url: feedUrl }),
  refreshPodcast: (id) => request('POST', `/podcasts/${id}/refresh`),
  unsubscribe: (id) => request('DELETE', `/podcasts/${id}`),

  // Episodes
  listEpisodes: (podcastId) => request('GET', `/episodes/podcast/${podcastId}`),
  getQueue: () => request('GET', '/episodes/queue'),
  getEpisode: (id) => request('GET', `/episodes/${id}`),
  updateProgress: (id, position, isPlayed) =>
    request('PATCH', `/episodes/${id}/progress`, { position, is_played: isPlayed }),
  markPlayed: (id) => request('PATCH', `/episodes/${id}/played`),
  markUnplayed: (id) => request('PATCH', `/episodes/${id}/unplayed`),
  addToQueue: (id) => request('PATCH', `/episodes/${id}/queue`, { in_queue: true }),
  removeFromQueue: (id) => request('PATCH', `/episodes/${id}/queue`, { in_queue: false }),

  // Search
  search: (q) => request('GET', `/search/?q=${encodeURIComponent(q)}`),
};
