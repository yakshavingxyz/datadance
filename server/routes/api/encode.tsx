import { Handlers } from "$fresh/server.ts";
import { jsonToDds } from "../../../core/mod.ts";
import { jsonResponse, errorResponse, textResponse } from "../../utils/response.ts";

export const handler: Handlers = {
  async POST(request) {
    try {
      const data = await request.json();
      const parsedTransformsData = jsonToDds(data);
      return textResponse(JSON.stringify(parsedTransformsData), "text/yaml");
    } catch (error) {
      return errorResponse(error, 400);
    }
  },
};
