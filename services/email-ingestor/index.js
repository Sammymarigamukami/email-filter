import { attachmentQueue as attachmentBuilder } from "./src/attachmentQueue.js";
import { fetchEmails } from "./src/fetchEmail.js";
import { attachmentQueue } from "./src/queues/bullmq.js";


export async function buildAttachmentQueue(refreshToken) {
    if (!refreshToken) {
        throw new Error('Refresh token is required to build attachment queue');
    }
    const emails = await fetchEmails(refreshToken);

    if (!Array.isArray(emails) || emails.length === 0) {
        throw new Error('No emails with attachments found to build attachment queue');
    }
    const jobs = attachmentBuilder(emails);

    if (!Array.isArray(jobs) || jobs.length === 0) {
        throw new Error('No jobs created for attachment queue');
    }

    let enquedCount = 0;
    for (const job of jobs) {
        if (!job || !job.name || !job.jobId || !job.data) {
            throw new Error('Invalid job detected in attachment queue');
        }

        console.log("Adding job to attachment queue:", job.jobId, job.name);
        
        await attachmentQueue.add(
            job.jobId,
            job.name,
            job.data,
            job.opts ? job.opts : {}
        )
        enquedCount++;
    }
    console.log("Attachment jobs added to the queue successfully:", jobs);

    console.log({
        msg: 'Attachment queue built successfully',
        totalEmails: emails.length,
        totalJobs: jobs.length,
        enquedJobs: enquedCount,

    });
    return jobs;
}
