module.exports = (function () {
  function Foo(props) {
    return <div />;
  }

  Foo.propTypes = {
    foo: React.PropTypes.string.isRequired
  };
  return Foo;
})();
