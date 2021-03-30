const GroundStation = require('./groundStation');
const Satellite = require('./satellite');
const SimulatedClock = require('./clocks/simulatedClock');
const testUtils = require('./testUtils');


test('construct a GroundStation object', () => {
  const pos = new GeoCoordinates(1, 2, 3);
  const gstation = new GroundStation('houston', pos);
  expect(gstation.getId()).toEqual('houston');
  expect(gstation.getPosition()).toEqual(pos);
});

test('angle between ground station and satellite', () => {
  const clock = new SimulatedClock(new Date(2020, 1, 1, 0, 0, 0, 0));
  const sat = new Satellite('crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition(clock);
  const gpos = pos.clone();
  gpos.altitude = 0;
  const gstation = new GroundStation('houston', gpos);
  expect(gstation.angleTo(clock, sat).elevation).toBeCloseTo(Math.PI / 2);
});

test('does ground station have line of sight to the satellite', () => {
  const clock = new SimulatedClock(new Date(2020, 1, 1, 0, 0, 0, 0));
  const sat = new Satellite('crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition(clock);
  const gpos = pos.clone();
  gpos.altitude = 0;
  const gstation1 = new GroundStation('houston', gpos);
  expect(gstation1.hasLineOfSight(clock, sat)).toBe(true);
  gpos.longitude = (gpos.longitude + 360) % 180 - 180;
  const gstation2 = new GroundStation('beijing', gpos);
  expect(gstation2.hasLineOfSight(clock, sat)).toBe(false);
});

test('serialize and deserialize', () => {
  const gstation = new GroundStation('houston', new GeoCoordinates(1, 2, 3));
  expect(GroundStation.deserialize(gstation.serialize())).toEqual(gstation);
});

