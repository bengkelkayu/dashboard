import morgan from 'morgan';

// Custom token for logging
morgan.token('body', (req) => JSON.stringify(req.body));

export const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms :body', {
  skip: (req) => req.path === '/health'
});

export const errorLogger = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params
  });
  next(err);
};
