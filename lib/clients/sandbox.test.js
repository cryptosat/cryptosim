const SandboxClient = require('./sandbox');
const nacl = require('tweetnacl');
const binary = require('../binary');

test('status', async () => {
  const sandboxClient = new SandboxClient();
  const result = await sandboxClient.status();
  expect(result.status).toEqual('ok');
});

test('getPublicSigningKey', async () => {
  const sandboxClient = new SandboxClient();
  const result = await sandboxClient.getPublicSigningKey();
  const hexPubKey = result.toString('hex');
  expect(hexPubKey).toEqual('3059301306072a8648ce3d020106082a8648ce3d' +
    '030107034200041ff07e4c1278cf56f5cd9bfb453c95fad1a3909a547fa7424695dd8c6' +
    '801720640d82ae6e2c38bbe8bc33aa866999e0358c3ddfdf64c1b676d37796e638040dd');
});

test('getTimestamp', async () => {
  const sandboxClient = new SandboxClient();
  const result = await sandboxClient.getTimestamp();
  console.log(result);
});

test('getPublicRandom', async () => {
  const sandboxClient = new SandboxClient();
  const result = await sandboxClient.getPublicRandom();
  console.log(result);
  // const publicKey = sandboxClient.getPublicSigningKey();
  // expect(
  //     nacl.sign.detached.verify(
  //         new Uint8Array(result.publicRandom),
  //         new Uint8Array(result.signature),
  //         new Uint8Array(publicKey)),
  // ).toBe(true);
});

test('sign', async () => {
  const client = new SandboxClient();
  const tracker = await client.sign('hello');
  expect(await tracker.status()).toBe('SENT');
  expect(await tracker.result()).toBe(null);
  await new Promise((resolve) => {
    setTimeout(resolve, 60000);
  });
  expect(await tracker.status()).toBe('READY');
  // const signature = '3045022100f1027984305298715de1bcfd390c20907af8d0297a77f9e908989ea949e4b67a02202013a2937af192a4a5480f17218824a4c6ba9b056f0b23c06f61648426c6764b';
  // const signatureArr = new Uint8Array(Buffer.from(signature, 'hex'));
  // expect(await tracker.result()).toBe(signatureArr);
}, 70000);


