import { Handlers } from "$fresh/server.ts";
import { ddsToJson } from "../../../core/mod.ts";
import { jsonResponse, errorResponse } from "../../utils/response.ts";

export const handler: Handlers = {
  async POST(request) {
    try {
      const data = await request.text();
      const parsedTransformsData = ddsToJson(data);
      return jsonResponse(parsedTransformsData);
    } catch (error) {
      return errorResponse(error, 400);
    }
  },
};
