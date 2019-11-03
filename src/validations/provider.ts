import * as yup from "yup";

export const emailNotLongEnough = "email must be at least 3 characters";
export const nameNotLongEnough = "name must be at least 6 characters";
export const passwordNotLongEnough = "password must be at least 6 characters";
export const phonesNotValid = "phones can not be empty";
export const invalidEmail = "email must be a valid email";

const email = yup
  .string()
  .min(3, emailNotLongEnough)
  .max(255)
  .email(invalidEmail)
  .required();
export const validPasswordSchema = yup
  .string()
  .min(6, passwordNotLongEnough)
  .max(255)
  .required();

export const validProviderSchema = yup.object().shape({
  email,
  password: validPasswordSchema,
  name: yup
    .string()
    .min(6, nameNotLongEnough)
    .max(255)
    .required(),
  phones: yup.array().required(phonesNotValid)
});

export const validProviderLoginSchema = yup.object().shape({
  email,
  password:validPasswordSchema
});
