import { Handlers } from "$fresh/server.ts";
import { jsonResponse, withKv, requireEmail } from "../../utils/response.ts";

export const handler: Handlers = {
  async POST(request) {
    return withKv(async (kv) => {
      const requestData = await request.json();
      const email = requireEmail(requestData);
      if (!email) throw new Error(`Invalid email Id : ${requestData.emailId}`);

      const { transformName } = requestData;
      const { key, value, versionstamp } = await kv.get<string>([email, transformName]);

      return jsonResponse({ key, value, versionstamp });
    });
  },
};
