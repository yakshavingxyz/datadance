import { Handlers } from "$fresh/server.ts";
import { jsonResponse, withKv, requireEmail } from "../../utils/response.ts";

export const handler: Handlers = {
  async DELETE(request) {
    return withKv(async (kv) => {
      const requestData = await request.json();
      const email = requireEmail(requestData);
      if (!email) throw new Error(`Invalid email Id : ${requestData.emailId}`);

      const iter = kv.list<string>({ prefix: [email] });
      const transforms = [];
      for await (const res of iter) transforms.push(res);

      for (const transform of transforms) {
        await kv.delete([email, transform.key[1]]);
      }

      return jsonResponse({
        status: `All transforms created by user ${email} are deleted successfully`,
      });
    });
  },
};
