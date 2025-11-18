const hostawayService = require('../services/hostawayService');
const reviewService = require('../services/reviewService');
const approvalService = require('../services/approvalService');
const googleService = require('../services/googleService');

async function getHostawayReviews(req, res) {
  try {
    const reviews = await hostawayService.getReviews();
    const normalizedReviews = reviewService.normalizeReviews(reviews);
    const approvalMap = await approvalService.getApprovalMap();

    const enrichedReviews = normalizedReviews.map((review) => {
      const approval = approvalMap[review.id];
      if (approval) {
        return {
          ...review,
          approved: approval.approved,
          approval: {
            approvedBy: approval.approvedBy,
            approvedAt: approval.approvedAt,
            notes: approval.notes || null,
          },
        };
      }
      return review;
    });

    // Apply filters and sorting
    const filtered = applyFiltersAndSort(enrichedReviews, req.query);

    const groupedByListing = reviewService.groupReviewsByListing(enrichedReviews);
    const groupedByType = reviewService.groupReviewsByType(enrichedReviews);
    const groupedByChannel = reviewService.groupReviewsByChannel(enrichedReviews);
    const groupedByDate = reviewService.groupReviewsByDate(enrichedReviews, 'month');

    const statistics = {
      total: enrichedReviews.length,
      byListing: Object.keys(groupedByListing).map(listing => ({
        listing,
        count: groupedByListing[listing].length
      })),
      byType: Object.keys(groupedByType).map(type => ({
        type,
        count: groupedByType[type].length
      })),
      byChannel: Object.keys(groupedByChannel).map(channel => ({
        channel,
        count: groupedByChannel[channel].length
      })),
      byDate: Object.keys(groupedByDate).map(date => ({
        date,
        count: groupedByDate[date].length
      }))
    };

    const filterOptions = reviewService.filterOptions(normalizedReviews);
    
    res.json({
      status: 'success',
      count: filtered.length,
      reviews: filtered,
      statistics,
      filterOptions
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
}

function applyFiltersAndSort(reviews, query) {
  let filtered = [...reviews];

  // Filter by listing
  if (query.listing && query.listing !== '') {
    filtered = filtered.filter(r => r.listingName === query.listing);
  }

  // Filter by rating
  if (query.rating && query.rating !== '') {
    const minRating = parseFloat(query.rating);
    filtered = filtered.filter(r => r.rating >= minRating);
  }

  // Filter by category
  if (query.category && query.category !== '') {
    filtered = filtered.filter(r =>
      r.categories && r.categories.some(c => c.category === query.category)
    );
  }

  // Filter by type
  if (query.type && query.type !== '') {
    filtered = filtered.filter(r => r.type === query.type);
  }

  // Filter by channel
  if (query.channel && query.channel !== '') {
    filtered = filtered.filter(r => r.channel === query.channel);
  }

  // Filter by date range
  if (query.dateRange && query.dateRange !== 'all') {
    const now = new Date();
    let startDate = new Date();

    switch (query.dateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      default:
        startDate = new Date(0);
    }

    filtered = filtered.filter(r => new Date(r.submittedAt) >= startDate);
  }

  // Sort
  const sortBy = query.sortBy || 'date';
  
  switch (sortBy) {
    case 'date':
      filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      break;
    case 'rating':
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'listing':
      filtered.sort((a, b) => a.listingName.localeCompare(b.listingName));
      break;
    default:
      filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }

  return filtered;
}


module.exports = {
  getHostawayReviews,
  getGoogleReviews: async function (req, res) {
    try {
      const placeId = req.query.placeId;
      if (!placeId) {
        return res.status(400).json({ status: 'error', message: 'placeId is required' });
      }

      const data = await googleService.fetchReviewsFromPlaces(placeId);
      const normalized = reviewService.normalizeReviews(data.reviews || []);

      // Enrich with approval map if any approvals exist for these ids
      const approvalMap = await approvalService.getApprovalMap();
      const enriched = normalized.map((review) => {
        const approval = approvalMap[review.id];
        if (approval) {
          return {
            ...review,
            approved: approval.approved,
            approval: {
              approvedBy: approval.approvedBy,
              approvedAt: approval.approvedAt,
              notes: approval.notes || null,
            },
          };
        }
        return review;
      });

      const filterOptions = reviewService.filterOptions(normalized);

      res.json({ status: 'success', count: enriched.length, reviews: enriched, filterOptions });
    } catch (err) {
      console.error('Error fetching google reviews:', err);
      res.status(500).json({ status: 'error', message: 'Failed to fetch google reviews' });
    }
  }
};

