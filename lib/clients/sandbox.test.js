const SandboxClient = require('./sandbox');

test('status', async () => {
  sandboxClient = new SandboxClient();
  const result = await sandboxClient.status();
  expect(result.status).toEqual('ok');
});

test('getPublicRandom', async () => {
  sandboxClient = new SandboxClient();
  const result = await sandboxClient.getPublicRandom();
  console.log(result);
});

