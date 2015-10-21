# babel-plugin-react-pure-components

Optimize React code by making pure classes into functions

## Installation

```sh
$ npm install babel-plugin-react-pure-components
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["react-pure-components"]
}
```

### Via CLI

```sh
$ babel --plugins react-pure-components script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["react-pure-components"]
});
```
