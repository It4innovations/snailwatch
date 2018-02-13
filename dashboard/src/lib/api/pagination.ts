/**
 * Calculates which page to request from the server.
 * @param {number} currentCount Current amount of items fetched.
 * @param {number} requestCount Requested amount of items to fetch.
 * @returns {number} Page number to fetch.
 */
export function getPage(currentCount: number, requestCount: number): number
{
    return Math.floor(currentCount / requestCount) + 1;
}
