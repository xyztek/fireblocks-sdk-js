import { RequestOptions } from "./types";
import axios, { AxiosInstance } from "axios";

export class ApiClientProxy {
  private axiosInstance: AxiosInstance;
  private token: string;

  constructor(
    private apiKey: string,
    private apiBaseUrl: string,
    private options: { timeoutInMs?: number }
  ) {
    this.axiosInstance = axios.create({
      baseURL: this.apiBaseUrl,
    });
  }

  private getApiKey(): string {
    return this.apiKey;
  }

  private getToken(): string {
    return this.token;
  }

  public injectToken(token: string) {
    this.token = token;
  }

  public async issueGetRequest(path: string, pageMode: boolean = false) {
    const res = await this.axiosInstance.get(path, {
      headers: {
        "X-API-Key": this.getApiKey(),
        Authorization: `Bearer ${this.getToken()}`,
      },
      timeout: this.options.timeoutInMs,
    });

    if (pageMode) {
      return {
        transactions: res.data,
        pageDetails: {
          prevPage: res.headers["prev-page"]
            ? res.headers["prev-page"].toString()
            : "",
          nextPage: res.headers["next-page"]
            ? res.headers["next-page"].toString()
            : "",
        },
      };
    }

    return res.data;
  }

  public async issuePostRequest(
    path: string,
    body: any,
    requestOptions?: RequestOptions
  ) {
    const idempotencyKey = requestOptions?.idempotencyKey;
    const headers: any = {
      "X-API-Key": this.getApiKey(),
      Authorization: `Bearer ${this.getToken()}`,
    };

    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    return (
      await this.axiosInstance.post(path, body, {
        headers,
        timeout: this.options.timeoutInMs,
      })
    ).data;
  }

  public async issuePutRequest(path: string, body: any) {
    return (
      await this.axiosInstance.put(path, body, {
        headers: {
          "X-API-Key": this.getApiKey(),
          Authorization: `Bearer ${this.getToken()}`,
        },
        timeout: this.options.timeoutInMs,
      })
    ).data;
  }

  public async issueDeleteRequest(path: string) {
    return (
      await this.axiosInstance.delete(path, {
        headers: {
          "X-API-Key": this.getApiKey(),
          Authorization: `Bearer ${this.getToken()}`,
        },
        timeout: this.options.timeoutInMs,
      })
    ).data;
  }
}
