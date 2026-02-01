import express from 'express';
import { getGoogleOAuthState, googleOAuthCallback } from '../auth/auth.services.js';


const router = express.Router();

router.get('/google', getGoogleOAuthState);
router.get('/google/callback', googleOAuthCallback);

export default router;