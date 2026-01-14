import { getAccessToken } from "../helper/getAccessToken.js";


export const emailWithAttachment = async (req, res) => {
    try {
        const refreshToken = req.session.user?.refresh_token;

        console.log('Refresh Token from Session:', refreshToken);

        if (!refreshToken) {
            return res.status(401).send('User not authenticated');
        }

        const accessToken = await getAccessToken(refreshToken);  // Retrieve stored access token
        if (!accessToken) {
            return res.status(401).send('User not authenticated');
        }

        console.log('Access Token:', accessToken);
        let pageToken;
        const results = [];

        do {
            
            const gmailResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?q=has:attachment&labelIds=INBOX&pageToken=${pageToken || ''}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'  // Ensure correct content type
                }
            });

            if (!gmailResponse.ok) {
                return res.status(500).send('Failed to fetch emails');
            }
            const gmailData = await gmailResponse.json();
            console.log('Gmail Data:', gmailData);

            for (const message of gmailData.messages || []) {
                const emailDetailsResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!emailDetailsResponse.ok) {
                    console.error(`Failed to fetch email details for message ID: ${message.id}`);
                    continue;  // Skip to next message
                }
                const emailDetails = await emailDetailsResponse.json();
                console.log('Email Details:', emailDetails);
                const headers = emailDetails.payload.headers;

                results.push({
                    id: message.id,
                    subject: headers.find(h => h.name === 'Subject')?.value || 'No Subject',
                    from: headers.find(h => h.name === 'From')?.value || 'Unknown Sender',
                    date: headers.find(h => h.name === 'Date')?.value || 'Unknown Date'
                });
            }
            pageToken = gmailData.nextPageToken;

        } while (pageToken);
        res.status(200).json({ emails: results });
    } catch (error) {
        console.error('Error fetching emails with attachments:', error);
        res.status(500).send('Internal Server Error');
    }
};