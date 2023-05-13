import multer from 'multer';
import admZip from 'adm-zip';
import xml2js from 'xml2js';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export default async function handler(req, res) {
  console.log('passei aqui')
  if (req.method === 'POST') {
    upload.fields([
      { name: 'file1' },
      { name: 'file2' },
      { name: 'file3' },
    ])(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).end();
      }
      const files = Object.values(req.files);
      const fileZips = files.map((file) => new admZip(file[0].buffer));
      const mergedZip = new admZip();

      const fileNames = fileZips.reduce((acc, fileZip) => {
        return [...acc, ...fileZip.getEntries().map((entry) => entry.entryName)];
      }, []);
      const uniqueFileNames = [...new Set(fileNames)];

      // Handle the files here
      uniqueFileNames.forEach((fileName) => {
        const fileContents = fileZips.reduce((acc, fileZip) => {
          const fileEntry = fileZip.getEntry(fileName);
          return fileEntry ? [...acc, fileEntry.getData()] : acc;
        }, []);
        let modifiedXmlBuffer;
        if (fileName === 'Cargo.xml') {
          let itemsCargo = [];
          let newCargoXML = null;
          fileContents.forEach((fileContent) => {
            const cargoXmlString = fileContent.toString('utf8');

            xml2js.parseString(cargoXmlString, (err, result) => {
              if (err) {
                console.error(err);
                return;
              }
              if (!newCargoXML) {
                newCargoXML = result;
              }
              result.Cargo.ItemCargo.forEach((item) => {
                itemsCargo.push(item);
              });
            });
          });
          newCargoXML.Cargo.ItemCargo = itemsCargo;

          const builder = new xml2js.Builder();
          const modifiedXmlString = builder.buildObject(newCargoXML);
          modifiedXmlBuffer = Buffer.from(modifiedXmlString, 'utf8');
        }

        console.log(`Handling file ${fileName}`);
        if (fileName === 'Cargo.xml') {
          mergedZip.addFile(fileName, modifiedXmlBuffer);
        } else {
          mergedZip.addFile(fileName, Buffer.concat(fileContents));
        }
      });

      const mergedZipBuffer = mergedZip.toBuffer();

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="merged.zip"');
      res.send(mergedZipBuffer);
    });
  } else {
    res.status(405).end();
  }
}
