require('dotenv').config();
const mongoose = require('mongoose');
const mockReviews = require('../data/mockReviews');

// Review Schema
const reviewSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  type: { type: String, required: true },
  status: { type: String, required: true },
  rating: { type: Number, default: null },
  publicReview: { type: String, required: true },
  categories: [{
    category: String,
    rating: Number
  }],
  submittedAt: { type: Date, required: true },
  guestName: { type: String, required: true },
  listingName: { type: String, required: true },
  channel: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'reviews' });

const Review = mongoose.model('Review', reviewSchema);

async function migrateMockReviews() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/flex-living';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // Clear existing reviews
    await Review.deleteMany({});
    console.log('✓ Cleared existing reviews');

    // Function to generate mock reviews
    function generateMockReviews(baseReviews, count) {
      const listings = [
        '2B N1 A - 29 Shoreditch Heights',
        '3B P2 - 15 High Street',
        '1B Studio - 42 Market Square',
        'Luxury Penthouse - Chelsea',
        'Cozy Apartment - Soho',
        'Modern Studio - Kings Cross',
        'Spacious 3B - Kensington',
        'Charming 2B - Notting Hill',
        'Bright 1B - Bloomsbury',
        'Victorian House - Belgravia'
      ];

      const guestNames = [
        'Shane Finkelstein', 'Sarah Johnson', 'Michael Chen', 'Emma Williams',
        'David Brown', 'Lisa Anderson', 'James Taylor', 'Robert Miller',
        'Jennifer White', 'Christopher Lee', 'Patricia Martinez', 'Daniel Garcia',
        'Linda Rodriguez', 'Matthew Harris', 'Barbara Clark', 'Mark Lewis',
        'Susan Walker', 'Donald Young', 'Jessica King', 'Steven Wright',
        'Karen Lopez', 'Paul Hill', 'Nancy Scott', 'George Green',
        'Betty Adams', 'Edward Nelson', 'Sandra Carter', 'Ronald Mitchell',
        'Ashley Roberts', 'Brian Phillips', 'Kathleen Campbell', 'Kevin Parker'
      ];

      const reviews = [];
      let nextId = 7461;

      // Add base mock reviews first
      baseReviews.forEach(review => {
        reviews.push({
          ...review,
          categories: review.reviewCategory || review.categories || [],
          submittedAt: new Date(review.submittedAt || Date.now())
        });
      });

      // Generate additional reviews to reach 100
      const reviewTexts = [
        'Amazing location and very clean apartment. Host was responsive and helpful.',
        'Nice place but could use better Wi-Fi. Otherwise great stay!',
        'Perfect stay! Everything was exactly as described. Will definitely book again.',
        'The place was okay but had some maintenance issues that need attention.',
        'Exceeded expectations! Beautiful decor and excellent location. Highly recommend.',
        'Great value for money. The check-in process was smooth and the place was well-maintained.',
        'Excellent guests! Very respectful and left the place spotless.',
        'The apartment was spacious and well-equipped. Very satisfied with the stay.',
        'Good location but the noise from the street was a bit much.',
        'Outstanding! The host was very accommodating and responsive to all requests.',
        'Decent place, nothing special. Fair price for the area.',
        'Absolutely love this place! Will definitely come back.',
        'Some issues with the plumbing, but the host fixed them quickly.',
        'Beautiful views and very comfortable beds. Highly recommend!',
        'The Wi-Fi was great and the place was very clean. Great stay overall.',
        'Not as clean as expected, but the location made up for it.',
        'Fantastic experience! The host went above and beyond to make us comfortable.',
        'The place is charming and well-decorated. Perfect for a weekend getaway.',
        'Had a great time here. Would recommend to friends and family.',
        'The neighborhood is amazing, great restaurants and shops nearby.',
        'Everything was perfect! The host provided great recommendations.',
        'Good value for money. Would stay here again.',
        'The apartment is bigger than it looks in the pictures. Very satisfied.',
        'Perfect location! Very close to all the main attractions.',
        'The host was very friendly and helpful. Great communication.',
        'Beautiful place with all the amenities you need. Highly satisfied.',
        'The stay was wonderful. The host made us feel very welcome.',
        'Great apartment in a convenient location. Would book again.',
        'The place exceeded our expectations. Outstanding value for money.',
        'Very comfortable and clean. The host was very responsive.',
      ];

      const categories = [
        { category: 'cleanliness', rating: 5 },
        { category: 'communication', rating: 5 },
        { category: 'value', rating: 5 },
        { category: 'location', rating: 5 },
        { category: 'accuracy', rating: 5 }
      ];

      // Generate remaining reviews
      for (let i = 0; i < count - baseReviews.length; i++) {
        const rating = Math.random() > 0.15 ? Math.floor(Math.random() * 2) + 4 : Math.floor(Math.random() * 3) + 2; // Most 4-5, some 2-4
        const randomCategories = categories.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 2);

        const daysAgo = Math.floor(Math.random() * 365);
        const submittedDate = new Date();
        submittedDate.setDate(submittedDate.getDate() - daysAgo);

        reviews.push({
          id: nextId++,
          type: Math.random() > 0.7 ? 'host-to-guest' : 'guest-to-host',
          status: 'published',
          rating: rating,
          publicReview: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
          categories: randomCategories,
          submittedAt: submittedDate,
          guestName: guestNames[Math.floor(Math.random() * guestNames.length)],
          listingName: listings[Math.floor(Math.random() * listings.length)],
          channel: 'hostaway'
        });
      }

      return reviews;
    }

    const allReviews = generateMockReviews(mockReviews, 100);
    console.log(`✓ Generated ${allReviews.length} mock reviews`);

    // Insert reviews into MongoDB
    await Review.insertMany(allReviews);
    console.log(`✓ Successfully inserted ${allReviews.length} reviews into MongoDB`);

    // Verify count
    const count = await Review.countDocuments();
    console.log(`✓ Total reviews in database: ${count}`);

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateMockReviews();
