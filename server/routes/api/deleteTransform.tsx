import { Handlers } from "$fresh/server.ts";
import { jsonResponse, withKv, requireEmail } from "../../utils/response.ts";

export const handler: Handlers = {
  async DELETE(request) {
    return withKv(async (kv) => {
      const requestData = await request.json();
      const email = requireEmail(requestData);
      if (!email) throw new Error(`Invalid email Id : ${requestData.emailId}`);

      const { transformName } = requestData;
      await kv.delete([email, transformName]);

      return jsonResponse({
        status: `The transform ${transformName} is deleted successfully`,
      });
    });
  },
};
