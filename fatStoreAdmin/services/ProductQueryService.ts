import { SqlConnection } from "./SqlConnection.ts";
import { serviceTypes } from "./externals.ts";

export default class ProductQueryService extends SqlConnection
  implements serviceTypes.IProductQuery {
  private maxProductsPerQuery = 25;
  name = "IProductQuery";

  createNewDesign(
    designId: string,
    productId: string,
    designerId: string,
    name: string,
    description: string,
    price: number,
    maxSeller: number,
  ) {
    const query = `
      INSERT INTO fatStoreProducts(
        designId, productId, designerId, name, description, price, maxSeller
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      designId,
      productId,
      designerId,
      name,
      description,
      price,
      maxSeller,
    ];
    return this.generateQueryResponse(query, values);
  }

  getProductsDisplay(offset: number) {
    const query = `
      SELECT
        designId, productId, designerId, producerId,
        name, description, price, salesCount,
        maxSeller, activeSellersCount
      FROM fatStoreProducts
      WHERE
        onSale = true
        AND producerId IS NOT NULL
      LIMIT ${this.maxProductsPerQuery}
      OFFSET ?`;
    const values = [offset];
    return this.generateQueryResponse(query, values);
  }

  requestNewProducer(designId: string) {
    const query = `
      UPDATE fatStoreProducts
      SET producerId = NULL, requestProducer = true, onSale = false
      WHERE designId = ?`;
    const values = [designId];
    return this.generateQueryResponse(query, values);
  }

  updateDesignSaleDetails(
    designId: string,
    name: string,
    description: string,
    price: number,
    maxSeller: number,
  ) {
    const query = `
      UPDATE fatStoreProducts
      SET name = ?, description = ?, price = ?, maxSeller = ?
      WHERE designId = ?`;
    const values = [name, description, price, maxSeller, designId];
    return this.generateQueryResponse(query, values);
  }

  updateDesignSaleStatus(designId: string, onSale: boolean) {
    const query = `
      UPDATE fatStoreProducts
      SET onSale = ?
      WHERE designId = ?`;
    const values = [onSale, designId];
    return this.generateQueryResponse(query, values);
  }
}
