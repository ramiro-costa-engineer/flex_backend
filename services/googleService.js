const axios = require('axios');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';

// simple in-memory cache: placeId -> { ts, data }
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

async function fetchReviewsFromPlaces(placeId) {
  if (!placeId) return { reviews: [] };

  const now = Date.now();
  const cached = cache.get(placeId);
  if (cached && now - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  try {
    const url = 'https://maps.googleapis.com/maps/api/place/details/json';
    const params = {
      place_id: placeId,
      fields: 'name,rating,reviews',
      key: GOOGLE_API_KEY
    };

    const resp = await axios.get(url, { params });
    const result = resp.data && resp.data.result ? resp.data.result : {};
    const rawReviews = Array.isArray(result.reviews) ? result.reviews : [];

    const reviews = rawReviews.map((r, idx) => ({
      id: `google-${placeId}-${idx}`,
      type: 'guest-to-host',
      status: 'published',
      rating: r.rating || null,
      publicReview: r.text || '',
      categories: [],
      submittedAt: r.time ? new Date(r.time * 1000) : null,
      guestName: r.author_name || 'Guest',
      listingName: result.name || placeId,
      channel: 'google'
    }));

    const data = { reviews };
    cache.set(placeId, { ts: now, data });
    return data;
  } catch (err) {
    console.error('googleService.fetchReviewsFromPlaces error:', err.message);
    return { reviews: [] };
  }
}

module.exports = {
  fetchReviewsFromPlaces
};
