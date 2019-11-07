import { Response, Request } from "express";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import * as bcrypt from "bcryptjs";

import { Provider } from "../entity/Provider";
import {
  validPasswordSchema,
  validProviderLoginSchema
} from "../validations/provider";
import { formatYupError } from "../utils/formatYupError";
import { redis } from "../redis";
import v4 = require("uuid/v4");
import {forgotPasswordPrefix, RequestWithProvider} from "../utils/constants";
import { emailTransporter } from "../utils/emailTransporter";

const providerNotFoundMsg =
  "No provider exist with this email, please register";

export const login = async (req: Request, res: Response) => {
  const { body } = req;
  try {
    await validProviderLoginSchema.validate(body, { abortEarly: false });
  } catch (err) {
    return res.status(400).json(formatYupError(err));
  }
  const { email, password } = body;
  const provider = await Provider.findOne({ where: { email } });

  if (!provider) {
    return res.status(400).json([
      {
        path: "email",
        message: providerNotFoundMsg
      }
    ]);
  }

  if (!provider.confirmed) {
    return res.status(400).json([
      {
        path: "email",
        message: "Please confirm your email first"
      }
    ]);
  }

  if (provider.forgotPasswordLocked) {
    return res.status(403).json([
      {
        path: "email",
        message: "Account is locked"
      }
    ]);
  }

  const isValid = await compare(password, provider.password);

  if (!isValid) {
    res.status(400).json([{ path: "password", message: "Wrong password" }]);
  }

  delete provider.password;
  const token = sign(
    {
      id: provider.id
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "2 days" }
  );
  res.json({
    provider,
    token
  });
};

export const me = (req: RequestWithProvider, res: Response) => res.json(req.provider);

export const sendForgotPasswordEmail = async (req: Request, res: Response) => {
  const { email } = req.body;
  const provider = await Provider.findOne({ email });
  if (!provider) {
    return res.status(404).json([
      {
        path: "email",
        message: providerNotFoundMsg
      }
    ]);
  }
  await Provider.update({ id: provider.id }, { forgotPasswordLocked: true });

  const id = v4();
  await redis.set(`${forgotPasswordPrefix}${id}`, provider.id, "ex", 60 * 20);
  const recoverLink = `${process.env.FRONTEND_HOST as string}/forgot-password/${id}`;
  console.log(`Recover password link for provider ${email}: ${recoverLink}`);
  emailTransporter.sendMail(
    {
      to: email,
      from: "support@shopohavat.com",
      subject: "Password recovering",
      html: `<html lang="en">
                  <body>
                     <p>Shopohavat password recovering</p>
                     <a href="${recoverLink}">Recover password</a>
                  </body>
               </html>`
    },
    (err, info) => {
      if (err) console.error(err);
      else console.log(info);
    }
  );
  return res.json({ message: "Mail for changing the password was sent" });
};

export const changePassword = async (req: Request, res: Response) => {
  const { key } = req.params;
  const { password } = req.body;
  const redisKey = `${forgotPasswordPrefix}${key}`;

  const providerId = await redis.get(redisKey);
  if (!providerId) {
    return res.status(400).json([
      {
        path: "key",
        message: "Key was expired, please try again"
      }
    ]);
  }

  try {
    await validPasswordSchema.validate({ password }, { abortEarly: false });
  } catch (err) {
    return res.status(400).json(formatYupError(err));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const updatePromise = Provider.update(
    { id: +providerId },
    {
      forgotPasswordLocked: false,
      password: hashedPassword
    }
  );

  const deleteKeyPromise = redis.del(redisKey);

  await Promise.all([updatePromise, deleteKeyPromise]);

  return res.json({ message: "Password successfully changed" });
};
