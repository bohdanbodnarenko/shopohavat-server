import * as swaggerJsdoc from "swagger-jsdoc";

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Shopohavat API documentation",
      version: "1.0.0",
      description: "A first version of Shpohovat project API",
      license: {
        name: "MIT",
        url: "https://choosealicense.com/licenses/mit/"
      },
      contact: {
        name: "Dev",
        url: "https://github.com/bogdanbodnarenko",
        email: "shopohavat@gmail.com"
      }
    },
    servers: [
      {
        url: "http://localhost:4000/"
      },
      {
        url: "http://54.202.50.1:4000/"
      }
    ]
  },
  apis: ["src/routes/*/*.ts", "src/entity/*.ts"]
};
export const specs = swaggerJsdoc(options);
