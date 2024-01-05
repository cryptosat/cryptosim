const SandboxClient = require('./sandbox');
const nacl = require('tweetnacl');
const binary = require('../binary');
// eslint-disable-next-line camelcase
const {encrypt_message} = require('@cryptosat/private-voting');
const {pem2ab} = require('../binary');

test('status', async () => {
  const sandboxClient = new SandboxClient();
  const result = await sandboxClient.status();
  expect(result.status).toEqual('ok');
});

test('getPublicSigningKey', async () => {
  const sandboxClient = new SandboxClient();
  const result = await sandboxClient.getPublicSigningKey();
  expect(result).toEqual(
    '-----BEGIN PUBLIC KEY-----\n' +
    'MCowBQYDK2VwAyEAsICa+3Pmr/2NikQqwZoPGfxjPgbS24lqGpA+f27oRbM=\n' +
    '-----END PUBLIC KEY-----'
  );
});

test('getTimestamp', async () => {
  const sandboxClient = new SandboxClient();
  const result = await sandboxClient.getTimestamp();
  const publicKey = await sandboxClient.getPublicSigningKey();
  expect(
    nacl.sign.detached.verify(
      binary.int2ab(result.timestamp),
      result.signature,
      pem2ab(publicKey)),
  ).toBe(true);
}, 10000);

test('getPublicRandom', async () => {
  const sandboxClient = new SandboxClient();
  const result = await sandboxClient.getPublicRandom();
  const publicKey = await sandboxClient.getPublicSigningKey();
  expect(
    nacl.sign.detached.verify(
      result.publicRandom,
      result.signature,
      pem2ab(publicKey)),
  ).toBe(true);
}, 10000);

test('sign', async () => {
  const client = new SandboxClient();
  const tracker = await client.sign('hello');
  expect(await tracker.status()).toBe('SENT');
  expect(await tracker.result()).toBe(null);

  await new Promise((resolve) => {
    setTimeout(resolve, 60000);
  });

  const publicKey = await client.getPublicSigningKey();
  expect(await tracker.status()).toBe('READY');
  const result = await tracker.result();
  expect(
    nacl.sign.detached.verify(
      binary.str2ab('hello'),
      result.signature,
      pem2ab(publicKey)),
  ).toBe(true);
}, 100000);

test('createDelayedKeypair', async () => {
  const client = new SandboxClient();
  const tracker = await client.createDelayedKeypair(10);

  expect(await tracker.status()).toBe('SENT');

  await new Promise((resolve) => {
    setTimeout(resolve, 120000);
  });

  expect(await tracker.status()).toBe('READY');
  const result = await tracker.result();
  expect(result.keypair_id).not.toBeNull();
  expect(result.public_key).not.toBeNull();
}, 200000);

test('fetchDelayedPubKey', async () => {
  const client = new SandboxClient();
  const keypairTracker = await client.createDelayedKeypair(10);

  await new Promise((resolve) => {
    setTimeout(resolve, 120000);
  });

  const result = await keypairTracker.result();
  const keypairId = result.keypair_id;
  const pubkeyTracker = await client.fetchDelayedPubKey(keypairId);
  const publicKey = await pubkeyTracker.result();
  expect(publicKey).not.toBeNull();
}, 200000);

test('fetchDelayedPrivKey', async () => {
  const client = new SandboxClient();
  const keypairTracker = await client.createDelayedKeypair(10);

  await new Promise((resolve) => {
    setTimeout(resolve, 120000 + 10000);
  });

  const result = await keypairTracker.result();
  const keypairId = result.keypair_id;
  const privkeyTracker = await client.fetchDelayedPrivKey(keypairId);
  expect(await privkeyTracker.status()).toBe('SENT');

  await new Promise((resolve) => {
    setTimeout(resolve, 60000);
  });

  const privateKey = await privkeyTracker.result();
  expect(privateKey).not.toBeNull();
}, 200000);

test('bllot.init', async () => {
  const client = new SandboxClient();
  const tracker = await client.ballot.init(2);

  expect(await tracker.status()).toBe('SENT');

  await new Promise((resolve) => {
    setTimeout(resolve, 60000);
  });

  expect(await tracker.status()).toBe('READY');
  const result = await tracker.result();
  console.log('ballot init result: ', result);
  expect(result.ballot_id).not.toBeNull();
  expect(result.public_key).not.toBeNull();
}, 100000);

test('bllot.vote', async () => {
  const client = new SandboxClient();
  const tracker = await client.ballot.init(2);

  await new Promise((resolve) => {
    setTimeout(resolve, 60000);
  });

  const result = await tracker.result();
  const encryptedVote = encrypt_message(result.public_key, 'candidate-1');
  await client.ballot.vote(encryptedVote);
}, 100000);

test('bllot.finalize', async () => {
  const client = new SandboxClient();
  const tracker = await client.ballot.init(3);

  await new Promise((resolve) => {
    setTimeout(resolve, 60000);
  });

  const result = await tracker.result();

  const encryptedVote1 = encrypt_message(result.public_key, 'candidate-1');
  const encryptedVote2 = encrypt_message(result.public_key, 'candidate-2');
  const encryptedVote3 = encrypt_message(result.public_key, 'candidate-1');
  await client.ballot.vote(encryptedVote1);
  await client.ballot.vote(encryptedVote2);
  await client.ballot.vote(encryptedVote3);

  await new Promise((resolve) => {
    setTimeout(resolve, 60000);
  });

  const finalizeTracker = await client.ballot.finalize();

  await new Promise((resolve) => {
    setTimeout(resolve, 90000);
  });

  expect(await finalizeTracker.result()).toEqual('candidate-1');
}, 300000);
