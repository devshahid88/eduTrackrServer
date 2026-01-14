import { Request, Response } from 'express';
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
import { ILogger } from '../../application/Interfaces/ILogger';

export class AgoraController {
  
  constructor(private logger: ILogger) {}

  generateToken(req: Request, res: Response) {
    const { channelName, userId } = req.body;
    const APP_ID = process.env.YOUR_AGORA_APP_ID;
    const APP_CERTIFICATE = process.env.YOUR_AGORA_APP_CERTIFICATE;

    if (!APP_ID || !APP_CERTIFICATE) {
       this.logger.error('Agora credentials not configured');
       res.status(500).json({ error: 'Agora credentials not configured' });
       return;
    }
    
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    try {
      const token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        channelName,
        userId,
        role,
        privilegeExpiredTs
      );
      res.json({ token });
    } catch (error: any) {
      this.logger.error('Failed to generate Agora token', error);
      res.status(500).json({ error: 'Failed to generate token' });
    }
  }
}
