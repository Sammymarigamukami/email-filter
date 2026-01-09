import express from 'express';
import { getGoogleOAuthState, googleOAuthCallback } from '../controllers/googleOauth.js';

const router = express.Router();

router.get('/google', getGoogleOAuthState);
router.get('/google/callback', googleOAuthCallback);

export default router;