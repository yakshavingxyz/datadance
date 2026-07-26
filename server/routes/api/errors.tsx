import { Handlers } from "$fresh/server.ts";
import { Errors } from "../../../core/mod.ts";
import { jsonResponse } from "../../utils/response.ts";

export const handler: Handlers = {
  GET() {
    return jsonResponse(Object.values(Errors));
  },
};
