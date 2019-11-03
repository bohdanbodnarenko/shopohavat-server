import { Router } from "express";

import {
  changePassword,
  login,
  me,
  sendForgotPasswordEmail
} from "../../controllers/authController";
import { authProviderMiddleware } from "../../middlewares/authProviderMiddleware";

export const authRouter = Router();

authRouter.get("/me", authProviderMiddleware, me);
authRouter.post("/login", login);
authRouter.post("/change-password", sendForgotPasswordEmail);
authRouter.post("/change-password/:key", changePassword);
