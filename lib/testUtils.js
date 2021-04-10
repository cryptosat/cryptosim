const Universe = require('./universe');
const SimulatedClock = require('./clocks/simulatedClock');


exports.ISS_TLE = [
  '1 25544U 98067A   21027.77992426  .00003336  00000-0  68893-4 0  9991',
  '2 25544  51.6465 317.1909 0002399 302.6503 164.1536 15.48908950266831',
];

exports.createTestUniverse = function() {
  const clock = new SimulatedClock(new Date(2020, 1, 1, 0, 0, 0, 0));
  return new Universe(clock);
};

