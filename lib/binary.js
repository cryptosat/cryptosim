const Endianess = {
  LITTLE: 'little',
  BIG: 'big',
};

/**
 * Converts an array buffer into a binary string
 * @param {Uint8Array} b - an array buffer
 * @return {String} - a binary representation of the array buffer
 */
function ab2str(b) {
  return String.fromCharCode.apply(null, b);
};

/**
 * Converts a binary string into an array buffer
 * @param {String} s - a binary string
 * @return {Uint8Array} - an array buffer repesentation of the string.
 */
function str2ab(s) {
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
function appendBuffers(b1, b2) {
  const c = new Uint8Array(b1.length + b2.length);
  c.set(b1, 0);
  c.set(b2, b1.length);
  return c;
};


/**
 * Converts an ascii string into array buffer
 * @param {String} s - an ascii string encoded in base64
 * @return {Uint8Array} - an array buffer representation of the string
 */
function ascii2ab(s) {
  return str2ab(atob(s));
}


/**
 * Converts an array buffer into an ascii string
 * @param {Uint8Array} ab - an array buffer
 * @return {String} - a base64 encoding of the array buffer's contents.
 */
function ab2ascii(ab) {
  return btoa(ab2str(ab));
}


/**
 * Converts an integer into an array buffer
 * @param {Number} n - an integer
 * @param {String} endian - an enum representing the endianess of the integer.
 * @return {Uint8Array} - an array buffer representing the byte contents of
 *                        the integer.
 */
function int2ab(n, endian = Endianess.LITTLE) {
  const endianToIndex = endian == Endianess.LITTLE ? ((i) => i) : ((i) => 7 - i);
  const ab = new Uint8Array(8);
  let bigIntValue = BigInt(n);
  for (let i = 0; i < 8; i++) {
    ab[endianToIndex(i)] = Number(bigIntValue & BigInt(0xFF));
    bigIntValue = bigIntValue >> BigInt(8);
  }
  return ab;
}

/**
 * Converts an array buffer into an integer
 * @param {Uint8Array} ab - an array buffer representation of an integer.
 * @param {String} endian - an enum representing the endianess of the integer.
 *                        the integer.
 * @return {Number} - the number reconstructed from the contents of the
 *                    array buffer
 */
function ab2int(ab, endian = Endianess.LITTLE) {
  let n = 0;
  sequence = endian == Endianess.LITTLE ?
    Array.from({length: 8}, (_, i) => 7 - i) :
    Array.from({length: 8}, (_, i) => i);
  for (let i = 0; i < sequence.length - 1; i++) {
    n = n + ab[sequence[i]];
    n = n << 8;
  }
  n = n + ab[sequence[sequence.length - 1]];
  return n;
}

/**
 * Converts key in pem format to an array buffer
 * @param {string} pem - key in pem format
 * @return {Uint8Array} - array buffer
 */
function pem2ab(pem) {
  const lines = pem.split('\n');

  const encoded = lines.reduce((acc, line) => {
    if (line.trim().length > 0 &&
      line.indexOf('-----BEGIN') < 0 &&
      line.indexOf('-----END') < 0) {
      acc += line.trim();
    }
    return acc;
  }, '');

  const byteArray = ascii2ab(encoded);

  if (byteArray.length === 44) {
    // Slice off the first 12 bytes to get the 32-byte Ed25519 public key
    return byteArray.slice(12);
  }

  return byteArray;
}

/**
 * Converts hex string to an array buffer
 * @param {string} hex - hexadecimal string ex. b0809afb
 * @return {ArrayBufferLike}
 */
function hex2ab(hex) {
  const arr = hex.match(/[\da-f]{2}/gi).map(function(h) {
    return parseInt(h, 16);
  });
  return new Uint8Array(arr);
}

module.exports = {
  Endianess, ab2str, str2ab, appendBuffers, ascii2ab, ab2ascii,
  int2ab, ab2int, pem2ab, hex2ab,
};
