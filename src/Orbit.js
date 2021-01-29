
import * as satellite from 'satellite.js/lib/index';

class Orbit {
  constructor(tleLine1, tleLine2) {
    this.satrec = satellite.twoline2satrec(tleLine1, tleLine2);
  }

  getPosition(date) {
    // var date = new Date();
    const positionAndVelocity = satellite.propagate(this.satrec, date);
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

  angleToObserver(latitude, longitude, height, date) {
    const positionAndVelocity = satellite.propagate(this.satrec, date);
    const positionEci = positionAndVelocity.position;
    const observerGd = {
      longitude: satellite.degreesToRadians(longitude),
      latitude: satellite.degreesToRadians(latitude),
      height: height
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


}

export default Orbit