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
  const sat = new Satellite(universe, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition();
  const gpos = pos.clone();
  gpos.altitude = 0;
  const gstation = new GroundStation(universe, 'houston', gpos);
  expect(gstation.angleTo(sat).elevation).toBeCloseTo(Math.PI / 2);
});

test('does ground station have line of sight to the satellite', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 'crypto1', testUtils.ISS_TLE[0],
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
  const sat = new Satellite(universe, 'crypto1', testUtils.ISS_TLE[0],
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
  universe.clock().advanceByMilliseconds(-30 * 60 * 1000);
  expect(gstation.hasLineOfSight(sat)).toBe(false);
  const nextWindow = gstation.nextTransmissionWindow(sat, 60 * 60);
  const secondsUntilWindow = (nextWindow - universe.clock().now()) / 1000;
  expect(secondsUntilWindow).toBeGreaterThan(0);
  expect(secondsUntilWindow).toBeLessThanOrEqual(30 * 60);
});

test('next transmission window when satellite is in view', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 'crypto1', testUtils.ISS_TLE[0],
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
  const sat = new Satellite(universe, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition();
  const gpos = pos.clone();
  gpos.altitude = 0;
  const gstation = new GroundStation(universe, 'houston', gpos);
  expect(gstation.hasLineOfSight(sat)).toBe(true);
  universe.clock().advanceByMilliseconds(-30 * 60 * 1000);
  expect(gstation.hasLineOfSight(sat)).toBe(false);
  expect(gstation.nextTransmissionWindow(sat, 15 * 60)).toBe(null);
});


test('serialize and deserialize', () => {
  const universe1 = testUtils.createTestUniverse();
  const universe2 = testUtils.createTestUniverse();
  const gstation = new GroundStation(universe1, 'houston',
      new GeoCoordinates(1, 2, 3));
  expect(GroundStation.deserialize(universe2, gstation.serialize())).toEqual(
      gstation);
});

