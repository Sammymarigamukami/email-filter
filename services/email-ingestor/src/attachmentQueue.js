

export function attachmentQueue(emails) {
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
                    attempts: 5,
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