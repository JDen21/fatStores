import * as services from "./services.ts";
import * as controllers from "./controllers.ts";

const { validatorsService } = services;
const qProducts = new services.ProductQueryService();

export const fatStore = new controllers
  .FatStoresController(qProducts, validatorsService.validatorInstance);
