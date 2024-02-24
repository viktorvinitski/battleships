import { getMappedShips, getRandomTurn, notifyClients } from "../helpers";
import { ServerActions } from "../models/types";
import { wss } from "../index";
import db from "../db";

type TParams = {
    data: string;
}

export const addShips = ({ data }: TParams) => {
    const { gameId, indexPlayer, ships } = JSON.parse(data);

    db.addPlayerShips(gameId, indexPlayer, getMappedShips(ships))

    const isPlayersReady = db.checkIsPlayersReady(gameId);
    if (isPlayersReady) {
        const players = db.getPlayers(gameId)
        const indexes = players.map(player => player.indexPlayer);
        const turn = getRandomTurn(indexes)

        db.updatePlayersTurns(gameId, turn)

        players.forEach(({indexPlayer, ships}) => {
            notifyClients({
                wss,
                notifications: [
                    { type: ServerActions.START_GAME, data: { ships, currentPlayerIndex: indexPlayer} },
                    { type: ServerActions.TURN, data: { currentPlayer: turn } },
                ],
                notificationClients: [indexPlayer]
            })
        })

    }

}