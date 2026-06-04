import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, '../frontend/public/images');

/** Minimal valid 1x1 JPEG (gray pixel). */
const minimalJpeg = Buffer.from(
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUQEhIVFhUVFRUVFRUVFRUWFxUXFhUaHSggGBolGxUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBIgACEQEDEQH/xAAXAAEBAQEAAAAAAAAAAAAAAAAAAQID/8QAFhEBAQEAAAAAAAAAAAAAAAAAAAER/9oADAMBAAIQAxAAAAGwCf/EABYRAQEBAAAAAAAAAAAAAAAAAAARAP/aAAgBAQABPwCf/8QAFREBAQAAAAAAAAAAAAAAAAAAABH/2gAIAQIBAT8An//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Af//Z',
  'base64'
);

const filenames = [
  'airpods.jpg',
  'phone.jpg',
  'camera.jpg',
  'playstation.jpg',
  'mouse.jpg',
  'alexa.jpg',
  'sample.jpg'
];

fs.mkdirSync(imagesDir, { recursive: true });

for (const name of filenames) {
  const filePath = path.join(imagesDir, name);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, minimalJpeg);
    console.log(`Created ${filePath}`);
  }
}

console.log('Product images ready in frontend/public/images');
