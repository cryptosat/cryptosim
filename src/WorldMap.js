import graphic from './world.png'
import React from 'react';

class WorldMap extends React.Component {

  constructor(props) {
    super(props);
    this.canas = React.createRef();
    this.state = { width: 0, height: 0 };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }
  
  render() {
    console.log(this.state.height + ', ' + this.state.width);
    return(
      <div>
        <canvas ref={this.canva} width={this.state.width} height={this.state.height} style={{'background': 'url(' + graphic + ')'}} />
        <img style={{'width': this.state.width / 2, 'height': this.state.height}} src={graphic} alt='world map'/>
      </div>
    )
  }
}

export default WorldMap