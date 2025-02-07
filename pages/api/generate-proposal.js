import formidable from 'formidable';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let parsedFiles;
  let parsedFields;

  try {
    // Parse form data including file
    const form = formidable({ keepExtensions: true });
    
    [parsedFields, parsedFiles] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err);
          reject(err);
          return;
        }
        resolve([fields, files]);
      });
    });

    if (!parsedFiles.template) {
      return res.status(400).json({ message: 'No template file provided' });
    }

    // Read template file
    const templateContent = await fs.readFile(parsedFiles.template.filepath);
    
    // Create template processor
    const zip = new PizZip(templateContent);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '{', end: '}' }  // Use single braces
    });

    // Replace placeholders with form data
    doc.render({
      CUSTOMER: parsedFields.customerName,
      DEPARTURE: parsedFields.departureAirport,
      DESTINATION: parsedFields.destinationAirport,
      DATE: parsedFields.departureDate,
      OPTION1: parsedFields.airplaneOption1,
      OPTION2: parsedFields.airplaneOption2,
    });

    // Generate document
    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=${parsedFields.customerName}-charter-proposal.docx`);

    // Send response
    res.send(buffer);

  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ 
      message: 'Error generating document',
      error: error.message,
      details: error.properties?.errors || [] 
    });
  } finally {
    // Clean up temporary files
    if (parsedFiles?.template?.filepath) {
      try {
        await fs.unlink(parsedFiles.template.filepath);
      } catch (cleanupError) {
        console.error('Error cleaning up:', cleanupError);
      }
    }
  }
}