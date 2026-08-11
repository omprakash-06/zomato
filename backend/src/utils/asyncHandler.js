// Async route handlers ke andar throw hui error ko seedha next(err) tak forward kar deta hai
// Isse har controller mein try/catch likhne ki zarurat khatam ho jaati hai.
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
