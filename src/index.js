/* eslint no-unused-vars:0 */
export default function ({Plugin, types: t}) {

  // is `class extends React.Component`?
  function isReactClass(node) {
    const superClass = node.superClass;
    return (
      t.isMemberExpression(superClass) &&
      t.isIdentifier(superClass.object, { name: 'React' }) &&
      t.isIdentifier(superClass.property, { name: 'Component' })
    );
  }

  // is `this.*` other than `props`?
  function isThisNotProps(node) {
    return (
      t.isThisExpression(node.object) &&
      !t.isIdentifier(node.property, { name: 'props' })
    );
  }

  // is `this.props`?
  function isThisProps(node) {
    return (
      t.isThisExpression(node.object) &&
      t.isIdentifier(node.property, { name: 'props' })
    );
  }

  // function <name>(props) <body>
  function buildPureComponentFunction(name, body) {
    return t.functionDeclaration(
      t.identifier(name),
      [t.identifier('props')],
      body
    );
  }

  function getMethodName(node) {
    return node.key.name;
  }

  function getClassName(node) {
    return node.id.name;
  }

  function getMethodBody(node) {
    return node.body;
  }

  return {
    visitor: {
      ClassDeclaration(path) {
        if (!isReactClass(path.node)) {
          // yo, fuck this class then.
          return;
        }

        let renderMethod;
        let isPure = true;

        // get the render method and make sure it doesn't have any other methods
        path.traverse({
          ClassMethod(path) {
            if (getMethodName(path.node) === 'render') {
              renderMethod = path.node;
            } else {
              isPure = false;
            }
          },
          MemberExpression(path) {
            if (isThisNotProps(path.node)) {
              isPure = false;
            }
          }
        });

        if (!isPure || !renderMethod) {
          // fuck this class too.
          return;
        }

        // this.props => props
        path.traverse({
          MemberExpression(path) {
            if (isThisProps(path.node)) {
              path.replaceWith(t.identifier('props'));
            }
          }
        });

        // replace with a function
        const className = getClassName(path.node);
        const body = getMethodBody(renderMethod);

        path.replaceWith(
          buildPureComponentFunction(
            className,
            body
          )
        );
      }
    }
  };
}
