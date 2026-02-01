
import { getAccessToken } from '../../pipeline-api/src/auth/helper/getAccessToken.js';
import { extractAttachments } from './helper/extractAttachment.js';
import { runWithConcurrencyLimit } from './helper/runWithConcurrencyLimit.js';
import { fetchWithBackoff } from './helper/fetchWithBackoff.js';


/**
 * @param {*} refreshToken
 * @returns
 * 
 */

const MESSAGE_CONCURRENCY_LIMIT = 5;
export async function fetchEmails(refreshToken) {

    const accessToken = await getAccessToken(refreshToken);
    if (!accessToken) {
        throw new Error('Access token is required to fetch emails');
    }

    let pageToken = null;
    const results = [];
    do {
        let emailData;
        try {
        const url = `https://www.googleapis.com/gmail/v1/users/me/messages?q=has:attachment&labelIds=INBOX&pageToken=${pageToken || ''}`;
        const res = await fetchWithBackoff(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        });
        if (!res.ok) {
            throw new Error('Failed to fetch emails with attachments');
        }
         emailData = await res.json();
    } catch (error) {
        throw new Error(`Failed to list Gmail messages (pageToken=${pageToken ?? 'first'}): ${String(error)}`)
    }

    const messages = emailData.messages || [];
        const pageResults = await runWithConcurrencyLimit(
        messages,
        MESSAGE_CONCURRENCY_LIMIT,
        async (message) => {
            try {
            const url = `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`;
            const emailDetailsResponse = await fetchWithBackoff(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            });

            const emailDetails = await emailDetailsResponse.json();
            const payload = emailDetails.payload || {};
            const parts = payload.parts || [];
            const headers = payload.headers || [];

            const extractAttachment = extractAttachments(parts);

            if (extractAttachment.length > 0) {
                return{
                    emailId: message.id,
                    subject: headers.find(h => h.name === 'Subject')?.value || '',
                    from: headers.find(h => h.name === 'From')?.value || '',
                    date: headers.find(h => h.name === 'Date')?.value || '',
                    attachments: extractAttachment,
                };
            } 
        } catch (error) {
            console.error(`Error processing message ID ${message.id}:`, error);
            }
        });
        results.push(...pageResults.filter(r => r !== undefined));  
        pageToken = emailData.nextPageToken;
    } while (pageToken);
    return results;
}