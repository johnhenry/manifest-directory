import { promises as fs } from "fs";
import { join, dirname } from "path";

const writeFileContent = async (filePath, content, transform) => {
  const transformedContent = transform(filePath, content);
  await fs.mkdir(dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, transformedContent);
};

const writeDirectory = async (dirPath, content, { transform, mode } = {}) => {
  for (const [name, value] of Object.entries(content)) {
    const fullPath = join(dirPath, name);

    if (
      typeof value === "object" &&
      value !== null &&
      !Buffer.isBuffer(value)
    ) {
      if ("data" in value && "modified" in value) {
        // This is a file with metadata
        await writeFileContent(fullPath, value.data, transform);
        await fs.utimes(fullPath, new Date(), new Date(value.modified));
      } else {
        // This is a directory
        await writeDirectory(fullPath, value, { transform, mode });
      }
    } else {
      // This is a file without metadata (direct content mode)
      await writeFileContent(fullPath, value, transform);
    }
  }
};

export const directoryManifested = async (
  targetPath,
  manifest,
  { transform: transformProto = "textApproveList", mode = "" } = {}
) => {
  let transform;
  switch (transformProto) {
    case "textApproveList":
    case "textDenylist":
    case "utf8":
    case "text":
      transform = (_, content) => {
        return typeof content === "string" ? content : Buffer.from(content);
      };
      break;
    case "binary":
      transform = (_, content) => {
        return Buffer.from(content);
      };
      break;
    case "base64":
      transform = (_, content) => {
        return Buffer.from(content, "base64");
      };
      break;
    default:
      throw new Error(`Unsupported transform type: ${transformProto}`);
  }

  return writeDirectory(targetPath, manifest, { transform, mode });
};

export default directoryManifested;
