import ws from 'ws';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { WebSocketMessageReader, WebSocketMessageWriter, createMessageConnection, ConsoleLogger, MessageConnection } from 'vscode-ws-jsonrpc';

// create the web socket
const wss = new ws.Server({
  noServer: true,
  perMessageDeflate: false,
});

let connection: MessageConnection | null = null as any;

export function broadcastMessage(method: string, ...params: any[]) {
  if (!connection) {
    throw 'not connected';
  }
  connection.sendNotification(method, ...params);
}

export function handling(request: IncomingMessage, socket: Socket, head: Buffer) {
  if (connection) {
    return;
  }
  wss.handleUpgrade(request, socket, head, (webSocket) => {
    const socket = {
      send: (content: any) => webSocket.send(content, (error) => {
        if (error) {
          throw error;
        }
      }),
      onMessage: (cb: (this: ws, data: ws.Data) => void) => webSocket.on('message', cb),
      onError: (cb: (this: ws, err: Error) => void) => webSocket.on('error', cb),
      onClose: (cb: (this: ws, code: number, reason: string) => void) => {
        webSocket.on('close', cb);
      },
      dispose: () => {
        connection = null;
        webSocket.close();
      },
    };

    const reader = new WebSocketMessageReader(socket);
    const writer = new WebSocketMessageWriter(socket);

    connection = createMessageConnection(reader, writer, new ConsoleLogger());

    webSocket.on('close', () => {
      connection = null;
      console.log('closed');
    });

    connection.listen();

    console.log(`connected`);
  });
}