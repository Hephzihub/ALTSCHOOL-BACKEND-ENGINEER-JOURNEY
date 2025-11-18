// In-memory token blacklist
// For production, use Redis or a database for persistence
const blacklist = new Set();

export const addToBlacklist = (jti) => {
  blacklist.add(jti);
};

export const isBlacklisted = (jti) => {
  return blacklist.has(jti);
};

export const clearBlacklist = () => {
  blacklist.clear();
};

// Optional: Clear blacklist periodically (e.g., every 24 hours)
// This prevents memory leaks from expired tokens
setInterval(() => {
  if (blacklist.size > 0) {
    console.log(`Clearing token blacklist (${blacklist.size} tokens)`);
    blacklist.clear();
  }
}, 24 * 60 * 60 * 1000); // 24 hours
