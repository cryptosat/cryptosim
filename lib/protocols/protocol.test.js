const Protocol = require('./protocol');
const Satellite = require('../satellite');
const GroundStation = require('../groundStation');
const testUtils = require('../testUtils');

test('protocol is an abstract class', () => {
  const universe = testUtils.createTestUniverse();
  expect(() => {new Protocol(universe) }).toThrow(Error);
});

test('protocol bound to send message', () => {
  protocol = new class extends Protocol {}();
  protocol.bind(() => { return 'hello'});
  expect(protocol.send()).toEqual('hello');
});

test('bind to satellite', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition();
  const gpos = pos.clone();
  gpos.altitude = 0;
  receivedMessages = [];
  const gstation = new GroundStation(universe, 'houston', gpos);
  const listenId = gstation.startListening((msg) => {
    receivedMessages.push(msg)
  });
  sat.bindProtocol('id', new class extends Protocol {
    receive(body) {
      this.send('received: ' + body);
    }
  }(universe));
  universe.transmitFromStation(gstation, {protocolId: 'id', body: 'hello'});
  universe.clock().advance(1);
  universe.clock().advance(1);
  expect(receivedMessages.length).toEqual(1);
  expect(receivedMessages[0].protocolId).toEqual('id');
  expect(receivedMessages[0].body).toEqual('received: hello');
});
