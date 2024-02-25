import { httpServer } from "./http_server";
import { wss } from "./ws-server";
import { ClientActions, TWebSocketClient } from "./ws-server/models/types";
import { registration } from "./ws-server/controllers/registration";
import { createRoom } from "./ws-server/controllers/createRoom";
import { addToRoom } from "./ws-server/controllers/addToRoom";
import { addShips } from "./ws-server/controllers/addShips";
import { attack } from "./ws-server/controllers/attack";
import db from "./ws-server/db";
import { getRandomPosition } from "./ws-server/helpers";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

wss.on('connection', (ws: TWebSocketClient, req) => {
    ws.clientId = req.headers['sec-websocket-key'];

    ws.on('error', console.error);

    ws.on('message', (message: string) => {
        const { type, data } = JSON.parse(message);

        console.log(type, data)

        switch (type) {
            case ClientActions.REG:
                registration({ ws, data })
                break;

            case ClientActions.CREATE_ROOM:
                createRoom({ ws })
                break;

            case ClientActions.ADD_USER_TO_ROOM:
                addToRoom({ ws, data })
                break;

            case ClientActions.ADD_SHIPS:
                addShips({ data })
                break;

            case ClientActions.ATTACK:
                attack({ data })
                break;

            case ClientActions.RANDOM_ATTACK:
                const { gameId, indexPlayer } = JSON.parse(data);
                const attackedPlayer = db.getAttackedPlayer(gameId, indexPlayer);
                const { x, y} = getRandomPosition(attackedPlayer.shots);
                const randomShootData = JSON.stringify({ x, y, gameId, indexPlayer })
                attack({ data: randomShootData })
                break;

            case ClientActions.SINGLE_PLAY:
                console.log()
                break

            default:
                return
        }
    });

    ws.on('close', () => {
        db.deleteUser(ws.clientId)
    })
});

wss.on('close', () => {
    db.reset()
})

