import React from 'react';


class Console extends React.Component {
  constructor(props) {
    super(props);
    this.console = React.createRef();
    this.commandLine = React.createRef();
    this.state = {
      history: [],
      content: "",
    };
  }

  handleKeyPres(event) {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    const content = event.currentTarget.textContent;
    // This is a stub. replace it with the output of a CLI command parser.
    // The CLI command parser should live in a separate class and expose an API that takes a
    // string command and outputs a string response.
    const tokens = content.split(' ');
    const command = tokens[0];
    var response = 'command not found: ' + command;
    if (command === 'echo') {
      response = tokens.slice(1).join(' ');
    }
    event.currentTarget.textContent = "";
    this.setState({
      history: [...this.state.history, [content, response]],
    });
  }

  focus() {
    var left = this.console.current.scrollLeft;
    var top = this.console.current.scrollTop;
    this.commandLine.current.focus({'preventScroll': true});
  }

  render() {
    return (
        <div ref={this.console} id="console" onClick={this.focus.bind(this)}>
          {this.props.children}
          {this.state.history.map(function(item, i){
            return <span key={i}>{'> ' + item[0]}<p>{item[1]}</p></span>
          })}
          >&nbsp;
          <span ref={this.commandLine} id='commandline' contentEditable="true" onKeyPress={this.handleKeyPres.bind(this)}></span>
        </div>
    );
  }

  componentDidUpdate() {
    var el = this.console.current;
    el.scrollTop = el.scrollHeight;
  }
}

export default Console;