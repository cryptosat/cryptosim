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
 * a variable `cummulativeElapsedMilliseconds` which stores the total number
 * of simulated time that elapsed. Whenever the clock is paused the elapsed
 * time based on the first method is computed and rolled into the second method.
 */
class SimulatedClock extends Clock {
  #isPlaying = false;
  #playSpeed = 1;
  #startDate = null;
  #cummulativeElapsedMilliseconds = 0;
  #lastPlayedTime = null;

  /**
   * Construct a simulated clock object. The clock starts out paused.
   * @param {Date} startDate - the date the simulated clock will start
   *        counting from.
   */
  constructor(startDate) {
    super();
    this.setDate(startDate);
    this.#isPlaying = false;
    this.#playSpeed = 1;
  }

  /**
   * Reset the date of the simulated clock to given date.
   * @param {Date} date - the date the simulated clock will be set to.
   */
  setDate(date) {
    this.#startDate = date;
    this.#cummulativeElapsedMilliseconds = 0;
    this.#lastPlayedTime = new Date();
  }

  /**
   * Jump forward in time by a specified amount.
   * @param {Number} milliseconds - the number of milliseconds to advance the
   *        clock by.
   */
  advanceByMilliseconds(milliseconds) {
    this.#pauseAndMaybeResumeAfter(() => {
      this.#cummulativeElapsedMilliseconds += milliseconds;
    });
  }

  /**
   * Sets the playing speed of the clock with respect to real time.
   * @param {Number} speed - how fast to play the clock. A value of 2 will
   *        play the clock at double speed. A value of 0.5 will play at half
   *        speed.
   */
  setSpeed(speed) {
    if (speed < 0) {
      throw new Error('Speed must be positive. ' +
                      'Rewinding clocks is not supported.');
    }
    this.#pauseAndMaybeResumeAfter(() => {
      this.#playSpeed = speed;
    });
  }

  /**
   * @return {Number} the speed at which the clock is advancing with respect
   *          to real time.
   */
  getSpeed() {
    return this.#playSpeed;
  }

  /**
   * Start or resume the clock.
   */
  play() {
    if (this.#isPlaying) return;
    this.#isPlaying = true;
    this.#lastPlayedTime = new Date();
  }

  /**
   * Pause the operation of the clock.
   */
  pause() {
    if (!this.#isPlaying) return;
    this.#isPlaying = false;
    this.#cummulativeElapsedMilliseconds +=
      this.#elapsedMillisecondsSincePlay();
  }

  /**
   * @return {boolean} whether the clock is currently playing. a `false` value
   *          indicates the clock is currently paused.
   */
  isPlaying() {
    return this.#isPlaying;
  }


  /**
   * Returns the current value of the simulated time.
   * @return {Date} a representation of the current time.
   */
  now() {
    let totalMillisecondsElapsed = this.#cummulativeElapsedMilliseconds;
    if (this.#isPlaying) {
      totalMillisecondsElapsed += this.#elapsedMillisecondsSincePlay();
    }
    const d = new Date(this.#startDate);
    d.setMilliseconds(d.getMilliseconds() + totalMillisecondsElapsed);
    return d;
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
    const wasPlaying = this.#isPlaying;
    this.pause();
    f();
    if (wasPlaying) {
      this.play();
    }
  }

  /**
   * @return {Number} the number of simulated milliseconds elapsed since the
   *          clock was last played/resumed
   */
  #elapsedMillisecondsSincePlay() {
    const currentTime = new Date();
    return (currentTime - this.#lastPlayedTime) * this.#playSpeed;
  }
}

module.exports = SimulatedClock;
