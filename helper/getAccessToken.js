import fetch from 'node-fetch';
import 'dotenv/config';



export async function getAccessToken(refreshToken) {
    if (!refreshToken) {
        throw new Error('Refresh token is required to get access token');
    }
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        })
    });

    if (!tokenResponse.ok) {
        throw new Error('Failed to refresh access token');
    }
    const tokenData = await tokenResponse.json();
    console.log('Refreshed Access Token Data:', tokenData);
    return tokenData.access_token;
}