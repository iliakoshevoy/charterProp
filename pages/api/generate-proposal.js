import { Document, Paragraph, TextRun } from 'docx';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      customerName,
      departureAirport,
      destinationAirport,
      departureDate,
      airplaneOption1,
      airplaneOption2
    } = req.body;

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: 'PRIVATE JET CHARTER PROPOSAL',
                bold: true,
                size: 32
              })
            ],
            spacing: {
              after: 200
            }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Customer: ${customerName}`,
                size: 24
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `From: ${departureAirport}`,
                size: 24
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `To: ${destinationAirport}`,
                size: 24
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Date: ${departureDate}`,
                size: 24
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Aircraft Options:',
                bold: true,
                size: 28
              })
            ],
            spacing: {
              before: 200
            }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Option 1: ${airplaneOption1}`,
                size: 24
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Option 2: ${airplaneOption2}`,
                size: 24
              })
            ]
          })
        ]
      }]
    });

    const buffer = await doc.save();
    
    res.setHeader('Content-Disposition', 'attachment; filename=proposal.docx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating document:', error);
    res.status(500).json({ message: 'Error generating document' });
  }
}
