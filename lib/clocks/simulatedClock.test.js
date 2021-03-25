const SimulatedClock = require('./simulatedClock.js');

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

test('simulated clock starts out paused', () => {
  const startDate = new Date(2020, 1, 1, 0, 0, 0, 0);
  const clock = new SimulatedClock(startDate);
  expect(clock.isPlaying()).toBe(false);
  expect(clock.now()).toEqual(startDate);
});

test('pausing simulated clock', async () => {
  const startDate = new Date(2020, 1, 1, 0, 0, 0, 0);
  const clock = new SimulatedClock(startDate);
  clock.play();
  await sleep(100);
  clock.pause();
  const date = clock.now();
  expect(date - startDate).toBeGreaterThanOrEqual(100);
  await sleep(200);
  expect(clock.now()).toEqual(date);
});

test('playing simulated clock at faster speed', async () => {
  const startDate = new Date(2020, 1, 1, 0, 0, 0, 0);
  const clock = new SimulatedClock(startDate);
  clock.setSpeed(500);
  clock.play();
  await sleep(100);
  const date = clock.now();
  expect(date - startDate).toBeGreaterThanOrEqual(500 * 100);
  expect(date - startDate).toBeLessThanOrEqual(700 * 100);
});

test('faster playing speed persists after pause', async () => {
  const startDate = new Date(2020, 1, 1, 0, 0, 0, 0);
  const clock = new SimulatedClock(startDate);
  clock.setSpeed(500);
  clock.play();
  await sleep(10);
  clock.pause();
  await sleep(100);
  clock.play();
  await sleep(10);
  expect(clock.now() - startDate).toBeGreaterThanOrEqual(20 * 500);
  expect(clock.now() - startDate).toBeLessThanOrEqual(30 * 500);
});

test('set new date', async () => {
  const startDate = new Date(2020, 1, 1, 0, 0, 0, 0);
  const clock = new SimulatedClock(startDate);
  const newDate = new Date(2021, 2, 3, 4, 5, 6, 7);
  expect(clock.now()).not.toEqual(newDate);
  clock.setDate(newDate);
  expect(clock.now()).toEqual(newDate);
});

test('advance', async () => {
  const startDate = new Date(2020, 1, 1, 0, 0, 0, 0);
  const clock = new SimulatedClock(startDate);
  clock.play();
  await sleep(100);
  clock.pause();
  const date1 = clock.now();
  clock.advanceByMilliseconds(123);
  const date2 = clock.now();
  expect(date2 - date1).toEqual(123);
});
