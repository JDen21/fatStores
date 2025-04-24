import {
  appConfigs,
  commonTypes,
  ControllerError,
  serviceTypes,
} from "./externals.ts";

export default class FatStoresController {
  private productsQuery: serviceTypes.IProductQuery;
  private validator: serviceTypes.tValidator;
  private permissions: serviceTypes.IPermissions;

  constructor(
    productsQuery: serviceTypes.IProductQuery,
    validator: serviceTypes.tValidator,
    permissions: serviceTypes.IPermissions,
  ) {
    this.productsQuery = productsQuery;
    this.validator = validator;
    this.permissions = permissions;
  }

  // * designer only
  createNewDesign(body: {
    designerId: string;
    productId: string;
    name: string;
    description: string;
    price: number;
    maxSeller: number;
  }) {
    const { designerId, productId, name, description, price, maxSeller } = body;

    const check = this.validator.getSchema;
    const checkVals: commonTypes.iterCheck[] = [
      ["sqlStrId", designerId, "designerId"],
      ["sqlStrId", productId, "productId"],
      ["sqlName", name, "name"],
      ["baseStr", description, "description"],
      ["positiveNumber", price, "price"],
      ["positiveNumber", maxSeller, "maxSeller"],
    ];

    for (const checkVal of checkVals) {
      if (check(checkVal[0])?.call(check, checkVal[1]) !== true) {
        return new ControllerError(400, `Unable to validate ${checkVal[2]}.`);
      }
    }

    const designId = crypto.randomUUID().substring(0, appConfigs.idLength);
    const qParams: Parameters<typeof this.productsQuery.createNewDesign> = [
      designId,
      productId,
      designerId,
      name,
      description,
      price,
      maxSeller,
    ];
    return this.productsQuery.createNewDesign(...qParams);
  }

  getDisplayProducts(qParams: URLSearchParams) {
    const offset = qParams.get("offset");
    const check = this.validator.getSchema("positiveNumber");

    if (check?.call(check, offset) !== true) {
      return new ControllerError(400, "Unable to validate offset.");
    }

    const numOffset = parseInt(offset ?? "");
    return this.productsQuery.getProductsDisplay(numOffset);
  }

  requestDesignProduction(body: { designId: string }) {
    const check = this.validator.getSchema("sqlStrId");

    if (check?.call(check, body.designId) !== true) {
      return new ControllerError(400, "Unable to validate designId.");
    }

    return this.productsQuery.requestNewProducer(body.designId);
  }

  updateDesignSaleDetails(
    body: {
      designId: string;
      name: string;
      description: string;
      price: number;
      maxSeller: number;
    },
  ) {
    const checkVals: commonTypes.iterCheck[] = [
      ["sqlStrId", body.designId, "designerId"],
      ["sqlName", body.name, "name"],
      ["baseStr", body.description, "description"],
      ["positiveNumber", body.price, "price"],
      ["positiveNumber", body.maxSeller, "maxSeller"],
    ];
    const check = this.validator.getSchema;
    for (const checkVal of checkVals) {
      if (check(checkVal[0])?.call(check, checkVal[1]) !== true) {
        return new ControllerError(400, `Unable to validate ${checkVal[2]}.`);
      }
    }

    return this.productsQuery.updateDesignSaleDetails(
      body.designId,
      body.name,
      body.description,
      body.price,
      body.maxSeller,
    );
  }

  updateDesignSaleStatus(body: { designId: string; onSale: boolean }) {
    const checkVals: commonTypes.iterCheck[] = [
      ["sqlStrId", body.designId, "designerId"],
      ["baseBool", body.onSale, "onSale"],
    ];

    const check = this.validator.getSchema;
    for (const checkVal of checkVals) {
      if (check(checkVal[0])?.call(check, checkVal[1]) !== true) {
        return new ControllerError(400, `Unable to validate ${checkVal[2]}.`);
      }
    }

    return this.productsQuery.updateDesignSaleStatus(
      body.designId,
      body.onSale,
    );
  }
}
