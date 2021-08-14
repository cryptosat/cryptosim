const binary = require('./binary');

test('convert binary string to array buffer and back', () => {
  expect(binary.ab2str(binary.str2ab('abc'))).toEqual('abc');
});

test('convert base64 string into an array buffer and back ', () => {
  expect(binary.ab2ascii(binary.ascii2ab(btoa('hello')))).toEqual(
      btoa('hello'));
});

test('append buffers', () => {
  const b1 = binary.str2ab('abc');
  const b2 = binary.str2ab('def');
  expect(binary.ab2str(binary.appendBuffers(b1, b2))).toEqual('abcdef');
});

test('convert a little-endian integer into array buffer and back', () => {
  const endinaness = binary.Endianess.LITTLE;
  expect(binary.ab2int(
      binary.int2ab(12345, endinaness), endinaness)).toEqual(12345);
});

test('convert a little-endian integer into array buffer and back', () => {
  const endinaness = binary.Endianess.BIG;
  expect(binary.ab2int(
      binary.int2ab(12345, endinaness), endinaness)).toEqual(12345);
});
