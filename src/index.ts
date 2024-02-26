import { httpServer } from "./http_server";
import { wss } from "./ws-server";
import { TWebSocketClient } from "./ws-server/models/types";
import db from "./ws-server/db";
import { clientMessageHandler } from "./ws-server/handlers/clientMessageHandler";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

wss.on('connection', (ws: TWebSocketClient, req) => {
    ws.clientId = req.headers['sec-websocket-key'];

    ws.on('error', console.error);

    ws.on('message', (message: string) => {
        clientMessageHandler({ ws, message })
    });

    ws.on('close', () => {
        db.deleteUser(ws.clientId)
    })
});

wss.on('close', () => {
    db.reset()
})

