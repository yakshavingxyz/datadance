import { Handlers } from "$fresh/server.ts";
import { jsonResponse, withKv, requireEmail } from "../../utils/response.ts";

export const handler: Handlers = {
  async POST(request) {
    return withKv(async (kv) => {
      const requestData = await request.json();
      const email = requireEmail(requestData);
      if (!email) throw new Error(`Invalid email Id : ${requestData.emailId}`);

      const { transformName, settings, transforms } = requestData;
      const result = await kv.set([email, transformName], {
        settings,
        transforms,
      });

      return jsonResponse({
        status: "The transforms are saved successfully!...",
        versionstamp: result.versionstamp,
      });
    });
  },
};
