const GroundStation = require('./groundStation');
const Satellite = require('./satellite');
const testUtils = require('./testUtils');


test('construct a GroundStation object', () => {
  const universe = testUtils.createTestUniverse();
  const pos = new GeoCoordinates(1, 2, 3);
  const gstation = new GroundStation(universe, 'houston', pos);
  expect(gstation.id()).toEqual('houston');
  expect(gstation.position()).toEqual(pos);
  expect(gstation.universe()).toBe(universe);
});

test('angle between ground station and satellite', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 1, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition();
  const gpos = pos.clone();
  gpos.altitude = 0;
  const gstation = new GroundStation(universe, 'houston', gpos);
  expect(gstation.angleTo(sat).elevation).toBeCloseTo(Math.PI / 2);
});

test('angle between ground station and satellite position', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 1, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const gpos = sat.getPosition();
  gpos.altitude = 0;
  const gstation = new GroundStation(universe, 'houston', gpos);
  universe.clock().advance(15 * 60 * 1000);
  const spos = sat.getPosition();
  const satAngle = gstation.angleTo(sat);
  const posAngle = gstation.angleToPosition(spos);
  expect(satAngle.azimuth).toBeCloseTo(posAngle.azimuth, 5);
  expect(satAngle.elevation).toBeCloseTo(posAngle.elevation, 5);
  expect(satAngle.distance).toBeCloseTo(posAngle.distance, 5);
});

test('does ground station have line of sight to the satellite', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 1, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition();
  const gpos = pos.clone();
  gpos.altitude = 0;
  const gstation1 = new GroundStation(universe, 'houston', gpos);
  expect(gstation1.hasLineOfSight(sat)).toBe(true);
  gpos.longitude = (gpos.longitude + 360) % 180 - 180;
  const gstation2 = new GroundStation(universe, 'beijing', gpos);
  expect(gstation2.hasLineOfSight(sat)).toBe(false);
});

test('next transmission window', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 1, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition();
  const gpos = pos.clone();
  gpos.altitude = 0;
  const gstation = new GroundStation(universe, 'houston', gpos);
  // shift the clock 30 minutes backward and verify that the satellite isn't
  // visible to the ground station at this point in time. This way are
  // guaranteed that in at most 30 minutes the ground station will eventually
  // have a line of sight.
  expect(gstation.hasLineOfSight(sat)).toBe(true);
  universe.clock().advance(-30 * 60 * 1000);
  expect(gstation.hasLineOfSight(sat)).toBe(false);
  const nextWindow = gstation.nextTransmissionWindow(sat, 60 * 60);
  const secondsUntilWindow = (nextWindow - universe.clock().now()) / 1000;
  expect(secondsUntilWindow).toBeGreaterThan(0);
  expect(secondsUntilWindow).toBeLessThanOrEqual(30 * 60);
});

test('next transmission window when satellite is in view', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 1, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition();
  const gpos = pos.clone();
  gpos.altitude = 0;
  const gstation = new GroundStation(universe, 'houston', gpos);
  expect(gstation.hasLineOfSight(sat)).toBe(true);
  const nextWindow = gstation.nextTransmissionWindow(sat, 60 * 60);
  expect(nextWindow).toEqual(universe.clock().now());
});

test('next transmission window within time bounds', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 1, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition();
  const gpos = pos.clone();
  gpos.altitude = 0;
  const gstation = new GroundStation(universe, 'houston', gpos);
  expect(gstation.hasLineOfSight(sat)).toBe(true);
  universe.clock().advance(-30 * 60 * 1000);
  expect(gstation.hasLineOfSight(sat)).toBe(false);
  expect(gstation.nextTransmissionWindow(sat, 15 * 60)).toBe(null);
});

test('last transmission window', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 1, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition();
  const gpos = pos.clone();
  gpos.altitude = 0;
  const gstation = new GroundStation(universe, 'houston', gpos);
  // shift the clock 30 minutes forward and verify that the satellite isn't
  // visible to the ground station at this point in time. This way are
  // guaranteed that in the last 30 minutes the ground station will have had
  // a line of sight to the satellite.
  expect(gstation.hasLineOfSight(sat)).toBe(true);
  universe.clock().advance(30 * 60 * 1000);
  expect(gstation.hasLineOfSight(sat)).toBe(false);
  const lastWindow = gstation.lastTransmissionWindow(sat, 60 * 60);
  const secondsSinceWindow = (universe.clock().now() - lastWindow) / 1000;
  expect(secondsSinceWindow).toBeGreaterThan(0);
  expect(secondsSinceWindow).toBeLessThanOrEqual(30 * 60);
});

test('last transmission window when satellite is in view', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 1, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition();
  const gpos = pos.clone();
  gpos.altitude = 0;
  const gstation = new GroundStation(universe, 'houston', gpos);
  expect(gstation.hasLineOfSight(sat)).toBe(true);
  const lastWindow = gstation.nextTransmissionWindow(sat, 60 * 60);
  expect(lastWindow).toEqual(universe.clock().now());
});

test('last transmission window within time bounds', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 1, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition();
  const gpos = pos.clone();
  gpos.altitude = 0;
  const gstation = new GroundStation(universe, 'houston', gpos);
  expect(gstation.hasLineOfSight(sat)).toBe(true);
  universe.clock().advance(30 * 60 * 1000);
  expect(gstation.hasLineOfSight(sat)).toBe(false);
  expect(gstation.lastTransmissionWindow(sat, 15 * 60)).toBe(null);
});

test('serialize and deserialize', () => {
  const universe1 = testUtils.createTestUniverse();
  const universe2 = testUtils.createTestUniverse();
  const gstation = new GroundStation(universe1, 'houston',
      new GeoCoordinates(1, 2, 3));
  expect(GroundStation.deserialize(universe2, gstation.serialize())).toEqual(
      gstation);
});

test('listen to messages', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 1, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition();
  const gpos = pos.clone();
  gpos.altitude = 0;
  const gstation = new GroundStation(universe, 'houston', gpos);
  let receivedMessage = null;
  let stationId = null;
  gstation.startListening((sid, msg) => {
    receivedMessage = msg;
    stationId = sid;
  });
  universe.transmitFromSatellite(sat, 'hello');
  expect(receivedMessage).toBe(null);
  expect(stationId).toEqual(null);
  universe.clock().advance(1);
  expect(receivedMessage).toEqual('hello');
  expect(stationId).toEqual('houston');
});

test('stop listening to messages', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 1, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition();
  const gpos = pos.clone();
  gpos.altitude = 0;
  const gstation = new GroundStation(universe, 'houston', gpos);
  let x = 1;
  const listenId = gstation.startListening((msg) => {
    x += 1;
  });
  universe.transmitFromSatellite(sat, 'msg1');
  universe.clock().advance(1);
  expect(x).toEqual(2);
  universe.transmitFromSatellite(sat, 'msg1');
  universe.clock().advance(1);
  expect(x).toEqual(3);
  gstation.stopListening(listenId);
  universe.transmitFromSatellite(sat, 'msg1');
  universe.clock().advance(1);
  expect(x).toEqual(3);
});

test('stop listening to messages after timeout', () => {
  const universe = testUtils.createTestUniverse();
  const gpos = new GeoCoordinates(1, 2, 3);
  const gstation = new GroundStation(universe, 'houston', gpos);
  let received = false;
  gstation.startListening((msg) => {
    received = true;
  }, 100);
  universe.clock().advance(200);
  gstation.receive('msg1');
  expect(received).toBe(false);
});

