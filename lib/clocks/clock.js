/**
 * Class representing a clock interface. The clock is the basic infrastructure
 * for the simulation. All motion of celestial bodies are synchronized through
 * time. The interface defines a single method `now()` that represents the
 * current time.
 */
class Clock {
  /**
   * Pure virtual construct preventing direct instantiation of a Clock object.
   */
  constructor() {
    if (this.constructor == Clock) {
      throw new Error('Clock is an abstract base class.');
    }
  }

  /**
   * Return a Date object representing the current time.
   */
  now() {
    throw new Error('Method \'now()\' must be implemented.');
  }
}

module.exports = Clock;
