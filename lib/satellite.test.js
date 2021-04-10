const Satellite = require('./satellite');
const Orbit = require('./orbit');
const testUtils = require('./testUtils');


test('satellite construction', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  expect(sat.id()).toEqual('crypto1');
  expect(sat.universe()).toBe(universe);
});

test('satellite orbit', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const orbit = new Orbit(testUtils.ISS_TLE[0], testUtils.ISS_TLE[1]);
  expect(sat.orbit()).toEqual(orbit);
});

test('satellite returns orbit position', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 'crypto1',
      testUtils.ISS_TLE[0], testUtils.ISS_TLE[1]);
  const orbit = new Orbit(testUtils.ISS_TLE[0], testUtils.ISS_TLE[1]);
  const pos = orbit.getPosition(universe.clock());
  expect(sat.getPosition()).toEqual(pos);
});

test('serialize and deserialize', () => {
  const universe1 = testUtils.createTestUniverse();
  const universe2 = testUtils.createTestUniverse();
  const sat = new Satellite(universe1, 'crypto1',
      testUtils.ISS_TLE[0], testUtils.ISS_TLE[1]);
  expect(Satellite.deserialize(universe2, sat.serialize())).toEqual(sat);
});

