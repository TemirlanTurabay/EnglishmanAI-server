import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getAuthUrl, getGoogleAccountFromCode } from '../utils/googleAuth';
import axios from 'axios';

export const registerUser = async (req: Request, res: Response) => {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ msg: 'Passwords do not match' });
    }

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ email, password });

        await user.save();

        const payload = {
            user: {
                id: user.id,
            },
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET!, {
            expiresIn: '1h',
        });

        res.status(201).json({ token });
    } catch (err: any) {
        console.error('Error during registration:', err.message);
        res.status(500).send('Server error');
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !user.password) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user.id,
            },
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET!, {
            expiresIn: '1h',
        });

        res.json({ token });
    } catch (err: unknown) {
        console.error('Error during login:', err);
        res.status(500).send('Server error');
    }
};

export const googleAuth = (req: Request, res: Response) => {
    const authUrl = getAuthUrl();
    res.redirect(authUrl);
};

export const googleAuthCallback = async (req: Request, res: Response) => {
    const { code, error } = req.query;
    if (error) {
        return res.status(400).send(`Google authentication failed: ${error}`);
    }

    if (!code) {
        return res.status(400).send('Missing code parameter');
    }

    try {
        console.log('Received code:', code);
        const { data, tokens } = await getGoogleAccountFromCode(code as string);
        console.log('Received data:', data);
        console.log('Received tokens:', tokens);

        const googleId = data.id ?? '';
        const email = data.email ?? '';
        const name = data.name ?? '';
        const accessToken = tokens.access_token ?? '';
        const refreshToken = tokens.refresh_token ?? '';
        const scope = tokens.scope ?? '';
        const tokenType = tokens.token_type ?? '';
        const expiryDate = tokens.expiry_date ?? 0;

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                googleId,
                email,
                name,
                tokens: {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    scope,
                    token_type: tokenType,
                    expiry_date: expiryDate,
                }
            });
        } else {
            user.googleId = googleId;
            user.name = name;
            user.tokens = {
                access_token: accessToken,
                refresh_token: refreshToken,
                scope,
                token_type: tokenType,
                expiry_date: expiryDate,
            };
        }

        await user.save();

        const payload = {
            user: {
                id: user.id,
            },
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET!, {
            expiresIn: '1h',
        });

        res.cookie('token', token, { httpOnly: true });

        // Передаем токен на клиентскую сторону через URL
        res.redirect(`http://localhost:3000/topics?token=${token}`);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
        } else {
            console.error('Error during Google auth callback:', error);
        }
        res.status(500).send('Internal Server Error');
    }
};
