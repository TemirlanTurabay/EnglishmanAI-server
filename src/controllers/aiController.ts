import { Request, Response } from 'express';
import axios from 'axios';
import User from '../models/User';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const chatWithAI = async (req: Request, res: Response) => {
    const { question } = req.body;
    const userId = (req as any).user.id;

    console.log('Received question:', question);
    console.log('User ID:', userId);
    console.log('OPENAI_API_KEY:', OPENAI_API_KEY); 

    if (!OPENAI_API_KEY) {
        console.error('Missing OpenAI API key');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: question }
            ],
            max_tokens: 1024,
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('OpenAI response:', response.data);

        const answer = response.data.choices[0].message.content;

        const user = await User.findById(userId);
        if (user) {
            user.chatHistory.push({ question, answer });
            await user.save();
        }

        res.json({ answer });
    } catch (error: any) {
        console.error('Error processing request:', error);
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
        }
        if (error.response && error.response.status === 429) {
            const mockResponse = `This is a mock response to the question: "${question}"`;
            res.json({ answer: mockResponse });
        } else {
            res.status(500).json({ error: 'Failed to process request' });
        }
    }
};

export const getChatHistory = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    console.log('Getting chat history for user ID:', userId);

    try {
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user.chatHistory);
    } catch (err: any) {
        console.error('Error getting chat history:', err);
        res.status(500).json({ error: 'Failed to get chat history' });
    }
};
