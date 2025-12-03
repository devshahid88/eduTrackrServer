// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('Authenticating token:', token ? 'Token present' : 'No token');

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined');
    return res.status(500).json({ 
      success: false, 
      message: 'Server configuration error' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      console.error('JWT verification error:', err.message);
      
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token expired' 
        });
      }
      
      if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ 
          success: false, 
          message: 'Invalid token' 
        });
      }
      
      return res.status(403).json({ 
        success: false, 
        message: 'Token verification failed' 
      });
    }
    
    req.user = decoded as JwtPayload;
    console.log('User authenticated:', req.user.email, 'Role:', req.user.role);
    next();
  });
};

export const authorizeRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const userRole = req.user.role;
    if (!userRole) {
      return res.status(403).json({ 
        success: false, 
        message: 'No role found for user' 
      });
    }
    
    // Case-insensitive comparison
    const hasRole = roles.some(role => 
      role.toLowerCase() === userRole.toLowerCase()
    );
    
    if (!hasRole) {
      console.log(`Access denied for user ${req.user.email} with role ${userRole}. Required roles: ${roles.join(', ')}`);
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${roles.join(', ')}. Your role: ${userRole}` 
      });
    }
    
    console.log(`Access granted for user ${req.user.email} with role ${userRole}`);
    next();
  };
};

// Optional: Middleware to check if user can access their own resources
export const authorizeOwnerOrRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const userRole = req.user.role;
    const userId = req.user.id;
    const targetUserId = req.params.id;

    // Check if user is trying to access their own resource
    if (userId === targetUserId) {
      return next();
    }

    // Check if user has required role
    const hasRole = roles.some(role => 
      role.toLowerCase() === userRole.toLowerCase()
    );
    
    if (!hasRole) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. You can only access your own resources or need role: ${roles.join(', ')}` 
      });
    }
    
    next();
  };
};