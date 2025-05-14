const { query, validationResult } = require('express-validator');

// Arama sorgusu doğrulama kuralları
const searchValidationRules = [
  query('query')
    .exists()
    .withMessage('Arama sorgusu gereklidir')
    .isString()
    .withMessage('Arama sorgusu bir metin olmalıdır')
    .isLength({ min: 2 })
    .withMessage('Arama sorgusu en az 2 karakter olmalıdır'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit 1 ile 100 arasında bir sayı olmalıdır')
    .toInt(),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset 0 veya daha büyük bir sayı olmalıdır')
    .toInt()
];

// Validasyon sonuçlarını kontrol et ve hataları işle
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map(err => ({
    [err.path]: err.msg
  }));

  return res.status(400).json({
    errors: extractedErrors
  });
};

module.exports = {
  searchValidationRules,
  validate
};