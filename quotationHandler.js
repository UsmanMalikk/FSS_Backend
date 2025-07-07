// const fs = require('fs');
// const path = require('path');
// const PizZip = require('pizzip');
// const Docxtemplater = require('docxtemplater');
// const libre = require('libreoffice-convert');
// const { v4: uuidv4 } = require('uuid');
// const {sendEmailForQuotation} = require('./mailer');
// // const expressionParser = require("docxtemplater/expressions.js");
// const axios = require('axios'); // Added for API calls

// // Configure libreoffice convert
// libre.convertAsync = require('util').promisify(libre.convert);

// const templatePath = path.join(__dirname, 'templates', 'quotation-template.docx');
// const outputDir = path.join(__dirname, 'output');

// if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// // Cloud conversion service configuration
// // const CONVERT_API_URL = 'https://v2.convertapi.com/convert/docx/to/pdf';

// const CloudConvert = require('cloudconvert');

// const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY);

// async function convertToPDF(docxBuffer) {
//   try {
//     // Step 1: Create job with 3 tasks (import, convert, export)
//     const job = await cloudConvert.jobs.create({
//       tasks: {
//         'import-file': {
//           operation: 'import/base64',
//           file: docxBuffer.toString('base64'),
//           filename: 'quotation.docx',
//         },
//         'convert-file': {
//           operation: 'convert',
//           input: 'import-file',
//           output_format: 'pdf',
//         },
//         'export-file': {
//           operation: 'export/url',
//           input: 'convert-file',
//         }
//       }
//     });

//     const jobId = job.id;

//     // Step 2: Wait for the job to complete
//     const completedJob = await cloudConvert.jobs.wait(jobId);

//     // Step 3: Get the export task with the file URL
//     const exportTask = completedJob.tasks.find(
//       task => task.name === 'export-file' && task.status === 'finished'
//     );

//     if (!exportTask || !exportTask.result || !exportTask.result.files || exportTask.result.files.length === 0) {
//       throw new Error('CloudConvert PDF conversion failed: No file URL returned.');
//     }

//     const fileUrl = exportTask.result.files[0].url;

//     // Step 4: Download the PDF file
//     const pdfResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
//     return Buffer.from(pdfResponse.data);

//   } catch (error) {
//     console.error('CloudConvert API error:', error.message);
//     throw new Error('CloudConvert PDF conversion failed');
//   }
// }


// const generateQuotationPDF = async (data) => {
//   try {
//     // Read and process template
//     const content = fs.readFileSync(templatePath, 'binary');
//     const zip = new PizZip(content);
    
//     const doc = new Docxtemplater(zip, {
//       paragraphLoop: true,
//       linebreaks: true,
//     //   parser: expressionParser,

//       // Add error handling
//       nullGetter: () => '',
//       delimiters: {
//       start: '{{',
//       end: '}}'
//     }
//     });

//     // Prepare data
//     const [signatory1, signatory2] = data.signatories || [];
//     const quotationData = {
//     //   date: new Date().toLocaleDateString('en-GB'),
//       title: data.title || '',
//       by: data.by || '',
//       to: data.to || '',
//       clientPosition: data.clientPosition || '',
//       facilityName: data.facilityName || '',
//       subject: data.subject || '',
//       facilityLocation: data.facilityLocation || '',
//       additionalTerms: data.additionalTerms,
      
//       // Handle quotation table rows
//       quotation: (data.quotation || []).map(row => ({
//         qty: row.qty || '',
//         position: row.position || '',
//         nationality: row.nationality || '',
//         fat: row.fat || '',
//         price: row.price || '',
//         city: row.city || '',
//       })),
//       signatory1Name: signatory1.name || {},
//       signatory1Department: signatory1.department || {},
//       signatory1Email: signatory1.email || {},
//       signatory1Mobile: signatory1.mobile || {},

//       signatory2Name: signatory2.name || {},
//       signatory2Department: signatory2.department || {},
//       signatory2Email: signatory2.email || {},
//       signatory2Mobile: signatory2.mobile || {},
//     };
//     // console.log(quotationData);
//     // Set data and render
//     await doc.renderAsync(quotationData); // ✅ new way
     

