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
/**
 * @swagger
 * tags:
 *   name: Provider
 *   description: Provider management
 */

/**
 * @swagger
 * path:
 *  /provider/:
 *    post:
 *      summary: Create a new provider
 *      tags: [Provider]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Provider'
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 */

providerRouter.get("/confirm/:id", confirmEmail);
providerRouter.get("/provider/all", getProviders);
providerRouter.get("/provider/:providerId", getProvider);
providerRouter.put("/provider", authProviderMiddleware, updateProvider);
providerRouter.post("/provider", registerProvider);
