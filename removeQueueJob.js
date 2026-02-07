import { Queue } from "bullmq";
import { redisConnection } from "./services/email-ingestor/src/queues/bullmq.js";


const queue = new Queue("attachments", {
    connection: redisConnection,
});

await queue.obliterate({ force: true });
console.log("All jobs in the 'attachments' queue have been removed.");
process.exit(0);