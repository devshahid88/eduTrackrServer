
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../infrastructure/services/cloudinary';


const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: 'student_profiles',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  }),
});


export const upload = multer({  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const DEFAULT_PROFILE_IMAGE =
  'https://res.cloudinary.com/djpom2k7h/image/upload/v1/student_profiles/default-profile.png';

export const ensureFullImageUrl = (imagePath?: string): string => {
  if (!imagePath || imagePath.trim() === '') return DEFAULT_PROFILE_IMAGE;
  if (imagePath.startsWith('http')) return imagePath;

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  return `${backendUrl.replace(/\/$/, '')}/${imagePath.replace(/^\//, '')}`;
};
