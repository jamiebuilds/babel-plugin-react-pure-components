# babel-plugin-react-pure-components

Optimize React code by making pure classes into functions

> Note: Requires React v0.14 or higher.

## Example

In:

```js
class MyComponent extends React.Component {
  static propTypes = {
    className: React.PropTypes.string.isRequired
  };

  render() {
    return (
      <div className={this.props.className}>
        ...
      </div>
    );
  }
}
```

Out:

```js
function MyComponent(props) {
  return (
    <div className={props.className}>
      ...
    </div>
  );
}

MyComponent.propTypes = {
  className: React.PropTypes.string.isRequired
};
```

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
