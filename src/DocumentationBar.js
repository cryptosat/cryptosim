import React from 'react';


class DocumentationBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  renderTerminal(content, isCommand) {
    if (isCommand) {
      return <span className={'terminal'}>&nbsp;>&nbsp;{content}</span>
    } else {
      return <span className={'terminal'}>{content}</span>
    }
  }

  render() {
    return (
      <div id="documentation">
        <div id="documentation-content">
          <h1>Welcome to Cryptosat Tutorial</h1>
          <p>This tutorial will teach you how to communicate the Cryptosatellite Y2G-1.</p>
          <p>On the top right you will find a terminal interface that will allow to type commands to the satellite.
          On the bottom right is a visualization showing you the current position of the satellite.</p>
          <p>To get started type <code>status</code> into the terminal:</p>
          {this.renderTerminal('status', true)}
          <p> The output you receive will look something like this:</p>
          {this.renderTerminal('longitude: 123.1897\nlatitude: -75.12343')}
        </div>
        <div id="documentation-nav">
          <button>Previous</button>
          <button>Next</button>
        </div>
      </div>
    )
  }
}

export default DocumentationBar;
