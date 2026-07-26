// Copyright (c) 2024-Present The Yak Shaving Devs, MIT License

import { parseArgs } from "@std/cli/parse-args";
import { transform } from "../core/mod.ts";
import { printHelp } from "./help.ts";

const main = async (cliArguments: string[]): Promise<void> => {
  if (cliArguments.length === 0) {
    console.error("%cNo arguments passed", "color: red;");
    await printHelp();
    Deno.exit(1);
  }

  const requiredArguments = [
    "input",
    "transforms",
    "settings"
  ];

  const parsedArguments = parseArgs(cliArguments, {
    string: requiredArguments,
    alias: {
      "input": "i",
      "transforms": "t",
      "settings": "s",
    },
  });

  if (!requiredArguments.every((argument) => argument in parsedArguments)) {
    console.error("%cPlease pass all required arguments", "color: red;");
    await printHelp();
    Deno.exit(1);
  } else {
    const transformedOutput = await transform({
      input: JSON.parse(parsedArguments.input || "{}"),
      transforms: JSON.parse(parsedArguments.transforms || "[]"),
      settings: JSON.parse(parsedArguments.settings || "{}"),
    });

    console.log(transformedOutput);
  }
}

await main(Deno.args);