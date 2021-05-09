Clock = require('./clock.js');

/**
 * Class representing a live clock. This clock is designed for
 * tracking the state of a deployed system. where knowledge of the actual
 * positions of celestial objects is desired. Note that all date objects
 * are in UTC time but are displayed in local timezone.
 */
class RealClock extends Clock {
  /**
   * @return {Date} the current time.
   */
  now() {
    return new Date();
  }
}

module.exports = RealClock;
