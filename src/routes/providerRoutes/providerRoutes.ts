import { Router } from "express";
import {
  registerProvider,
  providerById,
  confirmEmail,
  getProvider,
  getProviders,
  updateProvider
} from "../../controllers/providerControllers";
import { authProviderMiddleware } from "../../middlewares/authProviderMiddleware";

export const providerRouter = Router();

providerRouter.param("providerId", providerById);

providerRouter.get("/confirm/:id", confirmEmail);
providerRouter.get("/provider/all", getProviders);
providerRouter.get("/provider/:providerId", getProvider);
providerRouter.put("/provider", authProviderMiddleware, updateProvider);
providerRouter.post("/provider", registerProvider);
