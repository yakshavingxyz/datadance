import { DataObject, DdsDataObject, SerialOperations } from "./types.ts";

export function jsonToDds(transforms: SerialOperations, indent: number = 0): string {
  const spaces = "  ";
  let result = "";

  for (const item of transforms) {
    if (typeof item !== "object" || Array.isArray(item)) continue;

    for (const key in item) {
      const value = item[key];

      if (typeof value === "object" && !Array.isArray(value)) {
        result += `${spaces.repeat(indent)}${key}:\n`;
        result += jsonToDds([value], indent + 1);
      } else if (Array.isArray(value)) {
        result += `${spaces.repeat(indent)}${key}:\n`;
        for (const subItem of value) {
          if (typeof subItem === "object") {
            result += `${spaces.repeat(indent + 1)}  ${jsonToDds([subItem], indent + 2).trim()}\n`;
          } else {
            result += `${spaces.repeat(indent + 1)}  ${subItem}\n`;
          }
        }
      } else {
        result += `${spaces.repeat(indent)}${key}: ${value}\n`;
      }
    }
  }

  return result;
}

export function ddsToJson(dds: string): SerialOperations {
  try {
    const lines = dds.split("\n");
    const result: SerialOperations = [];
    const indentStack: Array<{ indent: number; target: SerialOperations }> = [
      { indent: -1, target: result },
    ];
    let errorMessage = "";

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      const trimmed = line.trim();
      if (!trimmed) continue;

      const indent = line.search(/\S/);
      errorMessage = errorMessage || validateLine(line, trimmed, indent, lineIdx);
      if (errorMessage) break;

      const parts = trimmed.split(":");
      const key = parts[0].trim();
      const value = parts.slice(1).map((s) => s.trim()).join(":");

      const entry = value ? { [key]: value } : { [key]: [] };

      while (indentStack.length > 1 && indentStack[indentStack.length - 1].indent >= indent) {
        indentStack.pop();
      }

      const parent = indentStack[indentStack.length - 1].target;
      parent.push(entry);

      if (!value) {
        indentStack.push({ indent, target: entry[key] as SerialOperations });
      }
    }

    if (errorMessage) {
      return [{ error: errorMessage }];
    }
    return result;
  } catch (error) {
    return [{ error: error }];
  }
}

function validateLine(
  line: string,
  trimmed: string,
  indent: number,
  lineIdx: number
): string {
  if (indent % 2 !== 0) {
    return `Indentation error at line ${lineIdx + 1}: "${line}". Indentation must be in multiples of 2 spaces.`;
  }
  if (line.includes('"')) {
    return `Error at line ${lineIdx + 1}: ${line}. " character is not allowed, use 'literal' to represent string literal.`;
  }
  if (!line.includes(":")) {
    return `Error at line ${lineIdx + 1}: ${line}. Please provide a valid expression`;
  }
  const colonIndex = trimmed.indexOf(":");
  const key = trimmed.slice(0, colonIndex).trim();
  if (/[^\w\s_$]/.test(key)) {
    return `Error at line ${lineIdx + 1}: ${line}. Field names can only use special characters _ and $`;
  }
  return "";
}

export function isDdsDataObject(data: DataObject): data is DdsDataObject {
  return data.settings.transforms_syntax === "dds";
}
