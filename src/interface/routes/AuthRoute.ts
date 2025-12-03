import { Router, Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from '../controllers/AuthController';
import { AuthUseCase } from '../../application/useCases/AuthUseCase';
import { AuthRepository } from '../../infrastructure/repositories/AuthRespository';
import { authenticateToken } from '../middleware/auth';

const router = Router();

const authRepository = new AuthRepository();
const authUseCase = new AuthUseCase(authRepository);
const authController = new AuthController(authUseCase);

// Rate limiting middleware for auth routes
const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        error: 'Too many login attempts, please try again later',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Optional: Skip successful requests
    skipSuccessfulRequests: true
});

// Stricter rate limiting for password reset routes
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 password reset requests per hour
    message: {
        error: 'Too many password reset attempts, please try again later',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Public routes - No authentication required
router.post('/loginStudent', authLimiter, authController.loginStudent.bind(authController));
router.post('/loginAdmin', authLimiter, authController.loginAdmin.bind(authController));
router.post('/loginTeacher', authLimiter, authController.loginTeacher.bind(authController));
router.post('/forgotPassword', passwordResetLimiter, authController.forgotPassword.bind(authController));
router.post('/resetPassword/:token', passwordResetLimiter, authController.resetPassword.bind(authController));

router.post('/refresh-token', authenticateToken, authController.refreshToken.bind(authController));

export default router;