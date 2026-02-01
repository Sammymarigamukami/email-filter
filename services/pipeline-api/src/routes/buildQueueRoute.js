
import express from 'express';
import { buildAttachmentQueue } from '../../../email-ingestor/index.js';

const router = express.Router();

router.get('/build-queue', async (req, res) => {
  try {
    const refreshToken = req.query.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ error: 'refreshToken is required' });
    }

    const jobs = await buildAttachmentQueue(refreshToken);

    res.json({
      success: true,
      jobsCount: jobs.length,
      jobs,
    });
  } catch (err) {
    console.error('[BUILD QUEUE ERROR]', err);
    res.status(500).json({ error: 'Failed to build attachment queue' });
  }
});

export default router;
