const SimulatedClock = require('./clocks/simulatedClock');
const Universe = require('./universe');


test('universe clock', () => {
  const clock = new SimulatedClock(new Date(2020, 1, 1, 0, 0, 0, 0));
  const universe = new Universe(clock);
  expect(universe.clock()).toBe(clock);
});
