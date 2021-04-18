const SimulatedClock = require('./simulatedClock.js');

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

test('simulated clock starts out at the given date', () => {
  const startDate = new Date(2020, 1, 1, 0, 0, 0, 0);
  const clock = new SimulatedClock(startDate);
  expect(clock.now()).toEqual(startDate);
});

test('set new date', async () => {
  const startDate = new Date(2020, 1, 1, 0, 0, 0, 0);
  const clock = new SimulatedClock(startDate);
  const newDate = new Date(2021, 2, 3, 4, 5, 6, 7);
  expect(clock.now()).not.toEqual(newDate);
  clock.setDate(newDate);
  expect(clock.now()).toEqual(newDate);
});

test('advance forward in time', async () => {
  const startDate = new Date(2020, 1, 1, 0, 0, 0, 0);
  const clock = new SimulatedClock(startDate);
  const date1 = clock.now();
  clock.advance(123);
  const date2 = clock.now();
  expect(date2 - date1).toEqual(123);
});

test('advance backwards in time', async () => {
  const startDate = new Date(2020, 1, 1, 0, 0, 0, 0);
  const clock = new SimulatedClock(startDate);
  const date1 = clock.now();
  clock.advance(-123);
  const date2 = clock.now();
  expect(date2 - date1).toEqual(-123);
});

test('invoke callbacks', async () => {
  const startDate = new Date(2020, 1, 1, 0, 0, 0, 0);
  const clock = new SimulatedClock(startDate);
  let x = 1;
  clock.callbackIn(100, () => {
    x += 1;
  });
  clock.callbackIn(110, () => {
    x += 2;
  });
  expect(x).toBe(1);
  clock.advance(100);
  expect(x).toBe(2);
  clock.advance(100);
  expect(x).toBe(4);
});

test('callback using callbackAt', async () => {
  const startDate = new Date(2020, 1, 1, 0, 0, 0, 0);
  const callbackDate = new Date(2020, 1, 2, 0, 0, 0, 0);
  const clock = new SimulatedClock(startDate);
  let x = 1;
  clock.callbackAt(callbackDate, () => {
    x = 2;
  });
  expect(x).toBe(1);
  clock.advance(24 * 60 * 60 * 1000);
  expect(x).toBe(2);
});

test('invoking callbacks works with setDate', async () => {
  const startDate = new Date(2020, 1, 1, 0, 0, 0, 0);
  const newDate = new Date(2020, 1, 2, 0, 0, 0, 0);
  const clock = new SimulatedClock(startDate);
  let x = 1;
  clock.callbackIn(60 * 60 * 1000, () => {
    x = 2;
  });
  expect(x).toBe(1);
  clock.setDate(newDate);
  expect(x).toBe(2);
});

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
  await sleep(20);
  clock.pause();
  await sleep(100);
  clock.play();
  await sleep(10);
  expect(clock.now() - startDate).toBeGreaterThanOrEqual(20 * 500);
  expect(clock.now() - startDate).toBeLessThanOrEqual(30 * 500);
});

test('advance clock when pausing before update occurs', async () => {
  const startDate = new Date(2020, 1, 1, 0, 0, 0, 0);
  const clock = new SimulatedClock(startDate);
  clock.setFramePeriod(50000);
  clock.play();
  await sleep(10);
  expect(clock.now()).toEqual(startDate);
  clock.pause();
  expect(clock.now()).not.toEqual(startDate);
});

test('advance without skipping callback artifiacts', () => {
  const startDate = new Date(2020, 1, 1, 0, 0, 0, 0);
  const clock = new SimulatedClock(startDate);
  let x = 0;
  clock.callbackIn(1, () => {
    x += 1;
    clock.callbackIn(1, () => {
      x += 1;
    });
  });
  clock.advance(10);
  expect(x).toEqual(2);
});

test('callbacks are called in order', () => {
  const startDate = new Date(2020, 1, 1, 0, 0, 0, 0);
  const clock = new SimulatedClock(startDate);
  const array = [];
  clock.callbackIn(3, () => {
    array.push(3);
  });
  clock.callbackIn(1, () => {
    array.push(1);
  });
  clock.callbackIn(2, () => {
    array.push(2);
  });
  clock.advance(10);
  expect(array).toEqual([1, 2, 3]);
});

