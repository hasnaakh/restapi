const Joi = require('joi');

const doctorCreationSchema = Joi.object({
    
    photo: Joi.any()
        .optional() // Allow file upload without strict checks
        .messages({
            'any.required': 'Photo upload failed.',
        }),
    department: Joi.string()
        .max(100)
        .optional()
        .messages({
            'string.max': 'Department can be up to 100 characters long.',
        }),
    contact_info: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com'] } })
        .required()
        .messages({
            'string.email': 'Contact info must be a valid email address.',
        }),
});

const doctorUpdateSchema = Joi.object({
    
    photo: Joi.any()
        .optional() // Allow file upload without strict checks
        .messages({
            'any.required': 'Photo upload failed.',
        }),
    department: Joi.string()
        .max(100)
        .optional()
        .messages({
            'string.max': 'Department can be up to 100 characters long.',
        }),
    contact_info: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com'] } })
        .optional()
        .messages({
            'string.email': 'Contact info must be a valid email address.',
        }),
});

module.exports = { doctorCreationSchema, doctorUpdateSchema };
