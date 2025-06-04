import Joi from 'joi';

export const validateChapter = (chapter) => {
  const schema = Joi.object({
    subject: Joi.string().required(),
    chapter: Joi.string().required(),  // Changed from chapterName to chapter
    class: Joi.string().required(),
    unit: Joi.string().required(),
    yearWiseQuestionCount: Joi.object().pattern(
      Joi.string().regex(/^\d{4}$/),  // Validate year format (YYYY)
      Joi.number().integer().min(0)
    ).required(),
    questionSolved: Joi.number().integer().min(0).default(0),
    status: Joi.string().valid(
      'Not Started', 
      'In Progress', 
      'Completed'
    ).default('Not Started'),
    isWeakChapter: Joi.boolean().default(false)  // Changed from weakChapters
  });
  
  return schema.validate(chapter);
};