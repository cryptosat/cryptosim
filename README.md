# Cryptosat Simulator

Our mission at [Cryptosat](cryptosat.io) is to build satellites that power cryptographic, blockchain and ledger applications. We believe that satellites possess unique properties that make them well suited for these tasks and by launching such computational platforms into space we can unlock new and exciting opportunities in the realm of security and crypto.

This repository contains a simulation library which simulates the operation of Cryptosat. This includes simulation of the satellite orbital trajectory and its position over time.
As a developer, you can learn about the cryptographic functions our satellites will provide and start integrating your project and protocols with our APIs.
When you (and Cryptosat) are ready - you can turn the switch to start communicating with the actual satellite.

# Installation

The library is published at the yarn online package index as [`@cryptosat/cryptosim`](https://yarnpkg.com/package/@cryptosat/cryptosim). To include it in your own project run:

    yarn install @cryptosat/cryptosim

# Usage

You can import the required classes from the library as needed. The snippet below demonstrates how to construct a cryptosat API client for a single satellite following the celestial orbit of the international space station. Check out the online [tutorial](https://simulator.cryptosat.io) to get started using the cryptosat API.

    const clock = new SimulatedClock(new Date());
    clock.play();
    const universe = new Universe(clock);
    const ISS_TLE = [
      '1 25544U 98067A   21027.77992426  .00003336  00000-0  68893-4 0  9991',
      '2 25544  51.6465 317.1909 0002399 302.6503 164.1536 15.48908950266831',
    ];
    const sat = new Satellite(universe, 'crypto1', ISS_TLE[0], ISS_TLE[1]);
    const gsnetwork = GroundStationNetwork.load(
        universe, require('@cryptosat/cryptosim/data/rbcNetwork'));
    const service = new MainService(universe);
    sat.bindService('main', service);
    cryptosat = new MainClient(universe, sat, gsnetwork, 'main');


# Development

## Installation

After cloing the directory install the project dependencies using:

    yarn install

## Testing

The project uses the [jest](https://jestjs.io/) testing framework. To execute the test suite run:

    yarn test

## Lint

Check for lint errors with:

    yarn lint

