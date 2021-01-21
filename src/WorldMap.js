import worldGraphic from './world.png'
import satelliteGraphic from './satellite.png'
import React from 'react';

class WorldMap extends React.Component {

  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.state = { width: 0, height: 0, start: Date.now(), elapsed: 0,
                   worldImageReady: false, satelliteImageReady: false };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.worldImage = new Image();
    this.worldImage.src = worldGraphic;
    this.satelliteImage = new Image();
    this.satelliteImage.src = satelliteGraphic;
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
    this.timer = setInterval(() => {
      this.setState({elapsedSeconds: (Date.now() - this.state.start) / 1000});
      this.draw();
    }, 0.25);
    this.worldImage.addEventListener('load', function() {
      this.setState({'worldImageReady': true});
    }.bind(this), false);
    this.satelliteImage.addEventListener('load', function() {
      this.setState({'satelliteImageReady': true});
    }.bind(this), false);
  }

  draw() {
    const canvas = this.canvas.current;
    if (!canvas || !this.state.worldImageReady || !this.state.satelliteImageReady) return; // not loaaded
    const ctx = canvas.getContext('2d');
    const Tsec = 60;
    const width = this.worldImage.naturalWidth; // canvas.width;
    const height = this.worldImage.naturalHeight;  // canvas.height;
    const satelliteWidth = 100;
    const satelliteHeight = 100;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(this.worldImage, 0, 0);
    ctx.beginPath();
    ctx.lineWidth = "2";
    ctx.strokeStyle = 'rgb(70, 70, 70)';
    const T = width;
    const scaleY = height / 8;
    const offsetY = height / 4;
    const phase = 0 / 180. * Math.PI;
    for (var t = 0; t < T; t++) {
      const angle = t / T * 2 * Math.PI + phase; 
      const x = t;
      const y =  offsetY + Math.sin(angle) * scaleY;
      if (t === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    const satellitePathFraction = (this.state.elapsedSeconds / Tsec) % 1;
    const satelliteAngle = satellitePathFraction * 2 * Math.PI + phase;
    const satelliteX = satellitePathFraction * T;
    const satelliteY = Math.sin(satelliteAngle) * scaleY + offsetY;
    // draw additional satellites at +/- period for smooth transition
    for (var i = -1; i <= 1; i++) {
      ctx.drawImage(this.satelliteImage, (i * T) + satelliteX - satelliteWidth / 2, satelliteY - satelliteHeight / 2, satelliteWidth, satelliteHeight);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }
  
  render() {
    return(
      <div>
        <canvas ref={this.canvas} width={this.state.width} height={this.state.height}/>
      </div>
    )
  }
}

export default WorldMap

