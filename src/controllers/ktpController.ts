import { Request, Response } from 'express';
import axios from 'axios';
import User, { IUser } from '../models/User';
import PDFDocument from 'pdfkit';
import { generateKTPPDF, AdditionalContent } from '../utils/pdfTemplate';
import { google } from 'googleapis';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const FASTAPI_URL = 'https://englishmanai-vectordb.onrender.com/generate_lesson_plan';

export const createKTP = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { topic, subtopic, session1Start, session1End, session2Start, session2End, addToCalendar } = req.body;

    if (!OPENAI_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    if (!topic || !subtopic) {
        return res.status(400).json({ error: 'Both topic and subtopic are required to create KTP.' });
    }

    try {
        const user: IUser | null = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const session1Duration = (new Date(session1End).getTime() - new Date(session1Start).getTime()) / (1000 * 60);
        const session2Duration = (new Date(session2End).getTime() - new Date(session2Start).getTime()) / (1000 * 60);

        const lessonPlanResponse = await axios.post(FASTAPI_URL, {
            topic,
            subtopic,
            session1Duration,
            session2Duration
        });

        const { lesson_plan, references, detailed_descriptions } = lessonPlanResponse.data;

        const session1Segments: AdditionalContent[] = [];
        const session2Segments: AdditionalContent[] = [];
        const lines = lesson_plan.split('\n');

        let currentTheme: string | null = null;
        let currentDuration: string | null = null;
        let currentDescription: string | null = null;
        let currentMethodology: string | null = null;
        let isSession2 = false;

        for (let line of lines) {
            line = line.trim();
            if (line.startsWith('Session 2:')) {
                isSession2 = true;
            }
            if (line.startsWith('Theme:')) {
                if (currentTheme && currentDuration && currentDescription) {
                    const segment = {
                        theme: currentTheme,
                        duration: currentDuration,
                        description: `${currentDescription}\nMethodology: ${currentMethodology}`
                    };
                    if (isSession2) {
                        session2Segments.push(segment);
                    } else {
                        session1Segments.push(segment);
                    }
                }
                currentTheme = line.replace('Theme:', '').trim();
                currentDuration = null;
                currentDescription = null;
                currentMethodology = null;
            } else if (line.startsWith('Duration:')) {
                currentDuration = line.replace('Duration:', '').trim();
            } else if (line.startsWith('Description:')) {
                currentDescription = line.replace('Description:', '').trim();
            } else if (line.startsWith('Methodology:')) {
                currentMethodology = detailed_descriptions.shift();  // Adding methodology from detailed descriptions
            }
        }

        if (currentTheme && currentDuration && currentDescription) {
            const segment = {
                theme: currentTheme,
                duration: currentDuration,
                description: `${currentDescription}\nMethodology: ${currentMethodology}`
            };
            if (isSession2) {
                session2Segments.push(segment);
            } else {
                session1Segments.push(segment);
            }
        }

        if (addToCalendar && user.tokens) {
            const oAuth2Client = new google.auth.OAuth2();
            oAuth2Client.setCredentials(user.tokens);

            const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

            const event1 = {
                summary: `Session 1: ${topic} - ${subtopic}`,
                description: `Session on ${subtopic} for ${topic}`,
                start: { dateTime: new Date(session1Start).toISOString() },
                end: { dateTime: new Date(session1End).toISOString() },
            };

            const event2 = {
                summary: `Session 2: ${topic} - ${subtopic}`,
                description: `Session on ${subtopic} for ${topic}`,
                start: { dateTime: new Date(session2Start).toISOString() },
                end: { dateTime: new Date(session2End).toISOString() },
            };

            await calendar.events.insert({
                calendarId: 'primary',
                requestBody: event1,
            });

            await calendar.events.insert({
                calendarId: 'primary',
                requestBody: event2,
            });
        }

        const fileName = `ktp_${Date.now()}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-type', 'application/pdf');

        const doc = new PDFDocument();
        doc.pipe(res);

        generateKTPPDF(
            doc,
            topic,
            subtopic,
            new Date(session1Start),
            new Date(session1End),
            new Date(session2Start),
            new Date(session2End),
            session1Segments,
            session2Segments,
            references
        );

        doc.end();

    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
        } else {
            console.error('Error processing request:', error);
        }
        res.status(500).json({ error: 'Failed to create KTP' });
    }
};