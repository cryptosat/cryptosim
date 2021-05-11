Clock = require('./clock.js');

/**
 * Class representing a controllable clock used for simulation and testing.
 * The clock allows for playing forward at different speeds in time, pausing
 * and resuming, skipping forward to a preset date, etc.
 *
 * The simulated clock represents elapsed time in two ways. The first is the
 * a timestamp representing the last point in real time that the clock has
 * been played or resumed. This piece of date, when subtracted from the current
 * time and multiplied by the playing speed gives an indication of the
 * simulated time that has elapsed since the last play event. The second is
 * a variable `elapsedMilliseconds` which stores the total number
 * of simulated time that elapsed. Whenever the clock is paused the elapsed
 * time based on the first method is computed and rolled into the second method.
 */
class SimulatedClock extends Clock {
  #startDate = null;
  #elapsedMilliseconds = 0;
  #callbacks = [];
  #timerId = null;
  #framePeriodMilliseconds = 100; // 10Hz
  #playSpeed = 1;
  #lastAdvance = null;

  /**
   * Construct a simulated clock object. The clock starts out paused.
   * @param {Date} startDate - the date the simulated clock will start
   *        counting from.
   */
  constructor(startDate) {
    super();
    this.#startDate = startDate;
  }

  /**
   * Reset the date of the simulated clock to given date.
   * @param {Date} date - the date the simulated clock will be set to.
   */
  setDate(date) {
    const milliseconds = date - this.#startDate;
    this.advance(milliseconds);
  }

  /**
   * Jump forward or backward in time by a specified amount.
   * @param {Number} milliseconds - the number of milliseconds to advance the
   *        clock by. If the value is negative the clock will shift backwards
   *        in time.
   */
  advance(milliseconds) {
    const finalElapsedMilliseconds = this.#elapsedMilliseconds + milliseconds;
    while (true) {
      this.#callbacks.sort((a, b) => a.at - b.at);
      if (this.#callbacks.length == 0 ||
          this.#callbacks[0].at > finalElapsedMilliseconds) {
        break;
      }
      const c = this.#callbacks[0];
      this.#callbacks = this.#callbacks.slice(1);
      // Shift the clock to the exact time of the callback so that
      // 'clock.now()' will return the expected output when invoked from
      // during the callback.
      this.#elapsedMilliseconds = c.at;
      c.callback();
    }
    this.#elapsedMilliseconds = finalElapsedMilliseconds;
  }

  /**
   * Returns the current value of the simulated time.
   * @return {Date} a representation of the current time.
   */
  now() {
    const d = new Date(this.#startDate);
    d.setMilliseconds(d.getMilliseconds() +
        this.#elapsedMilliseconds);
    return d;
  }

  /**
   * Register a function to be called in a specified duration in the future.
   * @param {Number} milliseconds - the number of milliseconds in the future
   *         at which the callback will be invoked.
   * @param {function} callback - the callback to invoke.
   * @throw {Error} if milliseconds is non-positive.
   */
  callbackIn(milliseconds, callback) {
    if (milliseconds <= 0) {
      throw Error('callbacks must be issued in the future.');
    }
    this.#callbacks.push({
      'at': this.#elapsedMilliseconds + milliseconds,
      'callback': callback,
    });
  }

  /**
   * Register a function to be called when the clock reaches a certain date.
   * @param {Date} date - a date object at which to invoke the callback.
   * @param {function} callback - a callback to invoke.
   */
  callbackAt(date, callback) {
    const milliseconds = date - this.now();
    this.callbackIn(milliseconds, callback);
  }

  /**
   * Start or resume the clock.
   */
  play() {
    if (this.#timerId) return;
    this.#lastAdvance = new Date();
    this.#timerId = setInterval(() => {
      this.advance(this.#framePeriodMilliseconds * this.#playSpeed);
      this.#lastAdvance = new Date();
    }, this.#framePeriodMilliseconds);
  }

  /**
   * Pause the operation of the clock.
   */
  pause() {
    if (this.#timerId) {
      clearTimeout(this.#timerId);
      this.#timerId = null;
      const remaining = ((new Date()) - this.#lastAdvance) * this.#playSpeed;
      this.advance(remaining);
    }
  }

  /**
   * @return {boolean} whether the clock is currently playing. a `false` value
   *          indicates the clock is currently paused.
   */
  isPlaying() {
    return this.#timerId !== null;
  }

  /**
   * @return {Number} the playing speed with respect ot real time.
   */
  playSpeed() {
    return this.#playSpeed;
  }

  /**
   * Sets the playing speed of the clock with respect to real time.
   * @param {Number} speed - how fast to play the clock. A value of 2 will
   *        play the clock at double speed. A value of 0.5 will play at half
   *        speed.
   */
  setSpeed(speed) {
    this.#pauseAndMaybeResumeAfter(() => {
      this.#playSpeed = speed;
    });
  }

  /**
   * Sets the frame rate at which the clock will be updated.
   * @param {Number} periodMilliseconds - the interval, in milliseconds, at
   *        which the clock will be periodically updated.
   */
  setFramePeriod(periodMilliseconds) {
    this.#pauseAndMaybeResumeAfter(() => {
      this.#framePeriodMilliseconds = periodMilliseconds;
    });
  }

  /**
   * Private for modifying internal clock state.
   * Changing values of internal class variables often requires the clock to be
   * paused. This convenience wrapper takes a function of a desired changed and
   * performs after pausing the clock and potentially resuming it after the
   * change is complete.
   * @param {Function} f - an operation that needs to be performed on the
   *        internal clock representation.
   */
  #pauseAndMaybeResumeAfter(f) {
    const wasPlaying = this.isPlaying();
    this.pause();
    f();
    if (wasPlaying) {
      this.play();
    }
  }
}

module.exports = SimulatedClock;
