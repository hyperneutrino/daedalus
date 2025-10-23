import { Job, Queue, Worker, type WorkerOptions } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({ maxRetriesPerRequest: null });

export const queues = {
    clients: new Queue<{ action: "start" | "stop" | "restart"; token: string }>("clients", { connection }),
};

export function makeWorker<T extends keyof typeof queues>(
    key: T,
    handler: (job: Job<(typeof queues)[T] extends Queue<infer U> ? U : never>) => any,
    options?: WorkerOptions,
) {
    return new Worker(key, handler, { connection, ...(options ?? {}) });
}
