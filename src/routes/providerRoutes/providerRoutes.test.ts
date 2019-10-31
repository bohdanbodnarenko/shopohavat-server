import * as faker from "faker";

import { createTypeormConn } from "../../utils/createTypeormConn";
import { TestClient } from "../../utils/TestClient";
import { Provider } from "../../entity/Provider";

faker.seed(Date.now() + 5);
const email = 'registerTest@test.com',
  password = faker.internet.password(),
  name = faker.internet.userName(),
  phones = ["123", "321"];

const client = new TestClient();

beforeAll(async () => {
  await createTypeormConn();
});

describe("Register provider", () => {
  it("check for duplicate emails", async () => {
    const response = await client.register(email, password, name, phones);
    expect(response).toEqual({ message: "Registration success" });
    const providers = await Provider.find({ where: { email } });
    expect(providers).toHaveLength(1);
    const provider = providers[0];
    expect(provider.email).toEqual(email);
    expect(provider.password).not.toEqual(password);

    try {
      await client.register(email, password, name, phones);
    } catch ({ response }) {
      const { body } = response;
      expect(body).toHaveLength(1);
      expect(body).toEqual([
        {
          path: "email",
          message: "Email already taken"
        }
      ]);
      expect(response.statusCode).toEqual(403);
    }
  });

  it("check bad email", async () => {
    try {
      await client.register("b", password, name, phones);
    } catch ({ response }) {
      expect(response.body).toEqual([
        {
          path: "email",
          message: "email must be at least 3 characters"
        },
        {
          path: "email",
          message: "email must be a valid email"
        }
      ]);
    }
  });

  it("check bad password", async () => {
    try {
      await client.register(faker.internet.email(), "ad", name, phones);
    } catch ({ response }) {
      expect(response.body).toEqual([
        {
          path: "password",
          message: "password must be at least 6 characters"
        }
      ]);
    }
  });

  it("check bad password and bad email", async () => {
    try {
      await client.register("df", "ad", name, phones);
    } catch ({ response }) {
      expect(response.body).toEqual([
        {
          path: "email",
          message: "email must be at least 3 characters"
        },
        {
          path: "email",
          message: "email must be a valid email"
        },
        {
          path: "password",
          message: "password must be at least 6 characters"
        }
      ]);
    }
  });

  it("check bad  name", async () => {
    try {
      await client.register(email, password, "", phones);
    } catch ({ response }) {
      expect(response.body).toEqual([
        {
          path: "name",
          message: "name must be at least 6 characters"
        },
        {
          path: "name",
          message: "name is a required field"
        }
      ]);
    }
  });

  it("check bad phones", async () => {
    try {
      await client.register(email, password, name, []);
    } catch ({ response }) {
      expect(response.body).toEqual([
        {
          path: "phones",
          message: "phones can not be empty"
        }
      ]);
    }
  });
});
