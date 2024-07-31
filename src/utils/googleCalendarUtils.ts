// import { google, calendar_v3 } from 'googleapis';
// import { OAuth2Client } from 'google-auth-library';
// import fs from 'fs';
// import path from 'path';

// const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// const TOKEN_PATH = path.join(__dirname, '../../token.json');
// const CREDENTIALS_PATH = path.join(__dirname, '../../credentials.json');

// export const authorize = async (): Promise<OAuth2Client> => {
//     const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
//     const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
//     const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//     if (fs.existsSync(TOKEN_PATH)) {
//         const token = fs.readFileSync(TOKEN_PATH, 'utf-8');
//         oAuth2Client.setCredentials(JSON.parse(token));
//         return oAuth2Client;
//     } else {
//         throw new Error('Token not found. Please authorize the app.');
//     }
// };

// export const addEvent = async (auth: OAuth2Client, event: calendar_v3.Schema$Event) => {
//     const calendar = google.calendar({ version: 'v3', auth });
//     try {
//         const response = await calendar.events.insert({
//             calendarId: 'primary',
//             requestBody: event,
//         });
//         console.log('Event created: %s', response.data?.htmlLink);
//     } catch (error: any) {
//         console.error('Error creating event: %s', error.message);
//     }
// };
