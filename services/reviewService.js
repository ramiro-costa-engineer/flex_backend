function parseDate(dateString) {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return {
    original: dateString,
    iso: date.toISOString(),
    timestamp: date.getTime(),
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    formatted: date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };
}

function extractChannel(review) {
  if (review.channel) {
    return review.channel.toLowerCase();
  }
  
  if (review.source) {
    return review.source.toLowerCase();
  }
  
  return 'hostaway';
}

function normalizeListingName(listingName) {
  if (!listingName) return 'Unknown Listing';
  
  return listingName.trim();
}

function normalizeReviewType(type) {
  if (!type) return 'unknown';
  
  const normalized = type.toLowerCase().trim();
  
  const validTypes = ['guest-to-host', 'host-to-guest', 'guest_to_host', 'host_to_guest'];
  
  if (normalized === 'guest_to_host' || normalized === 'guest-to-host') {
    return 'guest-to-host';
  }
  
  if (normalized === 'host_to_guest' || normalized === 'host-to-guest') {
    return 'host-to-guest';
  }
  
  return normalized;
}

function normalizeReview(review) {
  const categoryRatings = {};
  let overallRating = null;

  if (review.reviewCategory && review.reviewCategory.length > 0) {
    const ratings = review.reviewCategory.map(cat => cat.rating).filter(r => r !== null);
    if (ratings.length > 0) {
      overallRating = (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1);
    }
    review.reviewCategory.forEach(cat => {
      categoryRatings[cat.category] = cat.rating;
    });
  }

  const channel = extractChannel(review);
  const listingName = normalizeListingName(review.listingName);
  const reviewType = normalizeReviewType(review.type);
  const dateInfo = parseDate(review.submittedAt);

  return {
    id: review.id,
    type: reviewType,
    status: review.status || 'unknown',
    rating: parseFloat(review.rating) || parseFloat(overallRating) || null,
    overallRating: parseFloat(overallRating) || null,
    publicReview: review.publicReview || '',
    categoryRatings,
    categories: review.reviewCategory || [],
    submittedAt: review.submittedAt,
    dateInfo,
    guestName: review.guestName || 'Anonymous',
    listingName,
    channel,
    approved: false,
    normalizedBy: {
      listing: listingName,
      type: reviewType,
      channel: channel,
      date: dateInfo ? dateInfo.iso : null
    }
  };
}

function normalizeReviews(reviews) {
  return reviews.map(normalizeReview);
}

function groupReviewsByListing(reviews) {
  const grouped = {};
  reviews.forEach(review => {
    const listing = review.listingName || 'Unknown Listing';
    if (!grouped[listing]) {
      grouped[listing] = [];
    }
    grouped[listing].push(review);
  });
  return grouped;
}

function groupReviewsByType(reviews) {
  const grouped = {
    'guest-to-host': [],
    'host-to-guest': [],
    'unknown': []
  };
  reviews.forEach(review => {
    const type = review.type || 'unknown';
    if (grouped[type]) {
      grouped[type].push(review);
    } else {
      grouped['unknown'].push(review);
    }
  });
  return grouped;
}

function groupReviewsByChannel(reviews) {
  const grouped = {};
  reviews.forEach(review => {
    const channel = review.channel || 'hostaway';
    if (!grouped[channel]) {
      grouped[channel] = [];
    }
    grouped[channel].push(review);
  });
  return grouped;
}

function groupReviewsByDate(reviews, groupBy = 'month') {
  const grouped = {};
  reviews.forEach(review => {
    if (!review.dateInfo) return;
    
    let key;
    if (groupBy === 'year') {
      key = review.dateInfo.year.toString();
    } else if (groupBy === 'month') {
      key = `${review.dateInfo.year}-${String(review.dateInfo.month).padStart(2, '0')}`;
    } else if (groupBy === 'day') {
      key = `${review.dateInfo.year}-${String(review.dateInfo.month).padStart(2, '0')}-${String(review.dateInfo.day).padStart(2, '0')}`;
    } else {
      key = review.dateInfo.iso;
    }
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(review);
  });
  return grouped;
}

function filterOptions(normalizedReviews) {
  // Extract unique listings
  const uniqueListings = [...new Set(normalizedReviews.map(r => r.listingName))].sort();

  // Extract unique types
  const uniqueTypes = [...new Set(normalizedReviews.map(r => r.type).filter(Boolean))].sort();

  // Extract unique channels
  const uniqueChannels = [...new Set(normalizedReviews.map(r => r.channel).filter(Boolean))].sort();

  // Extract unique categories
  const uniqueCategories = new Set();
  normalizedReviews.forEach(r => {
    r.categories?.forEach(cat => uniqueCategories.add(cat.category));
  });
  const categoriesArray = [...uniqueCategories].sort();
  return {
    listings: uniqueListings,
    types: uniqueTypes,
    channels: uniqueChannels,
    categories: categoriesArray
  };
}

module.exports = {
  normalizeReview,
  normalizeReviews,
  parseDate,
  extractChannel,
  normalizeListingName,
  normalizeReviewType,
  groupReviewsByListing,
  groupReviewsByType,
  groupReviewsByChannel,
  groupReviewsByDate,
  filterOptions
};

