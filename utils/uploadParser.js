import fs from 'fs/promises';
import { validateChapter } from './validation.js';

export const parseUpload = async (filePath) => {
  const fileData = await fs.readFile(filePath, 'utf-8');
  const chapters = JSON.parse(fileData);
  
  const validChapters = [];
  const invalidChapters = [];
  
  for (const [index, chapter] of chapters.entries()) {
    const { error } = validateChapter(chapter);
    if (error) {
      invalidChapters.push({
        index,
        error: error.details[0].message,
        data: chapter
      });
    } else {
      validChapters.push(chapter);
    }
  }
  
  await fs.unlink(filePath); // Remove temp file
  
  return { validChapters, invalidChapters };
};