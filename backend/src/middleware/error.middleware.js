const errorMiddleware = (err, req, res, _next) => {
    console.error(`[ERROR] ${req.method} ${req.url}:`, err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
};
module.exports = errorMiddleware;
