import worldGraphic from './world.png'
import satelliteGraphic from './satellite.png'
import React from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.css'
import Orbit from './Orbit.js' 


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
    this.canvas = React.createRef();
    this.mapContainer = React.createRef();
    var markerElement = document.createElement('div');
    markerElement.className = 'satellite-marker';
    this.satelliteMarker = new mapboxgl.Marker(markerElement);
    this.state = { width: 0, height: 0, start: Date.now(), elapsed: 0,
                   worldImageReady: false, satelliteImageReady: false,
                   lng: 5, lat: 34, zoom: 1};
    this.worldImage = new Image();
    this.worldImage.src = worldGraphic;
    this.worldImageScale = 0.5;
    this.satelliteImage = new Image();
    this.satelliteImage.src = satelliteGraphic;
  }

  componentDidMount() {
    const map = new mapboxgl.Map({
      container: this.mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom
    });

    var d = new Date();
    // d.setSeconds(d.getSeconds() + 3600 * 4);
    const coordinates = this.orbit.getPosition(d);
    const latlng = new mapboxgl.LngLat(
      coordinates.longitude,
      coordinates.latitude);
    map.on('load', function () {
      map.resize();
      this.satelliteMarker.setLngLat(latlng).addTo(map);
      var [past_trajectory, future_trajectory] = this.orbit.getTrajectory(d);
      past_trajectory = extractLatLngFromTrajectory(past_trajectory);
      future_trajectory = extractLatLngFromTrajectory(future_trajectory);
      map.addSource('past_route', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': past_trajectory,
          }
        }
      });

      map.addSource('future_route', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': future_trajectory,
          }
        }
      });

      map.addLayer({
          'id': 'past_route',
          'type': 'line',
          'source': 'past_route',
          'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#888',
          'line-width': 4,
          'line-opacity': 0.8,
        }
      });


      map.addLayer({
          'id': 'future_route',
          'type': 'line',
          'source': 'future_route',
          'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#888',
          'line-width': 4,
         'line-opacity': 0.25,
        }
      });
    }.bind(this));

    this.timer = setInterval(() => {
      this.setState({elapsedSeconds: (Date.now() - this.state.start) / 1000});
      // this.draw();
    }, 0.25);
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

