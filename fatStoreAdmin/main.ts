import productsRouter from "./routes/productsRouter.ts";
import { Application, Router } from "oak";

const prefix = Deno.env.get("ENV") !== "production" ? "/dev-api" : "/api";

const mainRouter = new Router();
mainRouter.prefix(`${prefix}/fatStoreAdmin`);
mainRouter.get("/", (ctx) => {
  ctx.response.body = { data: "Router working" };
});

mainRouter.use(
  "/products",
  productsRouter.routes(),
  productsRouter.allowedMethods(),
);

const application = new Application();
application.proxy = true;

await application
  .use(mainRouter.routes())
  .use(mainRouter.allowedMethods())
  .listen({ port: 8001, hostname: "localhost" });
