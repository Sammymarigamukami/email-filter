import fetch from 'node-fetch';


/**
 * 
 * @param {*} attempt  number of the current attempt (0 for first retry, 1 for second, etc.)
 * @param {*} baseDelay  base delay in milliseconds
 * @param {*} maxDelay  maximum delay in milliseconds
 * @returns {number} The calculated delay in milliseconds
 * 
 * Formula:
 *   delay = baseDelay * (2 ^ attempt) + jitter
 *
 * What this means:
 * - First retry waits a short time.
 * - Each subsequent retry waits exponentially longer.
 * - Jitter (randomness) prevents many parallel workers from retrying
 *   at the exact same time (thundering herd problem).
 *
 * Why this matters:
 * - APIs signal overload (429) expecting clients to slow down.
 * - Immediate retries make rate limits worse, not better.
 * - Exponential growth quickly reduces request pressure
 *   while still allowing recovery.
 *
 * This delay is:
 * - Deterministic in growth
 * - Bounded (via maxRetries in the caller)
 * - Independent per request
 * 
 */

function backoffDelay(attempt, baseDelay = 500, maxDelay = 10000) {  // Exponential backoff calculation
    const delay = Math.min(baseDelay * 2 ** attempt, maxDelay);   // Cap the delay to maxDelay
    const jitter = Math.random() * 300   // Add some jitter to avoid thundering herd problem
    return delay + jitter;  
}

/**
 * 
 * @param {*} url 
 * @param {*} options 
 * @param {*} maxRetries 
 * @returns 
 * 
 * Makes an HTTP request with automatic exponential backoff on rate-limit
 * and transient server failures.
 *
 * How it works:
 * - Sends the request normally.
 * - If the response is successful, returns it immediately.
 * - If the server responds with 429 (Too Many Requests) or 5xx:
 *     - Waits for a short delay.
 *     - Retries the request.
 *     - Each retry waits longer than the previous one (exponential backoff).
 * - Adds random jitter to the delay to prevent retry storms
 *   when many workers fail at the same time.
 *
 * Why this exists:
 * - Gmail APIs enforce strict per-method quota limits.
 * - When limits are exceeded, the server *expects* clients to slow down.
 * - Retrying immediately makes the problem worse and can lead to
 *   longer bans or dropped requests.
 * - Backoff lets the system recover while still making progress.
 *
 * What this function guarantees:
 * - Never retries infinitely (bounded by maxRetries).
 * - Never floods the API after a 429.
 * - Plays well with concurrency limits by slowing retries independently.
 *
 * This is NOT a simple sleep:
 * - Delay grows after each failure.
 * - Successful calls reset the retry cycle.
 */

export async function fetchWithBackoff(url, options, maxRetries = 5) {
    let attempt = 0;

    while (true) {
        try {
            const res = await fetch(url, options);
            if (res.ok) {
                return res;
            }
            // For non-retryable errors (not 429 or 5xx), throw immediately
            if (res.status !== 429 && res.status < 500) {
                throw new Error(`Request failed with status ${res.status}`);
            }
            // For 429 or 5xx, check if we have retries left
            if (attempt >= maxRetries) {
                throw new Error(`Max retries reached. Last status: ${res.status}`);
            }

            const delay = backoffDelay(attempt);
            attempt++;  // Increment attempt for next backoff calculation
            console.warn(`Request failed with status ${res.status}. Retrying in ${Math.round(delay)} ms... (attempt ${attempt} of ${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        } catch (error) {
            /**
             * Handles network errors or other exceptions during fetch.
             * - If the error is not related to rate limiting or server issues, it is thrown immediately.
             * - If the maximum number of retries has been reached, the error is thrown.
             */
            if (attempt >= maxRetries) throw error;
            const delay = backoffDelay(attempt);
            attempt++;
            console.warn(`Network error, retrying in ${Math.round(delay)} ms... (attempt ${attempt} of ${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}