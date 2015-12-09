export default function ({ types: t }) {
  // is `class extends React.Component`?
  function isReactClass(node) {
    const superClass = node.superClass;
    return (
      t.isMemberExpression(superClass) &&
      t.isIdentifier(superClass.object, { name: 'React' }) &&
      t.isIdentifier(superClass.property, { name: 'Component' })
    );
  }

  const bodyVisitor = {
    ClassMethod(path) {
      if (path.node.key.name === 'render') {
        this.renderMethod = path.node;
      } else {
        this.isPure = false;
        path.stop();
      }
    },

    MemberExpression(path) {
      const { node } = path;

      // non-this member expressions dont matter
      if (!t.isThisExpression(node.object)) {
        return;
      }

      // Don't allow this.<anything other than props>
      if (!t.isIdentifier(node.property, { name: 'props' })) {
        this.isPure = false;
        path.stop();
        return;
      }

      // this.props.foo => props.foo
      path.replaceWith(t.identifier('props'));
    }
  };

  return {
    visitor: {
      ClassDeclaration(path) {
        if (!isReactClass(path.node)) {
          // yo, fuck this class then.
          return;
        }

        const state = {
          renderMethod: null,
          isPure: true
        };

        // get the render method and make sure it doesn't have any other methods
        path.traverse(bodyVisitor, state);

        if (!state.isPure || !state.renderMethod) {
          // fuck this class too.
          return;
        }

        path.replaceWith(
          t.functionDeclaration(
            t.identifier(path.node.id.name),
            [t.identifier('props')],
            state.renderMethod.body
          )
        );
      }
    }
  };
}
