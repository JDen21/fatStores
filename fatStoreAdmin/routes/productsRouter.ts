import { Router } from "oak";
import { generateResponse } from "./utils.ts";
import { fatStore } from "./instances.ts";

const router = new Router()
  .put("/", async (ctx) => {
    const params = ctx.request.body as unknown as Parameters<
      typeof fatStore.createNewDesign
    >;
    const response = await fatStore.createNewDesign(...params);
    generateResponse(ctx.response, response);
  })
  .get("/", async (ctx) => {
    const { searchParams } = ctx.request.url;
    const response = await fatStore.getDisplayProducts(searchParams);
    generateResponse(ctx.response, response);
  })
  .post("/design-sale-details", async (ctx) => {
    const params = ctx.request.body as unknown as Parameters<
      typeof fatStore.updateDesignSaleDetails
    >;
    const response = await fatStore.requestDesignProduction(...params);
    generateResponse(ctx.response, response);
  })
  .post("/design-sale-status", async (ctx) => {
    const params = ctx.request.body as unknown as Parameters<
      typeof fatStore.updateDesignSaleStatus
    >;
    const response = await fatStore.requestDesignProduction(...params);
    generateResponse(ctx.response, response);
  })
  .post("/request-production", async (ctx) => {
    const params = ctx.request.body as unknown as Parameters<
      typeof fatStore.requestDesignProduction
    >;
    const response = await fatStore.requestDesignProduction(...params);
    generateResponse(ctx.response, response);
  });

export default router;
