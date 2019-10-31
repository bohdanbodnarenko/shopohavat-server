import { Router } from "express";
import {
  createProduct,
  getProduct,
  getProducts,
  productById,
  updateProduct
} from "../../controllers/productController";
import { authProviderMiddleware } from "../../middlewares/authProviderMiddleware";

export const productRouter = Router();

productRouter.param("productId", productById);

productRouter.get("/product/all", getProducts);
productRouter.get("/product/:productId", getProduct);
productRouter.post("/product", authProviderMiddleware, createProduct);
productRouter.put("/product/:productId", authProviderMiddleware, updateProduct);
