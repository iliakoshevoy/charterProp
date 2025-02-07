import formidable from 'formidable';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs/promises';  // Use promises version for better async handling

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
    console.log('Starting request processing...'); // Debug log

    // Parse form data including file
    const form = formidable({ keepExtensions: true });
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err); // Debug log
          reject(err);
          return;
        }
        resolve([fields, files]);
      });
    });

    console.log('Form data parsed:', { fields: Object.keys(fields), files: Object.keys(files) }); // Debug log

    if (!files.template) {
      console.error('No template file provided'); // Debug log
      return res.status(400).json({ message: 'No template file provided' });
    }

    console.log('Template file found:', files.template.filepath); // Debug log

    // Read template file
    const templateContent = await fs.readFile(files.template.filepath);
    console.log('Template file read, size:', templateContent.length); // Debug log

    // Create template processor
    const zip = new PizZip(templateContent);
    
    // Create docxtemplater instance with error handling
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    console.log('Attempting to render template with data:', {
      CUSTOMER: fields.customerName,
      DEPARTURE: fields.departureAirport,
      DESTINATION: fields.destinationAirport,
      DATE: fields.departureDate,
      OPTION1: fields.airplaneOption1,
      OPTION2: fields.airplaneOption2,
    }); // Debug log

    // Replace placeholders with form data
    doc.render({
      CUSTOMER: fields.customerName,
      DEPARTURE: fields.departureAirport,
      DESTINATION: fields.destinationAirport,
      DATE: fields.departureDate,
      OPTION1: fields.airplaneOption1,
      OPTION2: fields.airplaneOption2,
    });

    console.log('Template rendered successfully'); // Debug log

    // Generate document
    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    console.log('Document buffer generated, size:', buffer.length); // Debug log

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=${fields.customerName}-charter-proposal.docx`);

    // Send response
    res.send(buffer);
    console.log('Response sent successfully'); // Debug log

  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    }); // Debug log

    // Check for specific error types
    if (error.properties && error.properties.errors) {
      console.error('Template Error:', error.properties.errors); // Debug log
    }

    // Send error response
    res.status(500).json({ 
      message: 'Error generating document',
      error: error.message,
      details: error.properties?.errors || [],
    });
  } finally {
    // Clean up any temporary files
    try {
      if (files?.template?.filepath) {
        await fs.unlink(files.template.filepath);
        console.log('Temporary file cleaned up'); // Debug log
      }
    } catch (cleanupError) {
      console.error('Error cleaning up:', cleanupError); // Debug log
    }
  }
}