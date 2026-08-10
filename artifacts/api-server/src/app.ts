import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import stripeWebhookRouter from "./routes/stripe-webhook";
import { logger } from "./lib/logger";
import path from "path";

const app: Express = express();
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors());

// Stripe needs the untouched request body to verify the webhook signature, so the raw
// parser is scoped to that one path and must run before express.json() below.
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use("/api", stripeWebhookRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

const clientDir = path.join(import.meta.dirname, "public");
app.use(express.static(clientDir));
// Serve SPA index.html for non-API GET/HEAD requests (avoid Express 5 wildcard route issues)
app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    // Only respond to GET and HEAD to avoid interfering with other HTTP methods
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    res.sendFile(path.join(clientDir, "index.html"), (err) => {
      if (err) return next(err);
    });
});


export default app;
