import * as faker from "faker";

import { TestClient } from "../../utils/TestClient";
import { createTypeormConn } from "../../utils/createTypeormConn";
import { Provider } from "../../entity/Provider";

faker.seed(Date.now() + 1);
const email = 'loginTest@test.com',
  password = faker.internet.password(),
  name = faker.internet.userName();

const client = new TestClient(process.env.TEST_HOST as string);

beforeAll(async () => {
  await createTypeormConn();
});

describe("Auth routes", () => {
  test("email not found send back error", async () => {
    try {
      await client.login(faker.internet.email(), faker.internet.password());
    } catch ({ response }) {
      expect(response.body).toEqual([
        {
          path: "email",
          message: "No provider exist with this email, please register"
        }
      ]);
      expect(response.statusCode).toEqual(400);
    }
  });

  test("email not confirmed", async () => {
    await client.register(email, password, name, ["123"]);

    try {
      await client.login(email, password);
    } catch ({ response }) {
      expect(response.body).toEqual([
        {
          path: "email",
          message: "Please confirm your email first"
        }
      ]);
    }

    await Provider.update({ email }, { confirmed: true });

    try {
      await client.login(email, faker.internet.password());
    } catch ({ response }) {
      expect(response.body).toEqual([
        {
          path: "password",
          message: "Wrong password"
        }
      ]);
    }

    const response = await client.login(email, password);

    const { token, provider } = response;
    expect(provider.email).toEqual(email);
    expect(provider.password).not.toEqual(email);
    expect(typeof token).toBe("string");
  });
  it("should return a logged user", async function() {
    const { token } = await client.login(email, password);
    const provider = await client.me(token);
    expect(provider.email).toBe(email);
    expect(provider.name).toBe(name);
  });
});
