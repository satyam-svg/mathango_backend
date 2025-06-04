import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// Define Schema
const ChapterSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  chapter: {
    type: String,
    required: true,
    trim: true,
  },
  class: {
    type: String,
    required: true,
    trim: true,
  },
  unit: {
    type: String,
    required: true,
    trim: true,
  },
  yearWiseQuestionCount: {
    type: Map,
    of: Number,
    required: true,
  },
  questionSolved: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started',
  },
  isWeakChapter: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// ✅ Add pagination plugin
ChapterSchema.plugin(mongoosePaginate);

// ✅ Export the model
const Chapter = mongoose.model('Chapter', ChapterSchema);
export default Chapter;
