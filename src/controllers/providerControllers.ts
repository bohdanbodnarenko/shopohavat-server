import { Request, Response, NextFunction } from "express";
import { v4 } from "uuid";

import { redis } from "../redis";
import { Provider } from "../entity/Provider";
import { validProviderSchema } from "../validations/provider";
import { formatYupError } from "../utils/formatYupError";
import { emailTransporter } from "../utils/emailTransporter";

export const providerById = async (
  req: Request & any,
  res: Response,
  next: NextFunction,
  id: string
) => {
  if (!+id) {
    res.status(400).json({ error: "Not valid provider id" });
  }
  const provider = await Provider.findOne({ id: +id });
  if (!provider) {
    res.status(404).json({ error: "Provider not found" });
  }
  provider.password = undefined;
  req.providerById = provider;
  next();
};

export const confirmEmail = async (req: Request, res: Response) => {
  const { id } = req.params;
  const providerId = await redis.get(id);
  if (providerId) {
    await Provider.update({ id: +providerId }, { confirmed: true });
    await redis.del(id);
    res.send("ok");
  } else {
    res.status(400).send("invalid");
  }
};

export const registerProvider = async (req: Request, res: Response) => {
  const { body } = req;
  try {
    await validProviderSchema.validate(body, { abortEarly: false });
  } catch (err) {
    return res.status(400).json(formatYupError(err));
  }

  const { email } = body;

  const providerAlreadyExists = await Provider.findOne({
    where: { email },
    select: ["id"]
  });

  if (providerAlreadyExists) {
    return res.status(403).json([
      {
        path: "email",
        message: "Email already taken"
      }
    ]);
  }

  const provider = Provider.create(body);

  await provider.save();
  console.log("Provider saved");

  if (process.env.NODE_ENV !== "test") {
    const id = v4();
    const providerId = provider.id;
    const url: string = process.env.API_BASE as string;
    await redis.set(id, providerId, "ex", 60 * 60 * 24);
    const confirmLink = `${url}/confirm/${id}`;
    console.log(`Confirm link for ${email} is ${confirmLink}`);
    emailTransporter.sendMail(
      {
        to: email,
        from: "support@shopohavat.com",
        subject: "Confirm Email",
        html: `<html lang="en">
                  <body>
                     <p>Thanks for the registration!</p>
                     <a href="${confirmLink}">confirm email</a>
                  </body>
               </html>`
      },
      (err, info) => {
        if (err) console.error(err);
        else console.log(info);
      }
    );
  }
  return res.json({ message: "Registration success" });
};

export const getProviders = async (req: Request, res: Response) => {
  const providers = await Provider.find();
  providers.forEach(provider => (provider.password = undefined));
  res.json(providers);
};

export const getProvider = async (req: Request & any, res: Response) =>
  res.json(req.providerById);

export const updateProvider = async (req: Request & any, res: Response) => {
  const { id } = req.provider,
    { body } = req;
  try {
    delete body.password;
    await Provider.update({ id }, { ...body });
    const provider = await Provider.findOne({ id });
    delete provider.password;
    res.json(provider);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
