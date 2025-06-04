import Chapter from '../models/Chapter.js';
import { validateChapter } from '../utils/validation.js';
import redisClient from '../config/reddis.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';

// Cache invalidation helper
const invalidateCache = async () => {
  const keys = await redisClient.keys('chapters:*');
  if (keys.length) {
    await Promise.all(keys.map(key => redisClient.del(key)));
  }
};

// Parse uploaded JSON file
const parseUpload = async (filePath) => {
  const fileData = await fs.readFile(filePath, 'utf-8');
  const chapters = JSON.parse(fileData);
  
  const validChapters = [];
  const invalidChapters = [];
  
  for (const [index, chapter] of chapters.entries()) {
    // Convert year keys to strings for validation
    if (chapter.yearWiseQuestionCount && typeof chapter.yearWiseQuestionCount === 'object') {
      const yearMap = new Map();
      for (const [year, count] of Object.entries(chapter.yearWiseQuestionCount)) {
        yearMap.set(String(year), count);
      }
      chapter.yearWiseQuestionCount = Object.fromEntries(yearMap);
    }
    
    const { error } = validateChapter(chapter);
    if (error) {
      invalidChapters.push({
        index,
        error: error.details[0].message,
        data: chapter
      });
    } else {
      validChapters.push({
        ...chapter,
        yearWiseQuestionCount: new Map(  // Convert to Map for MongoDB
          Object.entries(chapter.yearWiseQuestionCount)
        )
      });
    }
  }
  
  await fs.unlink(filePath);
  return { validChapters, invalidChapters };
};

// Get all chapters with caching
export const getChapters = async (req, res) => {
  const { 
    class: className, 
    unit, 
    status, 
    isWeakChapter,  // Changed from weakChapters
    subject, 
    page = 1, 
    limit = 10 
  } = req.query;
  
  const filter = {};
  if (className) filter.class = className;
  if (unit) filter.unit = unit;
  if (status) filter.status = status;
  if (isWeakChapter) filter.isWeakChapter = isWeakChapter === 'true';
  if (subject) filter.subject = subject;
  
  const cacheKey = `chapters:${JSON.stringify(req.query)}`;
  
  try {
    // Check cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    
    // DB Query with pagination
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      lean: true,
      collation: {
        locale: 'en',
        strength: 2
      }
    };

    const results = await Chapter.paginate(filter, options);
    
    // Convert Map to Object for each chapter
    const formattedResults = {
  ...results,
  docs: results.docs.map(chapter => ({
    ...chapter,
    yearWiseQuestionCount: chapter.yearWiseQuestionCount instanceof Map
      ? Object.fromEntries(chapter.yearWiseQuestionCount)
      : chapter.yearWiseQuestionCount  // already plain object
  }))
};

    
    // Cache response for 1 hour
  await redisClient.setEx(cacheKey, 3600, JSON.stringify(formattedResults));
    
    res.json(formattedResults);
  } catch (err) {
    console.error('Error fetching chapters:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single chapter by ID
export const getChapterById = async (req, res) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid chapter ID' });
    }

    const chapter = await Chapter.findById(req.params.id).lean();
    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Safely convert Map to Object if needed
    if (chapter.yearWiseQuestionCount instanceof Map) {
      chapter.yearWiseQuestionCount = Object.fromEntries(chapter.yearWiseQuestionCount);
    } else if (typeof chapter.yearWiseQuestionCount === 'object' && chapter.yearWiseQuestionCount !== null) {
      chapter.yearWiseQuestionCount = { ...chapter.yearWiseQuestionCount };
    }

    res.json(chapter);
  } catch (err) {
    console.error('Error fetching chapter:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Upload chapters
export const uploadChapters = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  try {
    const { validChapters, invalidChapters } = await parseUpload(req.file.path);
    
    if (validChapters.length > 0) {
      await Chapter.insertMany(validChapters);
      await invalidateCache(); // Invalidate Redis cache
    }
    
    res.status(invalidChapters.length ? 207 : 201).json({
      message: `${validChapters.length} chapters uploaded successfully`,
      invalidCount: invalidChapters.length,
      invalidChapters
    });
  } catch (err) {
    console.error('Upload error:', err);
    
    // Handle bulk write errors specifically
    if (err.name === 'BulkWriteError') {
      const failedInserts = err.writeErrors.map(error => ({
        index: error.index,
        error: error.errmsg,
        data: validChapters[error.index]
      }));
      
      return res.status(207).json({
        message: 'Partial upload completed with errors',
        uploadedCount: err.result.insertedCount,
        failedCount: failedInserts.length,
        failedInserts
      });
    }
    
    res.status(500).json({ 
      error: 'Processing failed',
      details: err.message 
    });
  }
};