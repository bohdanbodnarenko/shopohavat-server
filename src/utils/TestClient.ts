import * as rp from "request-promise";
import { number } from "yup";

export class TestClient {
  url: string;
  options: {
    jar: any;
    withCredentials: boolean;
    json: boolean;
  };
  constructor(url: string = process.env.API_BASE || "http://localhost:4000") {
    this.url = url;
    this.options = {
      withCredentials: true,
      jar: rp.jar(),
      json: true
    };
  }

  async register(email: string, password: string, name, phones) {
    return rp.post(`${this.url}/provider`, {
      ...this.options,
      body: {
        email,
        password,
        name,
        phones
      }
    });
  }

  async getCategory(id: number) {
    return rp.get(`${this.url}/category/${id}`, this.options);
  }

  async getCategories() {
    return rp.get(`${this.url}/category/all`, this.options);
  }
  async createProduct(
    body: {
      price: number;
      name: string;
      deliverable: boolean;
      categories: number[];
    },
    token = ""
  ) {
    return rp.post(`${this.url}/product`, {
      ...this.options,
      headers: {
        Authorization: `Bearer ${token}`
      },
      body
    });
  }

  async updateProduct(
    body: {
      name: string;
      categories: number[];
    },
    productId,
    token
  ) {
    return rp.put(`${this.url}/product/${productId}`, {
      ...this.options,
      headers: {
        Authorization: `Bearer ${token}`
      },
      body
    });
  }

  async me(token) {
    return rp.get(`${this.url}/me`, {
      ...this.options,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  async login(email: string, password: string) {
    return rp.post(`${this.url}/login`, {
      ...this.options,
      body: {
        email,
        password
      }
    });
  }
}
