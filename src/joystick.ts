import { spawn } from 'child_process';
import { broadcastMessage } from './rpc';

const names = {
  init: [],
  axis: ['joy-x-l', 'joy-y-l', 'left-2', 'joy-x-r', 'joy-y-r', 'right-2', 'axis-x', 'axis-y'],
  button: ['a', 'b', 'x', 'y', 'left-1', 'right-1', 'select', 'start', 'mode'],
};

export async function jsmon() {
  const ps = spawn('cat', ['/dev/input/js0']);
  ps.stdout.on('data', (data) => {
    const tv = data[6];
    const type = tv & 0x80 ? 'init' : (tv & 0x01 ? 'button' : 'axis');
    const index = data[7];
    const name = names[type][index];
    const event = {
      type,
      time: data.readUInt32LE(0),
      value: data.readInt16LE(4),
      index,
      name,
    };
    console.log(event);
    broadcastMessage('joystick', event);
  });
}