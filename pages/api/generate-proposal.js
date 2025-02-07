import { Document, Paragraph, TextRun, Packer } from 'docx';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
    responseLimit: '4mb',
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Received request body:', req.body); // Debug log

    const {
      customerName,
      departureAirport,
      destinationAirport,
      departureDate,
      airplaneOption1,
      airplaneOption2
    } = req.body;

    // Validate input
    if (!customerName || !departureAirport || !destinationAirport || !departureDate || !airplaneOption1 || !airplaneOption2) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log('Creating document...'); // Debug log

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

    console.log('Document created, generating buffer...'); // Debug log

    // Generate buffer using Packer
    const buffer = await Packer.toBuffer(doc);

    console.log('Buffer generated, sending response...'); // Debug log

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=${customerName}-charter-proposal.docx`);
    res.setHeader('Content-Length', buffer.length);

    // Send response
    res.status(200).send(buffer);

  } catch (error) {
    console.error('Detailed error:', error); // Debug log
    res.status(500).json({ 
      message: 'Error generating document',
      error: error.message,
      stack: error.stack 
    });
  }
}