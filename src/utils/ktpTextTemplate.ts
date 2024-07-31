import { Response } from 'express';
import PDFDocument from 'pdfkit';

export interface AdditionalContent {
    theme: string;
    duration: string;
    description: string;
}

export const generateKTPTextPDF = (
    doc: InstanceType<typeof PDFDocument>,
    additionalContent: AdditionalContent[],
    references: string[]
) => {
    doc.addPage();
    doc.fontSize(14).text('Lesson Plan', { align: 'center' });
    doc.moveDown();
    additionalContent.forEach((item, index) => {
        doc.fontSize(12).text(`${index + 1}. Theme: ${item.theme}`);
        doc.fontSize(12).text(`   Duration: ${item.duration} minutes`);
        doc.fontSize(12).text(`   Description: ${item.description}`);
        doc.moveDown();
    });

    doc.moveDown();
    doc.fontSize(14).text('References', { align: 'left' });
    references.forEach((ref, index) => {
        doc.fontSize(12).text(`${index + 1}. ${ref}`);
    });
};
