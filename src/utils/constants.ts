import { Request } from "express";
import { Provider } from "../entity/Provider";

export const forgotPasswordPrefix = "forgotPassword:";
export interface RequestWithProvider extends Request {
  provider: Provider;
}
