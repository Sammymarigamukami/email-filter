

/**
 * 
 * @param {*} items 
 * @param {*} limit 
 * @param {*} taskHandler  async function that processes an item and returns a result
 * @returns 
 * 
 * How it works:
 * - Creates `limit` worker loops (not one per item).
 * - Each worker repeatedly takes the next item from a shared index.
 * - At most `limit` async `worker()` calls run at the same time.
 * - When one task finishes, the worker immediately picks the next item.
 * - Errors are isolated per item and do not stop the whole run.
 *
 * Why this exists:
 * - Prevents flooding external APIs with too many concurrent requests.
 * - Faster than sequential processing, safer than Promise.all().
 *
 * Returns:
 * - An array of non-null results, collected as tasks complete.
 */


export async function runWithConcurrencyLimit(items, limit, taskHandler) {
    const results = [];
    let index = 0;
    /**
     * Worker function:
     * - Runs in a loop until all items are processed.
     * - Atomically increments the shared index to get the next item.
     * - Awaits the task handler for the current item.
     * - Collects non-null results into the results array.
     */
    const workers = Array.from({ length: limit }).map(async () => {
        while (index < items.length) {
            const currentIndex = index++;
            try {
                /**
                 * Processes the current item using the provided task handler.
                 * - If the task handler returns a non-null result, it is added to the results array.
                 * - Errors during processing are caught and logged, allowing other workers to continue.
                 */
                const result = await taskHandler(items[currentIndex]);

                // Only collect non-null results
                if (result !== null) {
                    results.push(result);
                }
            } catch (error) {
                console.error(`Error processing item at index ${currentIndex}:`, error);
            }
        }
    });
    /**
     * Waits for all worker loops to complete before returning results.
     * - Uses Promise.all to await the completion of all worker promises.
     */
    await Promise.all(workers);
    return results;
}
