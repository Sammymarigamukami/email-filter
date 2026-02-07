

/**
 * 
 * @param {*} emails 
 * @returns 
 * 
 * what does this function do:
 * - Takes an array of email objects, each containing email metadata and attachments.
 * - For each email, it iterates through its attachments and creates a job object for each attachment.
 * - Each job object includes:
 *  - name: The name of the job ("Process_attachment").
 *  - jobId: A unique identifier for the job, combining emailId and attachmentId.
 *  - data: An object containing job version, email metadata, attachment metadata, and the time the job was created.
 *  - opts: Job options such as retry attempts, backoff strategy, and cleanup settings.
 * - Finally, it returns an array of all created job objects.
 */
export function buildAttachmentJobs(emails) {
    const jobs = [];

    for (const email of emails) {
        const { emailId, attachments } = email;

        for (const attachment of attachments) {
            jobs.push({
                name: "Process_attachment",
                jobId: `${emailId}-${attachment.attachmentId}`,
                data: {
                    jobVersion: 1,
                    email: {
                        emailId: email.emailId,
                        subject: email.subject,
                        from: email.from,
                        date: email.date,
                    },
                    attachment: {
                        attachmentId: attachment.attachmentId,
                        filename: attachment.filename,
                        mimeType: attachment.mimeType,
                        size: attachment.size,
                    },
                    recievedAt: Date.now(),
                },

                opts: {
                    attempts: 5,  // Number of retry attempts if the job fails
                    backoff: {
                        type: 'exponential',
                        delay: 5_000,
                    },
                    removeOnComplete: true,
                    removeOnFail: false,
                }
            });
        }
    }

    return jobs;

}