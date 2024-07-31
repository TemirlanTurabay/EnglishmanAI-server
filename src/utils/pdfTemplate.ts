import PDFDocument from 'pdfkit';

export interface AdditionalContent {
    theme: string;
    duration: string;
    description: string;
}

export const generateKTPPDF = (
    doc: typeof PDFDocument.prototype,
    topic: string,
    subtopic: string,
    session1Start: Date,
    session1End: Date,
    session2Start: Date,
    session2End: Date,
    session1Segments: AdditionalContent[],
    session2Segments: AdditionalContent[],
    references: string[]
) => {
    doc.fontSize(20).text('Lesson Plan', { align: 'center' });
    doc.moveDown();

    doc.fontSize(16).text(`Topic: ${topic}`, { align: 'left' });
    doc.fontSize(16).text(`Subtopic: ${subtopic}`, { align: 'left' });
    doc.moveDown();

    doc.fontSize(14).text(`Session 1: ${session1Start.toLocaleString()} - ${session1End.toLocaleString()}`, { align: 'left' });
    doc.moveDown();

    session1Segments.forEach((segment, index) => {
        doc.fontSize(12).text(`${index + 1}. Segment: ${segment.theme}`, { align: 'left' });
        doc.text(`Duration: ${segment.duration}`, { align: 'left' });
        doc.text(`Description: ${segment.description}`, { align: 'left' });
        doc.moveDown();

        if (doc.y > doc.page.height - 50) { 
            doc.addPage();
        }
    });

    doc.addPage(); 
    doc.fontSize(14).text(`Session 2: ${session2Start.toLocaleString()} - ${session2End.toLocaleString()}`, { align: 'left' });
    doc.moveDown();

    session2Segments.forEach((segment, index) => {
        doc.fontSize(12).text(`${index + 1}. Segment: ${segment.theme}`, { align: 'left' });
        doc.text(`Duration: ${segment.duration}`, { align: 'left' });
        doc.text(`Description: ${segment.description}`, { align: 'left' });
        doc.moveDown();

        if (doc.y > doc.page.height - 50) { 
            doc.addPage();
        }
    });

    doc.addPage();
    doc.fontSize(16).text('References', { align: 'left' });
    references.forEach((reference, index) => {
        doc.fontSize(12).text(`${index + 1}. ${reference}`, { align: 'left' });
        doc.moveDown();
    });
};