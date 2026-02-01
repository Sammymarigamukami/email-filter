import { Queue } from "bullmq";

/**
 * BullMQ queue for processing email attachments.
 * Each job represents an attachment to be processed.
 * 
 */
export const redisConnection = {
    host: "127.0.0.1",
    port: 6379,
};

export const attachmentQueue = new Queue("attachments", {
    connection: redisConnection,
});