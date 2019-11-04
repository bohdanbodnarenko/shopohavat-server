import "dotenv/config";
import "reflect-metadata";
import * as express from "express";
import * as session from "express-session";
import * as connectRedis from "connect-redis";
import * as cors from "cors";
import * as bodyParser from "body-parser";
import * as RateLimit from "express-rate-limit";
import * as RateLimitRedisStore from "rate-limit-redis";
import { serve, setup } from "swagger-ui-express";

import { redis } from "./redis";
import * as routes from "./routes/";
import { createTypeormConn } from "./utils/createTypeormConn";
import httpLogger from "./middlewares/httpLogger";
import { specs } from "./apiSpecs";

const SESSION_SECRET = "qwe124rwewfsdr1";
const RedisStore = connectRedis(session as any);

export const startServer = async () => {
  if (process.env.NODE_ENV === "test") {
    await redis.flushall();
  }

  const app = express();

  app.use(httpLogger);
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use("/swagger", serve, setup(specs));

  app.use(
    new RateLimit({
      store: new RateLimitRedisStore({
        client: redis
      }),
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      delayMs: 0 // disable delaying - full speed until the max limit is reached
    })
  );

  app.use(
    session({
      store: new RedisStore({
        client: redis as any,
        prefix: "sess:"
      }),
      name: "qid",
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    } as any)
  );

  for (let route of Object.values(routes)) {
    app.use("/", route);
  }

  const port = (process.env.PORT as string) || 4000;

  await createTypeormConn();

  app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}/ 🚀`);
    return app;
  });
};
