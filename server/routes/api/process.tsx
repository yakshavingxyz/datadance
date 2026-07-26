import { Handlers } from "$fresh/server.ts";
import { transform } from "../../../core/mod.ts";
import { jsonResponse, errorResponse } from "../../utils/response.ts";

export const handler: Handlers = {
  async POST(request) {
    try {
      const data = await request.json();
      const transformedData = await transform(data);
      return jsonResponse(transformedData);
    } catch (error) {
      return errorResponse(error, 400);
    }
  },
};
