/* eslint no-unused-vars:0 */
export default function ({Plugin, types: t}) {

  // is `class extends React.Component`?
  function isReactClass(node) {
    var superClass = node.superClass;
    return (
      superClass &&
      superClass.type === 'MemberExpression' &&
      superClass.object.name === 'React' &&
      superClass.property.name === 'Component'
    );
  }

  // is `this.props`?
  function isThisProps(node) {
    return (
      node.object.type === 'ThisExpression' &&
      node.property.name === 'props'
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

  function getClassName(node) {
    return node.id.name;
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
            if (node.key.name === 'render') {
              renderMethod = node;
            } else {
              isPure = false;
            }
          }
        });

        if (!isPure) {
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
        const body = renderMethod.value.body;

        return buildPureComponentFunction(
          className,
          body
        );
      }
    }
  });
}
