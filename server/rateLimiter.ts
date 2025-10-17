import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Helper to create standardized error messages
const createErrorMessage = (retryAfterSeconds: number): string => {
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return `Too many requests. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`;
};

// Rate limiter for project creation endpoint
// Stricter limit as this creates database entries
export const createProjectLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each user to 5 project creation requests per 15 minutes
  message: createErrorMessage(15 * 60),
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req: any) => {
    // Use authenticated user ID as the primary key for rate limiting
    // This is more accurate than IP-based limiting for authenticated endpoints
    const userId = req.user?.claims?.sub;
    if (userId) {
      return `create_user_${userId}`;
    }
    
    // Fallback to IP-based rate limiting with proper IPv6 handling
    // This ensures rate limiting even for unauthenticated or partially authenticated requests
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    return `create_ip_${ipKeyGenerator(ip)}`;
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
export const generateProjectLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3, // Limit each user to 3 AI generation requests per 30 minutes
  message: createErrorMessage(30 * 60),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => {
    // Use authenticated user ID as the primary key for rate limiting
    const userId = req.user?.claims?.sub;
    if (userId) {
      return `generate_user_${userId}`;
    }
    
    // Fallback to IP-based rate limiting with proper IPv6 handling
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    return `generate_ip_${ipKeyGenerator(ip)}`;
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
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit to 100 requests per 15 minutes
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Use default keyGenerator which properly handles IPv6
  skip: (req) => {
    // Skip rate limiting for health check endpoint
    return req.path === '/api/health';
  },
});

// Strict rate limiter for the legacy /api/plan-project endpoint (if still in use)
export const planProjectLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3, // Limit each user to 3 AI planning requests per 30 minutes
  message: createErrorMessage(30 * 60),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => {
    // Use authenticated user ID as the primary key for rate limiting
    const userId = req.user?.claims?.sub;
    if (userId) {
      return `plan_user_${userId}`;
    }
    
    // Fallback to IP-based rate limiting with proper IPv6 handling
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    return `plan_ip_${ipKeyGenerator(ip)}`;
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