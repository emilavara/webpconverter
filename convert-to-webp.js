// convert-to-webp.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.tiff', '.bmp']; // still skipping SVGs
const folderPath = process.argv[2];
const red = (text) => `\x1b[31m${text}\x1b[0m`;

console.clear();
console.log(String.raw`      
 __    __  __ ___   ___                              _            
/ / /\ \ \/__/ __\ / _ \___ ___  _ ____   _____ _ __| |_ ___ _ __ 
\ \/  \/ /_\/__\/// /_)/ __/ _ \| '_ \ \ / / _ | '__| __/ _ | '__|
 \  /\  //_/ \/  / ___| (_| (_) | | | \ V |  __| |  | ||  __| |   
  \/  \/\__\_____\/    \___\___/|_| |_|\_/ \___|_|   \__\___|_|                             
    Image -> webp CLI tool                        by emilavara   
`);


if (!folderPath) {
    console.error(red('⚠️ Please drag a folder onto this script or pass it as an argument.'));
    process.exit(1);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question(
    '📸 Enter WebP quality (0–100, default 85):\n' +
    '   0–25   = Trash tier (tiny size, potato quality)\n' +
    '  26–50   = Meh (maybe okay for thumbnails)\n' +
    '  51–75   = Decent (balanced)\n' +
    '  76–90   = Good (web-ready, sharp enough)\n' +
    '  91–100  = Almost lossless (overkill?)\n' +
    'Your choice: ',
    (answer) => {
        const quality = Math.max(0, Math.min(100, parseInt(answer))) || 85;
        console.log(`➡️  Using quality: ${quality}%`);

        convertFolder(folderPath, quality);
        rl.close();
    }
);

function convertFolder(folderPath, quality) {
    function convertImage(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        if (!SUPPORTED_EXTENSIONS.includes(ext)) return;

        const outputFile = filePath.replace(ext, '.webp');

        sharp(filePath)
            .webp({ quality })
            .toFile(outputFile)
            .then(() => console.log(`# Converted: ${path.basename(filePath)} → ${path.basename(outputFile)}`))
            .catch(err => console.error(`# Error converting ${filePath}:`, err));
    }

    function walkDir(dir) {
        fs.readdirSync(dir).forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                walkDir(fullPath);
            } else {
                convertImage(fullPath);
            }
        });
    }

    walkDir(folderPath);
}