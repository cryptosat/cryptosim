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

test('serialize and deserialize', () => {
  const universe1 = testUtils.createTestUniverse();
  const universe2 = testUtils.createTestUniverse();
  const gstation = new GroundStation(universe1, 'houston',
      new GeoCoordinates(1, 2, 3));
  expect(GroundStation.deserialize(universe2, gstation.serialize())).toEqual(
      gstation);
});

