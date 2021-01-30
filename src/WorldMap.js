import worldGraphic from './world.png'
import satelliteGraphic from './satellite.png'
import React from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.css'
import Orbit from './Orbit.js' 
import PulsingDot from './PulsingDot';


// mapboxgl.accessToken = Config.mapboxglAccessToken;
mapboxgl.accessToken =
  'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

function extractLatLngFromTrajectory(t) {
  return t.map(pos => [pos.longitude, pos.latitude]);
}

// Explore this library: https://github.com/Flowm/satvis/
class WorldMap extends React.Component {

  constructor(props) {
    super(props);
    this.orbit = new Orbit(
      '1 25544U 98067A   21027.77992426  .00003336  00000-0  68893-4 0  9991',
      '2 25544  51.6465 317.1909 0002399 302.6503 164.1536 15.48908950266831');
    const d = new Date();
    const coordinates = this.orbit.getPosition(d);
    this.canvas = React.createRef();
    this.mapRef = React.createRef();
    var markerElement = document.createElement('div');
    markerElement.className = 'satellite-marker';
    this.satelliteMarker = new mapboxgl.Marker(markerElement);
    this.state = { width: 0, height: 0, start: Date.now(), elapsed: 0,
                   worldImageReady: false, satelliteImageReady: false,
                   lng: coordinates.longitude, lat: coordinates.latitude,
                   zoom: 1, playbackSpeed: 1,
                   isPlaying: true, initialTimestamp: new Date(),
                   elapsedSeconds: 0, lastTimestamp: new Date()};
    this.worldImage = new Image();
    this.worldImage.src = worldGraphic;
    this.worldImageScale = 0.5;
    this.satelliteImage = new Image();
    this.satelliteImage.src = satelliteGraphic;
  }


