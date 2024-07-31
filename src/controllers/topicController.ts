import { Request, Response } from 'express';

const topics = [
    { id: 1, name: 'Animals' },
    { id: 2, name: 'Clothes' },
    { id: 3, name: 'Time' },
    { id: 4, name: 'Arts and Music' },
    { id: 5, name: 'Town' }
];

export const getTopics = (req: Request, res: Response) => {
    res.json(topics);
};

export const getTopicDetails = (req: Request, res: Response) => {
    const topic = topics.find(t => t.id === parseInt(req.params.id));
    if (!topic) {
        return res.status(404).json({ msg: 'Topic not found' });
    }
    res.json(topic);
};
