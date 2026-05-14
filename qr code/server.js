const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow InfinityFree frontend to call this API
app.use(express.json());

// Ad configuration - You can modify these ads anytime
const adConfig = {
  bannerAd: {
    enabled: true,
    html: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px; text-align: center; font-size: 14px;">
             <span>📢 Advertisement</span>
             <div style="font-size: 12px; margin-top: 5px;">Your Banner Ad Here - Contact us for advertising</div>
           </div>`,
    clickUrl: "https://youradlink.com"
  },
  rewardAd: {
    enabled: true,
    html: `<div style="background: #4CAF50; color: white; padding: 15px; border-radius: 8px; text-align: center; cursor: pointer;">
             <strong>📺 Watch Ad for Free Scan</strong>
             <div style="font-size: 12px; margin-top: 5px;">Tap to support us and continue scanning</div>
           </div>`,
    clickUrl: "https://youradlink.com",
    rewardMessage: "Thanks for supporting! 🎉"
  }
};

// Analytics store (in-memory - resets on restart)
// For production, replace with MongoDB, PostgreSQL, or a free tier of Supabase
let analytics = {
  scans: [],
  adImpressions: [],
  adClicks: []
};

// ============= API ENDPOINTS =============

// Get ad configuration (called by frontend)
app.get('/api/ad/config', (req, res) => {
  // Add CORS headers for InfinityFree
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.json(adConfig);
});

// Track QR scan
app.post('/api/analytics/scan', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  const { data, timestamp } = req.body;
  analytics.scans.push({ 
    data: data.substring(0, 100), // Truncate long URLs
    timestamp, 
    ip: req.ip || req.headers['x-forwarded-for'] || 'unknown'
  });
  
  // Keep only last 1000 scans to prevent memory issues
  if (analytics.scans.length > 1000) analytics.scans.shift();
  
  console.log(`✅ Scan logged: ${data.substring(0, 50)} at ${timestamp}`);
  res.json({ success: true, totalScans: analytics.scans.length });
});

// Track ad events (impressions/clicks)
app.post('/api/analytics/ad', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  const { type, action, timestamp } = req.body;
  const logEntry = { type, action, timestamp, ip: req.ip || req.headers['x-forwarded-for'] || 'unknown' };
  
  if (action === 'impression') {
    analytics.adImpressions.push(logEntry);
  } else if (action === 'click') {
    analytics.adClicks.push(logEntry);
  }
  
  // Keep only last 1000 entries
  if (analytics.adImpressions.length > 1000) analytics.adImpressions.shift();
  if (analytics.adClicks.length > 1000) analytics.adClicks.shift();
  
  console.log(`📊 Ad ${action}: ${type} at ${timestamp}`);
  res.json({ success: true });
});

// Get analytics stats (protected - you can add API key later)
app.get('/api/analytics/stats', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({
    totalScans: analytics.scans.length,
    totalAdImpressions: analytics.adImpressions.length,
    totalAdClicks: analytics.adClicks.length,
    recentScans: analytics.scans.slice(-10),
    recentAdClicks: analytics.adClicks.slice(-10)
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 QR Scanner Backend running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Ready to accept requests from InfinityFree frontend`);
});
