import { promises as fs } from "fs";
import { join, relative } from "path";

import textExtensions from "./text-extensions.mjs";
import nonTextExtensions from "./non-text-extensions.mjs";

const isTextFile = (fileName) => {
  return textExtensions.some((ext) => fileName.toLowerCase().endsWith(ext));
};

const isNonTextFile = (fileName) => {
  return nonTextExtensions.some((ext) => fileName.toLowerCase().endsWith(ext));
};

const readFileContent = async (filePath, transform) => {
  const content = await fs.readFile(filePath);
  return transform(filePath, content);
};

const processDirectory = async (dirPath, basePath = dirPath, transform) => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const result = {};

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);

    if (entry.isDirectory()) {
      result[entry.name] = await processDirectory(
        fullPath,
        basePath,
        transform
      );
    } else {
      const content = await readFileContent(fullPath, transform);
      result[entry.name] = {
        data: content,
        modified: (await fs.stat(fullPath)).mtime,
      };
    }
  }

  return result;
};

export const manifestDirectory = (
  directoryPath,
  { transform: transformProto = "textApproveList" } = {}
) => {
  let transform;
  switch (transformProto) {
    case "textApproveList":
      transform = (filePath, content) => {
        return isTextFile(filePath)
          ? content.toString()
          : new Uint8Array(content);
      };
      break;
    case "textDenylist":
      transform = (filePath, content) => {
        return isNonTextFile(filePath)
          ? new Uint8Array(content)
          : content.toString();
      };
      break;
    case "binary":
      transform = (_, content) => {
        return new Uint8Array(content);
      };
      break;
    case "base64":
      transform = (_, content) => {
        return content.toString("base64");
      };
      break;
    default:
    case "utf8":
      transform = (_, content) => {
        return content.toString("utf8");
      };
      break;
  }
  try {
    return processDirectory(directoryPath, directoryPath, transform);
  } catch (error) {
    console.error("Error converting directory to manifest fs:", error);
    throw error;
  }
};

export default manifestDirectory;
