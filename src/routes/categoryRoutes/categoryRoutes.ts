import { Router } from "express";

import {
  categoryById,
  getCategories,
  getCategory
} from "../../controllers/categoryController";

export const categoryRouter = Router();

categoryRouter.param("categoryId", categoryById);

categoryRouter.get("/category/all", getCategories);
categoryRouter.get("/category/:categoryId", getCategory);
