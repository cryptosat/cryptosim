import worldGraphic from './world.png'
import satelliteGraphic from './satellite.png'
import React from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.css'


// mapboxgl.accessToken = Config.mapboxglAccessToken;
mapboxgl.accessToken =
  'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';



// Explore this library: https://github.com/Flowm/satvis/
class WorldMap extends React.Component {

  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.mapContainer = React.createRef();
    this.state = { width: 0, height: 0, start: Date.now(), elapsed: 0,
                   worldImageReady: false, satelliteImageReady: false,
                   lng: 5, lat: 34, zoom: 1};
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.worldImage = new Image();
    this.worldImage.src = worldGraphic;
    this.worldImageScale = 0.5;
    this.satelliteImage = new Image();
    this.satelliteImage.src = satelliteGraphic;
  }

  componentDidMount() {
    // this.updateWindowDimensions();

  const map = new mapboxgl.Map({
    container: this.mapContainer.current,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [this.state.lng, this.state.lat],
    zoom: this.state.zoom
  });

  map.on('load', function () {
    map.resize();
  });


    // window.addEventListener('resize', this.updateWindowDimensions);
    // this.timer = setInterval(() => {
    //   this.setState({elapsedSeconds: (Date.now() - this.state.start) / 1000});
    //   this.draw();
    // }, 0.25);
    // this.worldImage.addEventListener('load', function() {
    //   this.setState({'worldImageReady': true});
    // }.bind(this), false);
    // this.satelliteImage.addEventListener('load', function() {
    //   this.setState({'satelliteImageReady': true});
    // }.bind(this), false);
  }

  draw() {
    const canvas = this.canvas.current;
    if (!canvas || !this.state.worldImageReady || !this.state.satelliteImageReady) return; // not loaaded
    const ctx = canvas.getContext('2d');
    const Tsec = 10;
    const width = this.worldImage.naturalWidth * this.worldImageScale; // canvas.width;
    const height = this.worldImage.naturalHeight * this.worldImageScale;  // canvas.height;
    const satelliteWidth = 100;
    const satelliteHeight = 100;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(this.worldImage, 0, 0, width, height);
    ctx.beginPath();
    ctx.lineWidth = "2";
    ctx.strokeStyle = 'rgb(70, 70, 70)';
    const T = width;
    const scaleY = height / 8;
    const offsetY = height / 3;
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

    const textOffset = 50;
    const textSpacing = 12;
    const longitude = satellitePathFraction * 360 - 180;
    const latitude = -Math.sin(satelliteAngle) * 45;
    const altitude = 768000 + Math.random() * 1000 - 500;
    ctx.fillText("Longitude: " + longitude, 10, height - textOffset);
    ctx.fillText("Latitude: " + latitude, 10, height - textOffset + textSpacing);
    ctx.fillText("Altitude: " + altitude, 10, height - textOffset + 2 * textSpacing);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }
  
  render() {
    return(
      <div ref={this.mapContainer} className='map-container' />
      )
      {/*<div id='worldmap'>
        <div className='sidebarStyle'>
          <div>Longitude: {this.state.lng} | Latitude: {this.state.lat} | Zoom: {this.state.zoom}</div>
        </div>
        <canvas ref={this.canvas} width={this.state.width / 2} height={this.state.height}/>
      </div>*/}
  }
}

export default WorldMap

