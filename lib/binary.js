
/**
 * Converts an array buffer into a binary string
 * @param {Uint8Array} b - an array buffer
 * @return {String} - a binary representation of the array buffer
 */
module.exports.ab2str = function(b) {
  return String.fromCharCode.apply(null, b);
};

/**
 * Converts a binary string into an array buffer
 * @param {String} s - a binary string
 * @return {Uint8Array} - an array buffer repesentation of the string.
 */
module.exports.str2ab = function(s) {
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) {
    b[i] = s.charCodeAt(i);
  }
  return b;
};

/**
 * Creates a new Uint8Array based on two different ArrayBuffers
 * @param {Uint8Array} b1 - The first buffer.
 * @param {Uint8Array} b2 - The second buffer.
 * @return {Uint8Array} The new buffer created by merging the two.
 */
module.exports.appendBuffers = function(b1, b2) {
  const c = new Uint8Array(b1.length + b2.length);
  c.set(b1, 0);
  c.set(b2, b1.length);
  return c;
};
