import { Handlers } from "$fresh/server.ts";
import { transform, DataObject } from "../../../core/mod.ts";
import { jsonResponse, errorResponse, withKv, requireEmail } from "../../utils/response.ts";

export const handler: Handlers = {
  async POST(request) {
    return withKv(async (kv) => {
      const requestData = await request.json();
      const email = requireEmail(requestData);
      if (!email) throw new Error(`Invalid email Id : ${requestData.emailId}`);

      const { transformName, input } = requestData;
      const { value } = await kv.get<Record<string, any>>([email, transformName]);

      if (value === null) {
        return jsonResponse(
          { error: `The transformation ${transformName} not found.` },
          404
        );
      }

      const dataObject: DataObject = {
        input,
        transforms: value.transforms ?? [],
        settings: value.settings ?? { merge_method: "overwrite" },
      };

      const transformedData = await transform(dataObject);
      return jsonResponse(transformedData);
    });
  },
};
