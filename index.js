// Basic Express Server Setup for Vercel Deployment
const express = require('express');
const path = require('path');

// Initialize Express App
const app = express();

// Serve Static Files from 'dist' Directory
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-All Handler for Client-Side Routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Export App for Vercel
module.exports = app;