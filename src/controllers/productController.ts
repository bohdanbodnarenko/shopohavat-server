import { NextFunction, Request, Response } from "express";
import { getConnection, In } from "typeorm";
import * as _ from "lodash";

import { formatYupError } from "../utils/formatYupError";
import { validProductSchema } from "../validations/product";
import { Product } from "../entity/Product";
import { RequestWithProvider } from "../utils/constants";
import { Category } from "../entity/Category";
import { Provider } from "../entity/Provider";

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
  const isSameExists = !!productsWithSameName.filter(
    product =>
      product.count == count &&
      product.volume == volume &&
      product.weight == weight
  ).length;

  if (isSameExists) {
    return res.status(400).json([
      {
        path: "name",
        message: "You already have exactly same product"
      }
    ]);
  }

  const categoriesId = body.categories;
  const categories = await Category.find({ where: { id: In(categoriesId) } });
  const product = Product.create({ ...body, categories });
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
    { relations: ["provider", "categories"] }
  );
  if (!product || !product.provider) {
    res.status(404).json({ error: "Product not found" });
  }
  delete product.provider.password;
  req.productById = product;
  next();
};

export const getProducts = async (req: Request, res: Response) => {
  const { limit, offset, providerId, categoryId } = req.query;
  const products = await Product.createQueryBuilder("product")
    .offset(offset)
    .where(providerId ? { provider: await Provider.findOne(providerId) } : {})
    .leftJoinAndSelect("product.categories", "category")
    .limit(limit && limit < 100 ? limit : 100)
    .getMany();
  if (categoryId) {
    return res.json(
      products.filter(product =>
        product.categories.some(category => category.id == categoryId)
      )
    );
  }
  res.json(products);
};

export const getProductsCount = async (req: Request, res: Response) => {
  const { providerId, categoryId } = req.query;
  const count = await Product.createQueryBuilder("product")
    .where(providerId ? { provider: await Provider.findOne(providerId) } : {})
    .leftJoinAndSelect("product.categories", "category")
    .getCount();
  res.json({ count });
};

export const getProduct = async (req: Request & any, res: Response) =>
  res.json(req.productById);

export const updateProduct = async (
  req: RequestWithProvider & any,
  res: Response
) => {
  const { productById } = req,
    { id } = productById.provider,
    { body } = req,
    isOwner = id === req.provider.id;
  if (!isOwner) {
    res.status(403).json({ error: "You can change only your own products" });
  }

  if (body.categories && body.categories.length) {
    body.categories = await Category.find({
      where: { id: In(body.categories) }
    });
  }
  const tableFields = getConnection()
      .getMetadata(Product)
      .columns.map(({ propertyName }) => propertyName),
    fieldToUpdate = _.pick(body, tableFields);
  const { raw: newProduct } = await getConnection()
    .createQueryBuilder()
    .update(Product)
    .set(fieldToUpdate)
    .where("id = :id", { id })
    .returning("*")
    .execute();
  res.json(newProduct);
};
