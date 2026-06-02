/**
 * API client for backend communication.
 * Base URL is configured via VITE_API_URL environment variable.
 */

// All routes are served under the /v1 version prefix (D3).
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://weather-backend-uzto.onrender.com') + '/v1';

/**
 * Get clothing recommendations via POST request.
 * 
 * @param {Object} body - Request body
 * @param {number} body.latitude - Latitude coordinate (-90 to 90)
 * @param {number} body.longitude - Longitude coordinate (-180 to 180)
 * @param {number} [body.comfort_temperature] - Optional personal comfort temperature (default: 70°F)
 * @returns {Promise<Object>} Recommendation response
 */
export async function postScore(body) {
  const response = await fetch(`${API_BASE_URL}/score`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}








