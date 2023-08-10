import type { StreamOptions } from "morgan";
import morgan from "morgan";

import { env } from "../env";
import { logger } from "../logger";

// Override the stream method by telling
// Morgan to use our custom logger instead of the console.log.
const stream: StreamOptions = {
  write: (message) => logger.http(message),
};

const skip = () => {
  const node_env = env.NODE_ENV || "development";
  return node_env !== "development";
};

const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip }
);

export { morganMiddleware };