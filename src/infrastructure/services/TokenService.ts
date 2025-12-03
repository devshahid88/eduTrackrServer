import jwt from 'jsonwebtoken';

export class TokenService {
  static generateAccessToken(payload: any): string {
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '45m' });
  }

  static generateRefreshToken(payload: any): string {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
  }

  static verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      throw new Error('Invalid or expired refresh token');
    }
  }
}

