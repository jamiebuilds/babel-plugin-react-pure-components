module.exports = class Foo extends React.Component {
  static propTypes = {
    foo: React.PropTypes.string.isRequired
  };

  render() {
    return <div/>;
  }
};
