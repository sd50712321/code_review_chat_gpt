import * as Joi from '@hapi/joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(3306).required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  PORT: Joi.number().default(3000).required(),
  SALT: Joi.string().required(),
  JWT_EXPIRATION_TIME: Joi.number()
    .default(60 * 60 * 24)
    .required(),
  ACCESS_KEY_ID: Joi.string().required(),
});