  animateSatellite() {
    const now = new Date();
    const lastTimestamp = this.state.lastTimestamp; 
    this.setState({lastTimestamp: now});
    if (!this.state.isPlaying) {
      requestAnimationFrame(this.animateSatellite.bind(this));
      return;
    }
    const additionalSeconds = (now - lastTimestamp) / 1000;
    const elapsedSeconds = this.state.elapsedSeconds + 
      additionalSeconds * this.state.playbackSpeed; 
    // console.log('elapsed: ' + elapsedMs / 1000);
    // console.log('timestamp: ' + timestamp / 1000);
     // + elapsedMs / 1000);
    this.setState({elapsedSeconds: elapsedSeconds});
    var d = new Date();
    d.setSeconds(this.state.initialTimestamp.getSeconds() + elapsedSeconds);
    const coordinates = this.orbit.getPosition(d);
    const latlng = new mapboxgl.LngLat(
      coordinates.longitude,
      coordinates.latitude);

    this.map.getSource('points').setData({
      'type': 'FeatureCollection',
      'features': [
        {
          'type': 'Feature',
          'geometry': {
          'type': 'Point',
          'coordinates': [coordinates.longitude, coordinates.latitude],
        }
      }]
    }); 

    // this.satelliteMarker.setLngLat(latlng).addTo(this.map);


    var [past_trajectory, future_trajectory] = this.orbit.getTrajectory(d);
    past_trajectory = extractLatLngFromTrajectory(past_trajectory);
    future_trajectory = extractLatLngFromTrajectory(future_trajectory);

    var past_source = this.map.getSource('past_route');
    past_source.setData({
      'type': 'Feature',
      'properties': {},
      'geometry': {
        'type': 'LineString',
        'coordinates': past_trajectory,
      }
    });
    var future_source = this.map.getSource('future_route');
    future_source.setData({
      'type': 'Feature',
      'properties': {},
      'geometry': {
        'type': 'LineString',
        'coordinates': future_trajectory,
      }
    });

    // Request the next frame of the animation.
    requestAnimationFrame(this.animateSatellite.bind(this));
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom
    });

    this.map.on('load', function () {
      this.map.resize();
      var d = new Date();
      this.map.addSource('past_route', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': [],
          }
        }
      });

      this.map.addSource('future_route', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': [],
          }
        }
      });

      this.map.addLayer({
          'id': 'past_route',
          'type': 'line',
          'source': 'past_route',
          'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#888',
          'line-width': 3,
          'line-opacity': 0.8,
        }
      });


      this.map.addLayer({
          'id': 'future_route',
          'type': 'line',
          'source': 'future_route',
          'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#888',
          'line-width': 3,
         'line-opacity': 0.25,
        }
      });

      this.map.addImage('pulsing-dot', new PulsingDot(100, this.map), { pixelRatio: 2 });

      this.map.addSource('points', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': [
            {
              'type': 'Feature',
              'geometry': {
                'type': 'Point',
                'coordinates': [0, 0]
              }
            }
          ]
        }
      });
    
      this.map.addLayer({
        'id': 'points',
        'type': 'symbol',
        'source': 'points',
        'layout': {
          'icon-image': 'pulsing-dot'
        }
      });

      // Start the animation.
      this.animateSatellite(0);
    }.bind(this));


    // this.timer = setInterval(() => {
    //   this.setState({elapsedSeconds: (Date.now() - this.state.start) / 1000});
    //   // this.draw();
    // }, 0.25);
    this.worldImage.addEventListener('load', function() {
      this.setState({'worldImageReady': true});
    }.bind(this), false);
    this.satelliteImage.addEventListener('load', function() {
      this.setState({'satelliteImageReady': true});
    }.bind(this), false);
  }

  // draw() {
  //   const canvas = this.canvas.current;
  //   if (!canvas || !this.state.worldImageReady || !this.state.satelliteImageReady) return; // not loaaded


  //   const ctx = canvas.getContext('2d');

  //   ctx.beginPath();
  //   ctx.lineWidth = "2";
  //   ctx.strokeStyle = 'rgb(70, 70, 70)';
  //   const T = width;
  //   const scaleY = height / 8;
  //   const offsetY = height / 3;
  //   const phase = 0 / 180. * Math.PI;
  //   for (var t = 0; t < T; t++) {
  //     const angle = t / T * 2 * Math.PI + phase; 
  //     const x = t;
  //     const y =  offsetY + Math.sin(angle) * scaleY;
  //     if (t === 0) {
  //       ctx.moveTo(x, y);
  //     } else {
  //       ctx.lineTo(x, y);
  //     }
  //   }
  //   ctx.stroke();
  //   const satellitePathFraction = (this.state.elapsedSeconds / Tsec) % 1;
  //   const satelliteAngle = satellitePathFraction * 2 * Math.PI + phase;
  //   const satelliteX = satellitePathFraction * T;
  //   const satelliteY = Math.sin(satelliteAngle) * scaleY + offsetY;
  //   // draw additional satellites at +/- period for smooth transition
  //   for (var i = -1; i <= 1; i++) {
  //     ctx.drawImage(this.satelliteImage, (i * T) + satelliteX - satelliteWidth / 2, satelliteY - satelliteHeight / 2, satelliteWidth, satelliteHeight);
  //   }

  //   const textOffset = 50;
  //   const textSpacing = 12;
  //   const longitude = satellitePathFraction * 360 - 180;
  //   const latitude = -Math.sin(satelliteAngle) * 45;
  //   const altitude = 768000 + Math.random() * 1000 - 500;
  //   ctx.fillText("Longitude: " + longitude, 10, height - textOffset);
  //   ctx.fillText("Latitude: " + latitude, 10, height - textOffset + textSpacing);
  //   ctx.fillText("Altitude: " + altitude, 10, height - textOffset + 2 * textSpacing);
  // }

  toggleSpeed(e) {
    var speed = this.state.playbackSpeed * 10;
    if (speed > 1000) {
      speed = 1;
    } 
    this.setState({'playbackSpeed': speed});
  }

  pausePlay(e) {
    this.setState({'isPlaying': !this.state.isPlaying});
  }


  render() {
    return(
      <div className='map-container'>
        <div className='map-toolbar'>
          <button onClick={this.toggleSpeed.bind(this)}>{this.state.playbackSpeed}x</button>
          <button onClick={this.pausePlay.bind(this)}>{this.state.isPlaying ? 'Pause' : 'Play' }</button>
        </div>
        <div ref={this.mapRef} style={{'height': '100%'}}/>
      </div>
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

