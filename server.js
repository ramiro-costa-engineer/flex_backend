require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const reviewsRoutes = require('./routes/reviews');
const managerRoutes = require('./routes/manager');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flexliving';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1);
});


// enable CORS and JSON parsing before API routes
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/reviews', reviewsRoutes);
app.use('/api/manager', managerRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Serve frontend build (prefer backend/build; fall back to ../frontend/build)
const backendBuild = path.join(__dirname, 'build');
const frontendBuild = path.join(__dirname, '..', 'frontend', 'build');
let buildPath = null;
if (fs.existsSync(backendBuild)) {
  buildPath = backendBuild;
} else if (fs.existsSync(frontendBuild)) {
  buildPath = frontendBuild;
}

if (buildPath) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});