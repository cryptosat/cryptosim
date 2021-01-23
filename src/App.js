// import logo from './logo.svg';
import Console from "./Console.js"
import Tutorial from "./Tutorial.js"
import WorldMap from "./WorldMap.js"
import './App.css';

function App() {
  var ascii = [
  // "           .       .                   .       .      .     .      ",
  "          .    .         .    .            .     ______            ",
  "      .           .             .               ////////           ",
  "                .    .   ________   .  .      /////////     .    . ",
  "           .            |.____.  /\        ./////////    .         ",
  "    .                 .//      \/  |\     /////////                ",
  "       .       .    .//          \ |  \ /////////       .     .   .",
  "                    ||.    .    .| |  ///////// .     .            ",
  "     .    .         ||           | |//`,/////                .     ",
  "             .       \\        ./ //  /  \/   .                    ",
  "  .                    \\.___./ //\` '   ,_\     .     .           ",
  "          .           .     \ //////\ , /   \                 .    ",
  "                       .    ///////// \|  '  |    .                ",
  "      .        .          ///////// .   \ _ /          .           ",
  "                        /////////                              .   ",
  "                 .   ./////////     .     .                        ",
  "         .           --------   .                  ..             .",
  "  .               .        .         .                       .     "].join('\n')
return (
    <div className="App">
      <Tutorial />
      <Console>
        {"Welcome to the Cryptosat Simulator v0.1!"}<br />&nbsp;
        <code><pre>{ascii}</pre></code>
        <br />Documentation: type "help"<br />&nbsp;<br />
      </Console>
      <WorldMap />
    </div>
  );
}

export default App;
