import { TestClient } from "../../utils/TestClient";
import { createTypeormConn } from "../../utils/createTypeormConn";

const client = new TestClient(),
  categories = ["Sushi", "FastFood", "Drinks"];

beforeAll(async () => {
  const connection = await createTypeormConn();
  await connection.query(
    `insert  into category (name) values ${categories
      .map((category: string) => `('${category}')`)
      .join(", ")}`
  );
});

describe("Category routes", () => {
  it("should return a category by id", async function() {
    const response = await client.getCategory(1);
    expect(response).toEqual({ id: 1, name: categories[0] });
  });

  it("should return all categories", async function() {
    const response = await client.getCategories();
    expect(response.length).toEqual(categories.length);
    expect(response[2].name).toEqual(categories[2]);
  });
});
