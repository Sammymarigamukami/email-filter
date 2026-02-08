
import { Queue } from "bullmq";
import { redisConnection } from "./services/email-ingestor/src/queues/bullmq.js"

const queue = new Queue("attachments", {
    connection: redisConnection,
})

async function inspect() {
    const counts = await queue.getJobCounts();
    console.log("Job counts:", counts);

    const jobs = await queue.getJobs(["waiting", "delayed"]);

    // console.log(
    //     jobs.map(job => ({
    //         id: job.id,
    //         name: job.name,
    //         data: job.data,
    //         opts: job.opts,
    //     }))
    // )
}

inspect().then(() => process.exit(0));