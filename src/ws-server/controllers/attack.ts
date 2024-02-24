import { getShotStatus, notifyClients } from "../helpers";
import { AttackStatus, ServerActions, TGame, TWinner } from "../models/types";
import { wss } from "../index";
import db from "../db";

type TParams = {
    data: string;
    games: TGame[];
    winners: TWinner[];
}



export const attack = ({ data }: TParams) => {
    const { x, y, gameId, indexPlayer } = JSON.parse(data);
    const currentPlayersIndexes = db.getPlayers(gameId).map(player => player.indexPlayer);
    const attackedPlayer = db.getAttackedPlayer(gameId, indexPlayer);
    const enemy = db.getEnemy(gameId, indexPlayer);
    const shotStatus = getShotStatus(enemy.ships, x, y)

    // Add successful shot
    const isAttackedPosition = db.checkIsPositionAttacked({ gameId, player: attackedPlayer, x, y })
    if (!isAttackedPosition) {
        db.addPlayerShot({ gameId, player: attackedPlayer, x, y })
    }

    if (!attackedPlayer.turn || isAttackedPosition) {
        return;
    }


    if (shotStatus === AttackStatus.SHOT) {
        db.setIsAttackedPosition({ gameId, playerId: indexPlayer, x, y, isAttacked: true })

        const isKilledShip = db.checkIsKilledShip({ gameId, playerId: indexPlayer, x, y })
        if (isKilledShip) {
            db.setShipKilled({ gameId, playerId: indexPlayer, x, y })
            const attackedShip = db.getAttackedShip({ gameId, playerId: indexPlayer, x, y });
            attackedShip.targetPositions.forEach(position => {
                notifyClients({
                    wss,
                    notifications: [
                        {
                            type: ServerActions.ATTACK,
                            data: { position: { x: position.x, y: position.y }, currentPlayer: indexPlayer, status: AttackStatus.KILLED}
                        },
                    ],
                    notificationClients: currentPlayersIndexes
                })
            })

            // Handling of killing of all ships
            const isKilledAllShips = enemy.ships.every(ship => ship.isKilled);
            if (isKilledAllShips) {
                db.setWinner(gameId, indexPlayer)
                const winners = db.getWinners()
                notifyClients({
                    wss,
                    notifications: [
                        {
                            type: ServerActions.FINISH,
                            data: { winPlayer: attackedPlayer.indexPlayer }
                        },
                        {
                            type: ServerActions.UPDATE_WINNERS,
                            data: winners
                        },
                    ],
                    notificationClients: currentPlayersIndexes
                })
            }
            return;
        }
        notifyClients({
            wss,
            notifications: [
                {
                    type: ServerActions.ATTACK,
                    data: { position: { x, y }, currentPlayer: indexPlayer, status: shotStatus}
                },
            ],
            notificationClients: currentPlayersIndexes
        })
    }

    // Change turn if shot is unsuccessful
    if(shotStatus === AttackStatus.MISS) {
        db.changePlayerTurn(gameId, indexPlayer)
        const nextTurnPlayerId = db.getNextTurnPlayerId(gameId)

        notifyClients({
            wss,
            notifications: [
                { type: ServerActions.TURN, data: { currentPlayer: nextTurnPlayerId } },
                { type: ServerActions.ATTACK, data: { position: { x, y }, currentPlayer: indexPlayer, status: AttackStatus.MISS }},
            ],
            notificationClients: currentPlayersIndexes
        })
    }
}