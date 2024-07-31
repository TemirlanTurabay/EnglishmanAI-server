import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

export const getAuthUrl = () => {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/calendar'
    ];

    return client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes
    });
};

export const getGoogleAccountFromCode = async (code: string) => {
    try {
        const { tokens } = await client.getToken(code);

        console.log('Tokens received from Google:', tokens);

        if (!tokens || !tokens.access_token || !tokens.refresh_token || !tokens.scope || !tokens.token_type || !tokens.expiry_date) {
            throw new Error('Missing tokens');
        }
        client.setCredentials(tokens);

        const oauth2 = google.oauth2({
            auth: client,
            version: 'v2'
        });

        const { data } = await oauth2.userinfo.get();
        return { data, tokens };
    } catch (error) {
        console.error('Error while exchanging code for tokens:', error);
        throw error;
    }
};

export const addEvent = async (auth: OAuth2Client, event: any) => {
    const calendar = google.calendar({ version: 'v3', auth });
    await calendar.events.insert({
        auth,
        calendarId: 'primary',
        requestBody: event
    });
};
