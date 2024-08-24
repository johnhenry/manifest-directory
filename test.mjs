import { test } from 'node:test';
import assert from 'node:assert/strict';
import { manifestDirectory } from './index.mjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test('manifestDirectory function', async (t) => {
  await t.test('should process test-directory correctly with default transform', async () => {
    const testDirPath = join(__dirname, 'test-directory');
    const result = await manifestDirectory(testDirPath);

    assert.ok(result['index.html'], 'index.html should exist in the result');
    assert.ok(result['test.css'], 'test.css should exist in the result');
    assert.ok(result['test.mjs'], 'test.mjs should exist in the result');
    assert.ok(result['logo.jpeg'], 'logo.jpeg should exist in the result');

    assert.strictEqual(typeof result['index.html'].data, 'string', 'index.html content should be a string');
    assert.strictEqual(typeof result['test.css'].data, 'string', 'test.css content should be a string');
    assert.strictEqual(typeof result['test.mjs'].data, 'string', 'test.mjs content should be a string');
    assert.strictEqual(typeof result['logo.jpeg'].data, 'string', 'logo.jpeg content should be a string');
  });

  await t.test('should process test-directory correctly with "binary" transform', async () => {
    const testDirPath = join(__dirname, 'test-directory');
    const result = await manifestDirectory(testDirPath, 'binary');

    assert.ok(result['index.html'].data instanceof Uint8Array, 'index.html content should be a Uint8Array');
    assert.ok(result['test.css'].data instanceof Uint8Array, 'test.css content should be a Uint8Array');
    assert.ok(result['test.mjs'].data instanceof Uint8Array, 'test.mjs content should be a Uint8Array');
    assert.ok(result['logo.jpeg'].data instanceof Uint8Array, 'logo.jpeg content should be a Uint8Array');
  });

  await t.test('should process test-directory correctly with "base64" transform', async () => {
    const testDirPath = join(__dirname, 'test-directory');
    const result = await manifestDirectory(testDirPath, 'base64');

    assert.strictEqual(typeof result['index.html'].data, 'string', 'index.html content should be a base64 string');
    assert.strictEqual(typeof result['test.css'].data, 'string', 'test.css content should be a base64 string');
    assert.strictEqual(typeof result['test.mjs'].data, 'string', 'test.mjs content should be a base64 string');
    assert.strictEqual(typeof result['logo.jpeg'].data, 'string', 'logo.jpeg content should be a base64 string');
  });

  await t.test('should throw an error for non-existent directory', async () => {
    const nonExistentPath = join(__dirname, 'non-existent-directory');
    await assert.rejects(
      async () => await manifestDirectory(nonExistentPath),
      { name: 'Error' },
      'Should throw an error for non-existent directory'
    );
  });
});