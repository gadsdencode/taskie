import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";

// Helper to create standardized error messages
const createErrorMessage = (retryAfterSeconds: number): string => {
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return `Too many requests from this IP. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`;
};

// Rate limiter for project creation endpoint
// Stricter limit as this creates database entries
export const createProjectLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each user to 5 project creation requests per 15 minutes
  message: createErrorMessage(15 * 60),
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req: any) => {
    // Use both IP and user ID for more accurate rate limiting
    const userId = req.user?.claims?.sub || 'anonymous';
    const ip = req.ip || req.connection.remoteAddress;
    return `${ip}_${userId}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many project creation attempts',
      message: createErrorMessage(15 * 60),
      retryAfter: 15 * 60,
    });
  },
  skipSuccessfulRequests: false, // Count all requests
});

// Rate limiter for AI generation endpoint
// More restrictive as this is the most expensive operation
export const generateProjectLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3, // Limit each user to 3 AI generation requests per 30 minutes
  message: createErrorMessage(30 * 60),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => {
    // Use both IP and user ID for more accurate rate limiting
    const userId = req.user?.claims?.sub || 'anonymous';
    const ip = req.ip || req.connection.remoteAddress;
    return `${ip}_${userId}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many AI generation attempts',
      message: createErrorMessage(30 * 60),
      retryAfter: 30 * 60,
    });
  },
  skipSuccessfulRequests: false, // Count all requests
});

// General rate limiter for standard API endpoints (more lenient)
export const generalApiLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => {
    // Use IP address as key
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  skip: (req) => {
    // Skip rate limiting for health check endpoint
    return req.path === '/api/health';
  },
});

// Strict rate limiter for the legacy /api/plan-project endpoint (if still in use)
export const planProjectLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3, // Limit each user to 3 AI planning requests per 30 minutes
  message: createErrorMessage(30 * 60),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => {
    // Use both IP and user ID for more accurate rate limiting
    const userId = req.user?.claims?.sub || 'anonymous';
    const ip = req.ip || req.connection.remoteAddress;
    return `${ip}_${userId}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many project planning attempts',
      message: createErrorMessage(30 * 60),
      retryAfter: 30 * 60,
    });
  },
  skipSuccessfulRequests: false,
});