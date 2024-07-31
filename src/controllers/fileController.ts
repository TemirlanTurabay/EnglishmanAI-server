import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const filesDirectory = path.join(__dirname, '../../uploads');

export const getFiles = (req: Request, res: Response) => {
    fs.readdir(filesDirectory, (err, files) => {
        if (err) {
            console.error('Error reading files directory:', err);
            return res.status(500).json({ error: 'Failed to read files directory' });
        }

        const validFiles = files.filter(file => {
            const filePath = path.join(filesDirectory, file);
            return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
        });

        res.json({ files: validFiles });
    });
};

export const downloadFile = (req: Request, res: Response) => {
    const { fileName } = req.params;
    const filePath = path.join(filesDirectory, fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            return res.status(500).json({ error: 'Failed to download file' });
        }
    });
};
