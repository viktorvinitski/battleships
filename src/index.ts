import { httpServer } from "./http_server";
import { wss } from "./ws-server";
import { ClientActions, TWebSocketClient, TRoom, TUser, TGame, TWinner } from "./ws-server/models/types";
import { registration } from "./ws-server/controllers/registration";
import { createRoom } from "./ws-server/controllers/createRoom";
import { addToRoom } from "./ws-server/controllers/addToRoom";
import { addShips } from "./ws-server/controllers/addShips";
import { attack } from "./ws-server/controllers/attack";
import db from "./ws-server/db";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

let users: TUser[] = [];
let rooms: TRoom[] = [];
let games: TGame[] = [];
let winners: TWinner[] = [];

// let userId = 0

wss.on('connection', (ws: TWebSocketClient, req) => {
    // ws.clientId = userId++;
    ws.clientId = req.headers['sec-websocket-key'];

    ws.on('error', console.error);

    ws.on('message', (message: string) => {
        const { type, data } = JSON.parse(message);

        console.log(type)

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
                attack({ data, games: db.getGames(), winners: db.getWinners() })
                break;
                // const { gameId: idGameId, indexPlayer: playerIndex } = JSON.parse(data);

            // case ClientActions.RANDOM_ATTACK:
            //     const { gameId: idGameId, indexPlayer: playerIndex } = JSON.parse(data);
            //     console.log(idGameId)
            //     console.log(playerIndex)


        }
    });

    ws.on('close', () => {
        db.deleteUser(ws.clientId)
    })
});

// wss.on('close', () => {
//     db.reset()
// })

