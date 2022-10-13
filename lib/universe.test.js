const SimulatedClock = require('./clocks/simulatedClock');
const Universe = require('./universe');
const Satellite = require('./satellite');
const GroundStation = require('./groundStation');
const testUtils = require('./testUtils');


test('universe clock', () => {
  const clock = new SimulatedClock(new Date(2020, 1, 1, 0, 0, 0, 0));
  const universe = new Universe(clock);
  expect(universe.clock()).toBe(clock);
});

test('clear stations', () => {
  const clock = new SimulatedClock(new Date(2020, 1, 1, 0, 0, 0, 0));
  const universe = new Universe(clock);
  new GroundStation(universe, 'houston', new GeoCoordinates(1, 2, 3));
  expect(universe.stations().size).toEqual(1);
  universe.clear();
  expect(universe.stations().size).toEqual(0);
});

test('clear satellites', () => {
  const clock = new SimulatedClock(new Date(2020, 1, 1, 0, 0, 0, 0));
  const universe = new Universe(clock);
  new Satellite(universe, 1, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  expect(universe.satellites().size).toEqual(1);
  universe.clear();
  expect(universe.satellites().size).toEqual(0);
});


test('serialize and deserialize', () => {
  const clock = new SimulatedClock(new Date(2020, 1, 1, 0, 0, 0, 0));
  const universe = new Universe(clock);
  new Satellite(universe, 1, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  new Satellite(universe, 1, 'crypto2', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  new GroundStation(universe, 'houston', new GeoCoordinates(1, 2, 3));
  new GroundStation(universe, 'london', new GeoCoordinates(4, 5, 6));
  expect(Universe.deserialize(universe.serialize())).toEqual(universe);
});
