import { ClientActions, TWebSocketClient } from "../models/types";
import { registration } from "../controllers/registration";
import { createRoom } from "../controllers/createRoom";
import { addToRoom } from "../controllers/addToRoom";
import { addShips } from "../controllers/addShips";
import { attack } from "../controllers/attack";
import { singlePlay } from "../controllers/singlePlay";
import { getRandomPosition } from "../helpers";
import db from "../db";

type TParams = {
    ws: TWebSocketClient;
    message: string;
}

export const clientMessageHandler = ({ ws, message }: TParams) => {
    const { type, data } = JSON.parse(message);

    return {
        [ClientActions.REG]: () => {
            registration({ ws, data });
        },
        [ClientActions.CREATE_ROOM]: () => {
            createRoom({ ws });
        },
        [ClientActions.ADD_USER_TO_ROOM]: () => {
            addToRoom({ ws, data });
        },
        [ClientActions.ADD_SHIPS]: () => {
            addShips({ data });
        },
        [ClientActions.ATTACK]: () => {
            attack({ data });
        },
        [ClientActions.RANDOM_ATTACK]: () => {
            const { gameId, indexPlayer } = JSON.parse(data);
            const attackedPlayer = db.getAttackedPlayer(gameId, indexPlayer);
            const { x, y} = getRandomPosition(attackedPlayer.shots);
            const randomShootData = JSON.stringify({ x, y, gameId, indexPlayer });
            attack({ data: randomShootData });
        },
        [ClientActions.SINGLE_PLAY]: () => {
            singlePlay({ ws });
        }
    }[type as ClientActions]()
}