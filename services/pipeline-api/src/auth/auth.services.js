import crypto from 'crypto';
import fetch from 'node-fetch';
import 'dotenv/config';



function generateState() {
    return crypto.randomBytes(20).toString('hex');
}


export const getGoogleOAuthState = (req, res) => {

    const urlScope = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/gmail.readonly',
    ].join(' ');

    const state = generateState();
    req.session.google_oauth_state = state;  // Save state in session to verify later

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.append('client_id', process.env.GOOGLE_CLIENT_ID);
    url.searchParams.append('redirect_uri', process.env.GOOGLE_REDIRECT_URI);
    url.searchParams.append('response_type', 'code');   // Authorization code flow
    url.searchParams.append('scope', urlScope);     // Requested permissions
    url.searchParams.append('state', state);  // To prevent CSRF attacks
    url.searchParams.append('access_type', 'offline');   // To receive refresh token
    url.searchParams.append('prompt', 'consent');   // To ensure refresh token is received

    res.redirect(url.toString());
}

export const googleOAuthCallback = async (req, res) => {
    try {
    const { code, state } = req.query;
    const savedState = req.session.google_oauth_state;

    console.log('Received OAuth Callback with code:', code);
    console.log('Received OAuth Callback with state:', state);
    console.log('Saved state in session:', savedState);

    if (state !== savedState) {
        return res.status(400).send('Invalid state parameter');
    }

    delete req.session.google_oauth_state;

    if (!code) {
        return res.status(400).send('Authorization code not provided');
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },

        body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code',
            code: code,
        })
    });

    if (!tokenResponse.ok) {
        return res.status(500).send('Failed to exchange authorization code for tokens');
    }

    const tokenData = await tokenResponse.json();

    console.log('Token Data:', tokenData);
    const { access_token, refresh_token } = tokenData;


    if (!access_token || !refresh_token) {
        return res.status(500).send('Access token not provided');
    }


    const userinfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${access_token}`,
        }
    });

    if (!userinfo.ok) {
        return res.status(500).send('Failed to fetch user info');
    }
    const userData = await userinfo.json();
    console.log('User Info:', userData);

    const { email } = userData;

    console.log(`User ${email} authenticated successfully via Google OAuth.`);

        req.session.user = {
        email: email,
        refresh_token: refresh_token,
    }

    return res.redirect('http://localhost:3000'); 

} catch (error) {
    console.error('Error during Google OAuth callback:', error);
    res.status(500).send('Internal Server Error');
  }
};