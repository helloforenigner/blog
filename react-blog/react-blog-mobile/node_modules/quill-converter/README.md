# quill-converter [![NPM version](https://img.shields.io/npm/v/quill-converter.svg)](https://www.npmjs.com/package/quill-converter)
> Convert text/HTML to a Quill Delta or a Quill Delta to text/HTML

The purpose of this package is to assist in migrating to or from the [Quill editor](https://quilljs.com/).

## Installation
```
# Via NPM
npm install quill-converter --save

# Via Yarn
yarn add quill-converter
```

## Getting Started
### Convert a plain text string to a Quill delta:
```js
const { convertTextToDelta } = require('quill-converter');

let text = 'hello, world';
let delta = convertTextToDelta(text);

console.log(JSON.stringify(delta)); // {"ops":[{"insert":"hello, world\n"}]}
```

### Convert a Quill delta to a plain text string:
```js
const { convertDeltaToHtml } = require('quill-converter');

let text = convertDeltaToText(delta);

console.log(text) ; // 'hello, world'
```

### Convert a HTML string to a Quill delta:
```js
const { convertHtmlToDelta } = require('quill-converter');

let htmlString = '<p>hello, <strong>world</strong></p>';
let delta = convertHtmlToDelta(htmlString);

console.log(JSON.stringify(delta); // {"ops":[{"insert":"hello, "},{"insert":"world","attributes":{"bold":true}}]}
```

### Convert a Quill delta to an HTML string:
```js
const { convertDeltaToHtml } = require('quill-converter');

let html = convertDeltaToHtml(delta);

console.log(html) ; // '<p>hello, <strong>world</strong></p>'
```

Based on `node-quill-converter` by Joel Colucci
