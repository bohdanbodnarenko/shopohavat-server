import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { Provider } from "../entity/Provider";

export const authProviderMiddleware = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  if (!req.header("Authorization")) {
    res.status(403).json({ error: "Not authenticated" });
  }
  const token = req.header("Authorization").replace("Bearer ", "");
  try {
    const { id } = verify(token, process.env.JWT_SECRET as string);
    const provider = await Provider.findOne({ id });
    if (!provider) {
      return res.status(403).json({ error: "Wrong access token" });
    }
    delete provider.password;
    req.provider = provider;
    req.token = token;
    next();
  } catch (error) {
    return res
      .status(401)
      .send({ error: "Not authorized to access this resource" });
  }
};