//     // Generate DOCX
//     const docxBuffer = doc.getZip().generate({ type: 'nodebuffer' });
//     const docxPath = path.join(outputDir, `${uuidv4()}.docx`);
//     fs.writeFileSync(docxPath, docxBuffer);
    
//     // Convert DOCX buffer to PDF using CloudConvert
//     const pdfBuffer = await convertToPDF(docxBuffer);

//     // Save the PDF
//     const pdfPath = path.join(outputDir, `${uuidv4()}.pdf`);
//     fs.writeFileSync(pdfPath, pdfBuffer);

//     return pdfPath;

//   } catch (error) {
//     console.error('Error in generateQuotationPDF:', error);
//     throw new Error(`Failed to generate quotation: ${error.message}`);
//   }
// };

// const handleSendQuotation = async (req, res) => {
//   try {
//     const data = req.body;
//     // Validate required fields
//     if (!data.title || !data.to || !data.subject) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     const pdfPath = await generateQuotationPDF(data);

//     if (data.sendVia === 'email') {
//       if (!data.email) {
//         return res.status(400).json({ error: 'Email address required' });
//       }
//       await sendEmailForQuotation(
//         data.email,
//         data.subject,
//         'Please find the attached quotation.',
//         '<p>Attached quotation as requested.</p>',
//         pdfPath
//       );
//       return res.json({ success: true, message: 'Quotation emailed successfully' });
//     }

//     // For WhatsApp
//     const pdfUrl = `${req.protocol}://${req.get('host')}/output/${path.basename(pdfPath)}`;
//     return res.json({ success: true, pdfUrl });
//   } catch (err) {
//     console.error('Quotation generation failed:', err);
//     res.status(500).json({ error: err.message || 'Failed to generate/send quotation' });
//   }
// };

// // Add these new endpoints to your backend
// const handlePreviewQuotation = async (req, res) => {
//   try {
//     const data = req.body;
    
//     // Generate DOCX
//     const docxBuffer = await generateDOCX(data);
    
//     // Return as base64 for mobile compatibility
//     res.json({ 
//       docx: docxBuffer.toString('base64'),
//       filename: `quotation-preview-${Date.now()}.docx`
//     });

//   } catch (err) {
//     console.error('Preview generation failed:', err);
//     res.status(500).json({ error: err.message || 'Failed to generate preview' });
//   }
// };

// const handlePreviewPDF = async (req, res) => {
//   try {
//     const data = req.body;
//     const docxBuffer = await generateDOCX(data);
    
//     // Convert to PDF (using your existing method)
//     const pdfBuffer = await convertToPDF(docxBuffer);
    
//     res.json({
//       pdf: pdfBuffer.toString('base64'),
//       filename: `quotation-preview-${Date.now()}.pdf`
//     });

//   } catch (err) {
//     console.error('PDF preview failed:', err);
//     res.status(500).json({ error: err.message || 'Failed to generate PDF preview' });
//   }
// };

// // Helper function for DOCX generation
// async function generateDOCX(data) {
//   const content = fs.readFileSync(templatePath, 'binary');
//   const zip = new PizZip(content);
//   const doc = new Docxtemplater(zip, {
//     paragraphLoop: true,
//     linebreaks: true,
//     nullGetter: () => '',
//     delimiters: {
//       start: '{{',
//       end: '}}'
//     }
//   });

//   const [signatory1, signatory2] = data.signatories || [];
//   doc.render({
//     title: data.title || '',
//     by: data.by || '',
//     to: data.to || '',
//     clientPosition: data.clientPosition || '',
//     facilityName: data.facilityName || '',
//     subject: data.subject || '',
//     facilityLocation: data.facilityLocation || '',
//     additionalTerms: data.additionalTerms,
//     quotation: data.quotation || [],
//     signatory1,
//     signatory2
//   });

//   return doc.getZip().generate({ type: 'nodebuffer' });
// }


// module.exports = { handleSendQuotation, handlePreviewQuotation, handlePreviewPDF  };
