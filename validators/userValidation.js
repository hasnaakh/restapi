const Joi = require('joi');

const userCreationSchema = Joi.object({
    username: Joi.string()
        .pattern(new RegExp('^[a-zA-Z]{3,}[a-zA-Z0-9]*$'))
        .required()
        .messages({
            'string.pattern.base': 'Username must have at least 3 letters and can include additional letters or numbers.',
        }),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com'] } })
        .required(),
    password: Joi.string()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
        .required()
        .messages({
            'string.pattern.base': 'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.',
        }),
    phone: Joi.string()
        .pattern(new RegExp('^(010|012|015)\\d{8}$'))
        .required()
        .messages({
            'string.pattern.base': 'Phone number must start with 010, 012, or 015 followed by 8 digits.',
        }),
    role: Joi.string().valid('admin', 'doctor', 'student').required(),
});

const userUpdateSchema = Joi.object({
    username: Joi.string()
      .pattern(new RegExp('^[a-zA-Z]{3,}[a-zA-Z0-9]*$'))
      .optional()
      .messages({
        'string.pattern.base': 'Username must have at least 3 letters and can include additional letters or numbers.',
      }),
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ['com'] } })
      .optional(),
    phone: Joi.string()
      .pattern(new RegExp('^(010|012|015)\\d{8}$'))
      .optional()
      .messages({
        'string.pattern.base': 'Phone number must start with 010, 012, or 015 followed by 8 digits.',
      }),
    password: Joi.object({
      current: Joi.string().optional(),
      new: Joi.string()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
        .optional()
        .messages({
          'string.pattern.base': 'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.',
        }),
    }).optional(),
    role: Joi.string().valid('admin', 'doctor', 'student').optional(),
  });

module.exports = { userCreationSchema, userUpdateSchema };
