

/**
 * 
 * @param {*} items 
 * @param {*} limit 
 * @param {*} taskHandler 
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

    const workers = Array.from({ length: limit }).map(async () => {
        while (index < items.length) {
            const currentIndex = index++;
            try {

                const result = await taskHandler(items[currentIndex]);
                if (result !== null) {
                    results.push(result);
                }
            } catch (error) {
                console.error(`Error processing item at index ${currentIndex}:`, error);
            }
        }
    });
    await Promise.all(workers);
    return results;
}
