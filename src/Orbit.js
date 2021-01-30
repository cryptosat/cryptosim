
import * as satellite from 'satellite.js/lib/index';

function propagateSatellite(satrec, date) {
  const positionAndVelocity = satellite.propagate(satrec, date);
  const positionEci = positionAndVelocity.position;
  const velocityEci = positionAndVelocity.velocity;
  const gmst = satellite.gstime(date);
  const positionGd = satellite.eciToGeodetic(positionEci, gmst);
  const longitudeRad = positionGd.longitude;
  const latitudeRad  = positionGd.latitude;
  const height    = positionGd.height;

  return {
    'longitude': satellite.degreesLong(longitudeRad),
    'latitude':  satellite.degreesLat(latitudeRad),
    'altitude': height,
  }
}

function angleToObserver(satrec, latitude, longitude, altitude, date) {
  const positionAndVelocity = satellite.propagate(this.satrec, date);
  const positionEci = positionAndVelocity.position;
  const observerGd = {
    longitude: satellite.degreesToRadians(longitude),
    latitude: satellite.degreesToRadians(latitude),
    height: altitude,
  };
  const lookAngles = satellite.eciToLookAngles(observerGd, positionEci);
  const azimuth = lookAngles.azimuth;
  const elevation = lookAngles.elevation;
  const rangeSat  = lookAngles.rangeSat;
  return {
    'azimuth': azimuth,
    'elevation': elevation,
    'rangeSat': rangeSat,
  }
}

function DidCrossLongitudeDiscontinuity(prev_lng, cur_lng, forward) {
  if (forward) {
    return cur_lng < 0 && prev_lng > 0;
  } else {
    return prev_lng < 0 &&  cur_lng > 0;
  }
}


class Orbit {
  constructor(tleLine1, tleLine2) {
    this.satrec = satellite.twoline2satrec(tleLine1, tleLine2);
  }

  getPosition(date) {
    // var date = new Date();
    return propagateSatellite(this.satrec, date);
  }

  angleToObserver(latitude, longitude, altitude, date) {
    return angleToObserver(this.satrec, latitude, longitude,
      altitude, date);
  }

  getTrajectory(date) {
    // this could be derived from the velocity in the satellite record.
    const time_interval_sec = 100;

    var d = new Date(date.getTime());
    var prev_position = this.getPosition(d);
    var past_path = [prev_position];
    while (true) {
      d.setSeconds(d.getSeconds() - time_interval_sec);
      var cur_position = this.getPosition(d);
      if (DidCrossLongitudeDiscontinuity(prev_position.longitude, cur_position.longitude, false)) {
        break;
      }
      past_path.push(cur_position);
      prev_position = cur_position;
    }
    past_path = past_path.reverse();

    d = new Date(date.getTime());
    prev_position = this.getPosition(d);
    var future_path = [prev_position];
    while(true) {
      d.setSeconds(d.getSeconds() + time_interval_sec);
      cur_position = this.getPosition(d);
      if (DidCrossLongitudeDiscontinuity(prev_position.longitude, cur_position.longitude, true)) {
        break;
      }
      future_path.push(cur_position);
      prev_position = cur_position;
    }
    return [past_path, future_path];
  }
}

export default Orbit
