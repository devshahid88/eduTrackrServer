const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
import { Request, Response } from 'express';

const generateAgoraToken = (req:Request, res:Response) => {
  const { channelName, userId } = req.body;
  const appId =process.env.YOUR_AGORA_APP_ID;
  const appCertificate = process.env.YOUR_AGORA_APP_CERTIFICATE;
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      userId,
      role,
      privilegeExpiredTs
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate token' });
  }
};

module.exports = { generateAgoraToken };