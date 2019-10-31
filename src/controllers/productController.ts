import { NextFunction, Request, Response } from "express";
import { formatYupError } from "../utils/formatYupError";
import { validProductSchema } from "../validations/product";
import { Product } from "../entity/Product";
import { RequestWithProvider } from "../utils/constants";

export const createProduct = async (
  req: RequestWithProvider,
  res: Response
) => {
  const { body } = req;
  try {
    await validProductSchema.validate(body, { abortEarly: false });
  } catch (err) {
    return res.status(400).json(formatYupError(err));
  }

  const { name } = body,
    { count, volume, weight } = body;

  const productsWithSameName = await Product.find({
    where: { name, provider: req.provider }
  });
  productsWithSameName.filter(
    product =>
      product.count == count &&
      product.volume == volume &&
      product.weight == weight
  );
  const isSameIxists = !!productsWithSameName.filter(
    product =>
      product.count == count &&
      product.volume == volume &&
      product.weight == weight
  ).length;

  if (isSameIxists) {
    return res.status(400).json([
      {
        path: "Name",
        message: "You already have exactly same product"
      }
    ]);
  }

  const product = Product.create(body);
  product.provider = req.provider;
  await product.save();

  return res.json(product);
};

export const productById = async (
  req: Request & any,
  res: Response,
  next: NextFunction,
  id
) => {
  if (!+id) {
    res.status(400).json({ error: "Not valid product id" });
  }
  const product = await Product.findOne(
    { id: +id },
    { relations: ["provider"] }
  );
  delete product.provider.password;
  if (!product) {
    res.status(404).json({ error: "Product not found" });
  }
  req.productById = product;
  next();
};

export const getProducts = async (req: Request, res: Response) => {
  const { limit, offset } = req.query;
  const products = await Product.createQueryBuilder()
    .offset(offset)
    .limit(limit || 100)
    .getMany();
  res.json(products);
};

export const getProduct = async (req: Request & any, res: Response) =>
  res.json(req.productById);

export const updateProduct = async (
  req: RequestWithProvider & any,
  res: Response
) => {
  const { id } = req.productById.provider;
  const isOwner = id === req.provider.id;
  if (!isOwner) {
    res.status(403).json({ error: "You can change only your own products" });
  }
  await Product.update({ id }, req.body);
  const newProduct = await Product.findOne({ id });
  res.json(newProduct);
};
