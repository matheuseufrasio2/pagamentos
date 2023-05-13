// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import formidable from "formidable";
import AdmZip from "adm-zip";
import xml2js from "xml2js";

export default async function handler(req, res) {
  const form = new formidable.IncomingForm();

  try {
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error(err);
          return reject(err);
        }
        resolve({ fields, files });
      });
    });
    console.log('dvwcuvceluwecvluyv')
    
    const zip = new AdmZip(files.zip.path);
    const zipEntries = zip.getEntries();

    const processedEntries = [];

    // loop through each file in the zip and extract it
    await Promise.all(zipEntries.map(async function(zipEntry) {
      if (!zipEntry.isDirectory) {
        const content = zip.readAsText(zipEntry);
        const result = await xml2js.parseStringPromise(content);
        // process the file here as an object or array
        const processedEntry = result;
        processedEntries.push(processedEntry);
      }
    }));

    // create new xml files with the processed entries
    const builder = new xml2js.Builder();
    const newZip = new AdmZip();

    processedEntries.forEach((entry, index) => {
      const xml = builder.buildObject(entry);
      newZip.addFile(`file${index + 1}.xml`, Buffer.from(xml));
    });

    // save the new zip file
    const buffer = newZip.toBuffer();
    const sizeInBytes = buffer.length;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="processed.zip"');
    res.setHeader('Content-Length', sizeInBytes);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
}

