/**
 * API client for backend communication.
 * Base URL is configured via VITE_API_URL environment variable.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

/**
 * Get clothing recommendations based on weather conditions.
 * 
 * @param {Object} params - Request parameters
 * @param {number} params.latitude - Latitude coordinate (-90 to 90)
 * @param {number} params.longitude - Longitude coordinate (-180 to 180)
 * @param {number} [params.comfort_temperature] - Optional personal comfort temperature (default: 70°F)
 * @returns {Promise<Object>} Recommendation response
 */
export async function getScore({ latitude, longitude, comfort_temperature }) {
  const url = new URL(`${API_BASE_URL}/score`);
  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);
  if (comfort_temperature !== undefined) {
    url.searchParams.set('comfort_temperature', comfort_temperature);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

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








