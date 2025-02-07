import formidable from 'formidable';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Parse form data including file
    const form = new formidable.IncomingForm();
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    // Validate input
    if (!files.template) {
      return res.status(400).json({ message: 'No template file provided' });
    }

    // Read template file
    const templateContent = await fs.promises.readFile(files.template.filepath);
    
    // Create template processor
    const zip = new PizZip(templateContent);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Replace placeholders with form data
    doc.render({
      CUSTOMER: fields.customerName,
      DEPARTURE: fields.departureAirport,
      DESTINATION: fields.destinationAirport,
      DATE: fields.departureDate,
      OPTION1: fields.airplaneOption1,
      OPTION2: fields.airplaneOption2,
    });

    // Generate document
    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=${fields.customerName}-charter-proposal.docx`);

    // Send response
    res.send(buffer);

  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ 
      message: 'Error generating document',
      error: error.message 
    });
  }
}