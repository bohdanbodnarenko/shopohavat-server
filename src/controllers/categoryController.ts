import { NextFunction, Request, Response } from "express";
import { Category } from "../entity/Category";

export const categoryById = async (
  req: Request & any,
  res: Response,
  next: NextFunction,
  id
) => {
  if (!id) {
    res.json({ error: "Invalid category id" });
  }
  req.categoryById = await Category.findOne(id);
  next();
};

export const getCategories = async (req: Request, res: Response) =>
  res.json(await Category.find());

export const getCategory = async (req: Request & any, res: Response) =>
  res.json(req.categoryById);
