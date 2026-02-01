import { Queue } from "bullmq";

const queue = new Queue("SMOKE_TEST", {
  connection: {
    host: "127.0.0.1",
    port: 6379,
  },
});

await queue.add("test", { hello: "world" });
console.log("Redis write OK");
process.exit(0);
