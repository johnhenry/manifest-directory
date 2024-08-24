import { test } from "node:test";
import assert from "node:assert/strict";
import { manifestDirectory } from "./index.mjs";
import { join } from "path";

import logo from "./test.logo.mjs";
import theresWaldo from "theres-waldo";

const { dir: __dirname, file: __filename } = theresWaldo(import.meta.url);

const compareUint8Arrays = (arr1, arr2) => {
  // Check if both arguments are Uint8Array instances
  if (!(arr1 instanceof Uint8Array) || !(arr2 instanceof Uint8Array)) {
    throw new TypeError("Both arguments must be Uint8Array instances");
  }

  // Check if the arrays have the same length
  if (arr1.length !== arr2.length) {
    return false;
  }

  // Compare each element of the arrays
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  // If we've made it this far, the arrays are identical
  return true;
};

test("manifestDirectory function", async (t) => {
  // await setupTestFiles();
  await t.test(
    "should process test-directory correctly with default transform",
    async () => {
      const testDirPath = join(__dirname, "test-directory");
      const result = await manifestDirectory(testDirPath);

      assert.ok(result["index.html"], "index.html should exist in the result");
      assert.ok(result["test.css"], "test.css should exist in the result");
      assert.ok(result["test.mjs"], "test.mjs should exist in the result");
      assert.ok(result["logo.jpeg"], "logo.jpeg should exist in the result");

      assert.strictEqual(
        typeof result["index.html"].data,
        "string",
        "index.html content should be a string"
      );
      assert.strictEqual(
        typeof result["test.css"].data,
        "string",
        "test.css content should be a string"
      );
      assert.strictEqual(
        typeof result["test.mjs"].data,
        "string",
        "test.mjs content should be a string"
      );
      assert.strictEqual(
        typeof result["logo.jpeg"].data,
        "object",
        "logo.jpeg content should be a string"
      );

      assert.strictEqual(
        result["index.html"].data,
        "<html><body>Test HTML</body></html>",
        "index.html content should match"
      );
      assert.strictEqual(
        result["test.css"].data,
        "body { color: red; }",
        "test.css content should match"
      );
      assert.strictEqual(
        result["test.mjs"].data,
        'console.log("Test JavaScript");',
        "test.mjs content should match"
      );
      assert.ok(
        compareUint8Arrays(result["logo.jpeg"].data, logo),
        "logo.jpeg content should match"
      );
    }
  );

  await t.test("should throw an error for non-existent directory", async () => {
    const nonExistentPath = join(__dirname, "non-existent-directory");
    await assert.rejects(
      async () => await manifestDirectory(nonExistentPath),
      { name: "Error" },
      "Should throw an error for non-existent directory"
    );
  });
});
