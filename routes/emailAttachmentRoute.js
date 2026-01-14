import express from 'express';
import { emailWithAttachment } from '../controllers/emailWithAttachment.js';
import { requireSession } from '../middleware/requireSession.js';

const emailRouter = express.Router();


emailRouter.get('/user/emailWithAttachment', requireSession, emailWithAttachment);

export default emailRouter;