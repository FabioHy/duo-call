// Configuration for Duo App Server & Cloud Connection
// When you deploy your server to Render, Railway, or VPS, simply paste the URL below.
// If empty, it defaults to localhost (local offline mode).

const DUO_CONFIG = {
  // Example: 'https://duo-call-app.onrender.com'
  SERVER_URL: ''
};

if (typeof window !== 'undefined') {
  window.DUO_CONFIG = DUO_CONFIG;
}
if (typeof module !== 'undefined') {
  module.exports = DUO_CONFIG;
}
