import { TestClient } from "../../utils/TestClient";
import { Provider } from "../../entity/Provider";
import { createTypeormConn } from "../../utils/createTypeormConn";

const client = new TestClient();

beforeAll(async () => {
  await createTypeormConn();
});
let token = "",
  productId = 1;

describe("Product routes", () => {
  it("should be error that not authenticated", async function() {
    try {
      await client.createProduct({
        name: "newProduct",
        price: 12,
        deliverable: true,
        categories: [1, 2]
      });
    } catch ({ response }) {
      expect(response.statusCode).toEqual(403);
      expect(response.body).toEqual({ error: "Wrong token" });
    }
  });
  it("should create a new product", async function() {
    const email = "testProduct@test.com",
      password = "test123",
      name = "Test Product",
      phones = [123, 321];

    await client.register(email, password, name, phones);
    await Provider.update({ email }, { confirmed: true });
    const response = await client.login(email, password);
    token = response.token;
    const { id } = await client.createProduct(
      {
        name: "newProduct",
        price: 12,
        deliverable: true,
        categories: [1, 2]
      },
      token
    );
    productId = id;
  });
  it("should update the product", async function() {
    const newName = "testUpdate";
    const [{ name }] = await client.updateProduct(
      {
        name: newName,
        categories: [1, 2]
      },
      productId,
      token
    );
    expect(name).toEqual(newName);
  });
});
