# Manifest Directory

[![npm version](https://badge.fury.io/js/served-cold.svg)](https://badge.fury.io/js/manifest-directory)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<img alt="" width="512" height="512" src="./md.png" style="width:512px;height:512px"/>

Turns a directory of files into a dictionary of file contents.

## Installation

```bash
npm install manifest-directory
```

## Usage

```javascript
import manifestDirectory from "manifest-directory";
const data = await manifestDirectory("path/to/directory");
console.log(data);
```

### Transforming file contents

You can pass a function as the second argument to transform the file contents.
It receives the file path and the file content as arguments.

```javascript
import manifestDirectory from "manifest-directory";
const data = manifestDirectory("path/to/directory", {
  transform: (path, content) => {
    return content.toUpperCase();
  },
});
console.log(data);
```

#### Pre-defined transformations

You can use one of the pre-defined transformations by passing a string as the second argument.

```javascript
import manifestDirectory from "manifest-directory";
const data = manifestDirectory("path/to/directory", { transform: "binary" });
console.log(data);
```

Available transformations:

- `textAllowList` - If file matches a predefined list of extensions, returns the content as text. Otherwise, returns as Uint8Array.
- `textDenyList` - If file matches a predefined list of extensions, returns the content as Uint8Array. Otherwise, returns as text.
- `text` - Returns the content as text.
- `utf8` - Returns the content as utf8 text.
- `binary` - Returns the content as Uint8Array.
- `base64` - Returns the content as a base64 string.

### Modes

You can pass a `mode` as the third argument to change the behavior of the function.

- direct-content - Returns the content of the file directly.
  Suitable for applications like [ffs: the file fileystem](https://mgree.github.io/ffs/).

```javascript
import { writeFileSync } from "node:fs";
import manifestDirectory from "manifest-directory";
const data = manifestDirectory("path/to/directory", {
  transform: "string",
  mode: "direct-content",
});
writeFileSync("path/to/output.json", JSON.stringify(data, null, 2));
```

```shell
ffs path/to/output.json
cd /output
```

### Reverse Usage

Use `directoryManifested` to write the dictionary back to the filesystem.

```javascript
import { directoryManifested } from "manifest-directory";
const data = {
  "readme.md": "# hello\n",
};
directoryManifested("path/to/directory", data);
```
