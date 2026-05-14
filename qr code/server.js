const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ad configuration - you can modify this later
const adConfig = {
  bannerAd: {
    enabled: true,
    html: `<div style="background: #f0f0f0; padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">
             <small>Advertisement</small>
             <div style="font-size: 14px; color: #666;">Your Banner Ad Here</div>
           </div>`,
    clickUrl: "https://youradlink.com"
  },
  interstitialAd: {
    enabled: true,
    html: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px;">
             <h3>Special Offer!</h3>
             <p>Check out our premium features</p>
             <button onclick="window.open('https://youradlink.com')">Learn More</button>
           </div>`,
    clickUrl: "https://youradlink.com"
  },
  rewardAd: {
    enabled: true,
    html: `<div style="background: #4CAF50; color: white; padding: 15px; border-radius: 8px; text-align: center;">
             <strong>Watch Ad for Free Scan!</strong>
             <div style="font-size: 12px; margin-top: 5px;">Tap to earn 5 free scans</div>
           </div>`,
    clickUrl: "https://youradlink.com",
    rewardAmount: 5  // Give 5 free scans as reward
  }
};

// Analytics store (in production, you'd use a database)
let analytics = {
  scans: [],
  adImpressions: [],
  adClicks: []
};

// API Endpoints
app.get('/api/ad/config', (req, res) => {
  res.json(adConfig);
});

app.post('/api/analytics/scan', (req, res) => {
  const { data, timestamp } = req.body;
  analytics.scans.push({ data, timestamp, ip: req.ip });
  console.log(`Scan logged: ${data} at ${timestamp}`);
  res.json({ success: true });
});

app.post('/api/analytics/ad', (req, res) => {
  const { type, action, timestamp } = req.body;
  const logEntry = { type, action, timestamp, ip: req.ip };
  
  if (action === 'impression') {
    analytics.adImpressions.push(logEntry);
  } else if (action === 'click') {
    analytics.adClicks.push(logEntry);
  }
  
  console.log(`Ad ${action}: ${type} at ${timestamp}`);
  res.json({ success: true });
});

app.get('/api/analytics/stats', (req, res) => {
  res.json({
    totalScans: analytics.scans.length,
    totalAdImpressions: analytics.adImpressions.length,
    totalAdClicks: analytics.adClicks.length,
    recentScans: analytics.scans.slice(-10)
  });
});

// Serve the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the app at http://localhost:${PORT}`);
});