// Buyer/seller token (unchanged)
let accessToken = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

// Admin token 

let adminAccessToken = null;

export function getAdminAccessToken() {
  return adminAccessToken;
}

export function setAdminAccessToken(token) {
  adminAccessToken = token;
}

export function clearAdminAccessToken() {
  adminAccessToken = null;
}