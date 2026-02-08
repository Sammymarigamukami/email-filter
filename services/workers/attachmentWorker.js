import { Worker } from "bullmq";
import { resolveExtracter } from "./src/extractors/mimeRouter.js";
import { extractPdf, extractDocx, extractImage } from "./src/extractors/allExtractor.js";
import { redisConnection } from "../email-ingestor/src/queues/bullmq.js";


export const attachmentWorker = new Worker(
    "attachments",
    async (job) => {
        console.log("jobs payload", JSON.stringify(job, null, 2));
        // if (!job.data?.email || !job.data?.attachment) {
        //     throw new Error("Invalid job data: email and attachment information is required");
        // }
        const { email, attachment } = job.data;

        if (!attachment?.mimeType || !attachment?.attachmentId) {
            throw new Error("Invalid attachment data");
        }
        // Decode the base64-encoded attachmentId to get the original binary data
        const base64 = attachment.attachmentId.replace(/-/g, '+').replace(/_/g, '/');
        const attachmentId = Buffer.from(base64, 'base64');

        let text;

        const extractorType = resolveExtracter(attachment.mimeType);

        switch (extractorType) {
            case "pdf":
                text = await extractPdf(attachmentId);
                break;
            case "docx":
                text = await extractDocx(attachmentId);
                break;
            case "image":
                text = await extractImage(attachmentId);
                break;

            default:
                throw new Error(`Unsupported extractor type: ${extractorType}`);
        }
        return {
            emailId: email.emailId,
            attachmentId: attachment.attachmentId,
            mimeType: attachment.mimeType,
            extractedText: text,
        };
    },
    {
        connection: redisConnection,
        concurrency: 2,
    }
)

attachmentWorker.on("completed", (job) => {
    console.log(`Job completed: ${job.id}`);
})
attachmentWorker.on("failed", (job, err) => {
    console.error(`Job failed: ${job.id} with error ${err.message}`);
});