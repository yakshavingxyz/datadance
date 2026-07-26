import { Handlers } from "$fresh/server.ts";
import { jsonResponse } from "../../utils/response.ts";

export const handler: Handlers = {
  GET() {
    return jsonResponse({ status: "UP" });
  },
};
