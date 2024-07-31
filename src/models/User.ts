import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IChat {
    question: string;
    answer: string;
}

export interface IUser extends Document {
    email: string;
    password?: string;
    googleId?: string;
    name?: string;
    tokens?: {
        access_token: string;
        refresh_token: string;
        scope: string;
        token_type: string;
        expiry_date: number;
    };
    chatHistory: IChat[];
}

const chatSchema = new Schema<IChat>({
    question: { type: String, required: true },
    answer: { type: String, required: true },
});

const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
    },
    googleId: {
        type: String,
    },
    name: {
        type: String,
    },
    tokens: {
        access_token: { type: String, required: false },
        refresh_token: { type: String, required: false },
        scope: { type: String, required: false },
        token_type: { type: String, required: false },
        expiry_date: { type: Number, required: false },
    },
    chatHistory: [chatSchema],
});

userSchema.pre('save', async function (next) {
    if (this.password && this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

const User = model<IUser>('User', userSchema);
export default User;
