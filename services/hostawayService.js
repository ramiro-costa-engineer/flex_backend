const axios = require('axios');
const Review = require('../models/Review');

const HOSTAWAY_ACCOUNT_ID = process.env.HOSTAWAY_ACCOUNT_ID || '61148';
const HOSTAWAY_API_KEY = process.env.HOSTAWAY_API_KEY || 'f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152';
const HOSTAWAY_API_BASE = process.env.HOSTAWAY_API_BASE || 'https://api.hostaway.com/v1';

async function fetchReviewsFromAPI() {
  try {
    const response = await axios.get(`${HOSTAWAY_API_BASE}/reviews`, {
      headers: {
        'Authorization': `${HOSTAWAY_API_KEY}`,
        'Accept': 'application/json'
      },
      params: {
        accountId: HOSTAWAY_ACCOUNT_ID
      }
    });

    if (response.data && response.data.result && response.data.result.length > 0) {
      return response.data.result;
    }
    return [];
  } catch (error) {
    console.log('API returned no reviews, using mock data');
    return [];
  }
}

async function getMockReviewsFromMongoDB() {
  try {
    const reviews = await Review.find({}).sort({ submittedAt: -1 }).lean();
    return reviews.map(review => ({
      ...review,
      reviewCategory: review.categories || []
    }));
  } catch (error) {
    console.error('Error fetching mock reviews from MongoDB:', error.message);
    return [];
  }
}

async function getReviews() {
  let reviews = await fetchReviewsFromAPI();

  if (reviews.length === 0) {
    // Get mock data from MongoDB instead of static file
    reviews = await getMockReviewsFromMongoDB();
  }

  return reviews;
}

module.exports = {
  getReviews,
  fetchReviewsFromAPI
};

