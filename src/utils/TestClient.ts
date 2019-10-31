import * as rp from "request-promise";

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

  //   async forgotPasswordChange(newPassword: string, key: string) {
  //     return rp.post(this.url, {
  //       ...this.options,
  //       body: {
  //         query: `
  //           mutation {
  //             forgotPasswordChange(newPassword: "${newPassword}", key: "${key}") {
  //               path
  //               message
  //             }
  //           }
  //         `
  //       }
  //     });
  //   }
  //
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
