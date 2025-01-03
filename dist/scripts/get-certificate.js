import fs from 'fs';
import https from 'https';
import path from 'path';
const CA_BUNDLE_URL = 'https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem';
const CERTS_DIR = path.join(process.cwd(), 'certs');
const OUTPUT_FILE = path.join(CERTS_DIR, 'rds-combined-ca-bundle.pem');
// Create certs directory if it doesn't exist
if (!fs.existsSync(CERTS_DIR)) {
    fs.mkdirSync(CERTS_DIR);
}
https.get(CA_BUNDLE_URL, (response) => {
    const file = fs.createWriteStream(OUTPUT_FILE);
    response.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('AWS DocDB Certificate downloaded successfully to:', OUTPUT_FILE);
    });
}).on('error', (err) => {
    console.error('Error downloading certificate:', err);
    if (fs.existsSync(OUTPUT_FILE)) {
        fs.unlinkSync(OUTPUT_FILE);
    }
});
