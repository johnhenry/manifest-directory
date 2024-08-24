import { test } from 'node:test';
import assert from 'node:assert/strict';
import { manifestDirectory } from './index.mjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const setupTestFiles = async () => {
  const testDirPath = join(__dirname, 'test-directory');
  await fs.writeFile(join(testDirPath, 'index.html'), '<html><body>Test HTML</body></html>');
  await fs.writeFile(join(testDirPath, 'test.css'), 'body { color: red; }');
  await fs.writeFile(join(testDirPath, 'test.mjs'), 'console.log("Test JavaScript");');
  await fs.writeFile(join(testDirPath, 'logo.jpeg'), Buffer.from([0xFF, 0xD8, 0xFF, 0xE0])); // JPEG magic numbers
};

test('manifestDirectory function', async (t) => {
  await setupTestFiles();
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

    assert.strictEqual(result['index.html'].data, '<html><body>Test HTML</body></html>', 'index.html content should match');
    assert.strictEqual(result['test.css'].data, 'body { color: red; }', 'test.css content should match');
    assert.strictEqual(result['test.mjs'].data, 'console.log("Test JavaScript");', 'test.mjs content should match');
    assert.strictEqual(result['logo.jpeg'].data, '\ufffd\ufffd\ufffd\ufffd', 'logo.jpeg content should match');
  });

  await t.test('should process test-directory correctly with "binary" transform', async () => {
    const testDirPath = join(__dirname, 'test-directory');
    const result = await manifestDirectory(testDirPath, 'binary');

    assert.ok(result['index.html'].data instanceof Uint8Array, 'index.html content should be a Uint8Array');
    assert.ok(result['test.css'].data instanceof Uint8Array, 'test.css content should be a Uint8Array');
    assert.ok(result['test.mjs'].data instanceof Uint8Array, 'test.mjs content should be a Uint8Array');
    assert.ok(result['logo.jpeg'].data instanceof Uint8Array, 'logo.jpeg content should be a Uint8Array');

    assert.deepStrictEqual(
      result['index.html'].data,
      new TextEncoder().encode('<html><body>Test HTML</body></html>'),
      'index.html binary content should match'
    );
    assert.deepStrictEqual(
      result['test.css'].data,
      new TextEncoder().encode('body { color: red; }'),
      'test.css binary content should match'
    );
    assert.deepStrictEqual(
      result['test.mjs'].data,
      new TextEncoder().encode('console.log("Test JavaScript");'),
      'test.mjs binary content should match'
    );
    assert.deepStrictEqual(
      result['logo.jpeg'].data,
      new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]),
      'logo.jpeg binary content should match'
    );
  });

  await t.test('should process test-directory correctly with "base64" transform', async () => {
    const testDirPath = join(__dirname, 'test-directory');
    const result = await manifestDirectory(testDirPath, 'base64');

    assert.strictEqual(typeof result['index.html'].data, 'string', 'index.html content should be a base64 string');
    assert.strictEqual(typeof result['test.css'].data, 'string', 'test.css content should be a base64 string');
    assert.strictEqual(typeof result['test.mjs'].data, 'string', 'test.mjs content should be a base64 string');
    assert.strictEqual(typeof result['logo.jpeg'].data, 'string', 'logo.jpeg content should be a base64 string');

    assert.strictEqual(
      result['index.html'].data,
      Buffer.from('<html><body>Test HTML</body></html>').toString('base64'),
      'index.html base64 content should match'
    );
    assert.strictEqual(
      result['test.css'].data,
      Buffer.from('body { color: red; }').toString('base64'),
      'test.css base64 content should match'
    );
    assert.strictEqual(
      result['test.mjs'].data,
      Buffer.from('console.log("Test JavaScript");').toString('base64'),
      'test.mjs base64 content should match'
    );
    assert.strictEqual(
      result['logo.jpeg'].data,
      Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]).toString('base64'),
      'logo.jpeg base64 content should match'
    );
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
