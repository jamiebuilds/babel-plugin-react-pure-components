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
    return node.value.body;
  }

  return new Plugin('react-pure-components', {
    visitor: {
      ClassDeclaration(node, path) {
        if (!isReactClass(node)) {
          // yo, fuck this class then.
          return;
        }

        let renderMethod;
        let isPure = true;

        // get the render method and make sure it doesn't have any other methods
        this.traverse({
          MethodDefinition(node) {
            if (getMethodName(node) === 'render') {
              renderMethod = node;
            } else {
              isPure = false;
            }
          },
          MemberExpression(node) {
            if (isThisNotProps(node)) {
              isPure = false;
            }
          }
        });

        if (!isPure || !renderMethod) {
          // fuck this class too.
          return;
        }

        // this.props => props
        this.traverse({
          MemberExpression(node) {
            if (isThisProps(node)) {
              return t.identifier('props');
            }
          }
        });

        // replace with a function
        const className = getClassName(node);
        const body = getMethodBody(renderMethod);

        return buildPureComponentFunction(
          className,
          body
        );
      }
    }
  });
}
