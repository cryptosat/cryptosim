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
    const command = event.currentTarget.textContent;
    // This is a stub. replace it with the output of a CLI command parser.
    // The CLI command parser should live in a separate class and expose an API that takes a
    // string command and outputs a string response.
    const response = 'command not found: ' + command.split(' ')[0];
    event.currentTarget.textContent = "";
    this.setState({
      history: [...this.state.history, ['> ' + command, response]],
      // content: this.state.content + '<p> >' + command + "</p>" + "<p>" + response + "</p>",
    });
  }

  render() {
    return (
        <div ref={this.console} id="console">
          {this.props.children}
          {this.state.history.map(function(item, i){
            return <span key={i} onFocus={console.log('hello')}>{item[0]}<p>{item[1]}</p></span>
          })}
          >&nbsp;
          <span ref={this.commandLine} id='commandline' contentEditable="true" onKeyPress={this.handleKeyPres.bind(this)}></span>
        </div>
    );
  }

  setFocus(event) {
    console.log(this.commandLine.current); // .focus();
  }

  componentDidUpdate() {
    var el = this.console.current;
    el.scrollTop = el.scrollHeight;
  }
}

export default Console;