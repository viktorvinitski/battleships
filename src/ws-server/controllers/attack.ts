import { getShotStatus, notifyClients} from "../helpers";
import { AttackStatus, ServerActions } from "../models/types";
import db from "../db";

type TParams = {
    data: string;
}

export const attack = ({ data }: TParams) => {
    const { x, y, gameId, indexPlayer } = JSON.parse(data);
    const attackedPlayer = db.getAttackedPlayer(gameId, indexPlayer);
    const currentPlayersIndexes = db.getPlayers(gameId).map(player => player.indexPlayer);
    const enemy = db.getEnemy(gameId, indexPlayer);
    const shotStatus = getShotStatus(enemy.ships, x, y)

    // Check is user already shoot this position
    const isAttackedPosition = db.checkIsPositionAttacked({ gameId, player: attackedPlayer, x, y })
    if (!attackedPlayer.turn || isAttackedPosition) {
        return;
    }


    if (shotStatus === AttackStatus.SHOT) {
        // add player shot
        db.addPlayerShot({ gameId, player: attackedPlayer, x, y })
        db.setIsAttackedPosition({ gameId, playerId: indexPlayer, x, y, isAttacked: true })

        const isKilledShip = db.checkIsKilledShip({ gameId, playerId: indexPlayer, x, y })
        if (isKilledShip) {
            db.setShipKilled({ gameId, playerId: indexPlayer, x, y })
            const attackedShip = db.getAttackedShip({ gameId, playerId: indexPlayer, x, y });

            // Notify clients about missed positions around ship
            attackedShip.aroundPositions.forEach(position => {
                db.addPlayerShot({ gameId, player: attackedPlayer, x: position.x, y: position.y })
                notifyClients({
                    notifications: [
                        {
                            type: ServerActions.ATTACK,
                            data: { position: { x: position.x, y: position.y }, currentPlayer: indexPlayer, status: AttackStatus.MISS}
                        },
                    ],
                    notificationClients: currentPlayersIndexes
                })
            })

            // Notify clients that ship was killed
            attackedShip.targetPositions.forEach(position => {
                notifyClients({
                    notifications: [
                        {
                            type: ServerActions.ATTACK,
                            data: { position: { x: position.x, y: position.y }, currentPlayer: indexPlayer, status: AttackStatus.KILLED}
                        },
                    ],
                    notificationClients: currentPlayersIndexes
                })
            })

            // Handling of game finish
            const isKilledAllShips = enemy.ships.every(ship => ship.isKilled);
            if (isKilledAllShips) {
                db.setWinner(gameId, indexPlayer)
                const winners = db.getWinners()
                notifyClients({
                    notifications: [{ type: ServerActions.FINISH, data: { winPlayer: attackedPlayer.indexPlayer }}],
                    notificationClients: currentPlayersIndexes
                })

                // Update winners for all users
                notifyClients({
                    notifications: [{ type: ServerActions.UPDATE_WINNERS, data: winners }],
                })
                db.deleteGame(gameId);
            }
            return;
        }
        notifyClients({
            notifications: [
                {
                    type: ServerActions.ATTACK,
                    data: { position: { x, y }, currentPlayer: indexPlayer, status: shotStatus }
                },
            ],
            notificationClients: currentPlayersIndexes
        })
    }

    if(shotStatus === AttackStatus.MISS) {
        // Add player shot
        db.addPlayerShot({ gameId, player: attackedPlayer, x, y })
        db.changePlayerTurn(gameId, indexPlayer)
        const nextTurnPlayerId = db.getNextTurnPlayerId(gameId)

        notifyClients({
            notifications: [
                // Change turn if shot is unsuccessful
                { type: ServerActions.TURN, data: { currentPlayer: nextTurnPlayerId } },
                { type: ServerActions.ATTACK, data: { position: { x, y }, currentPlayer: indexPlayer, status: AttackStatus.MISS }},
            ],
            notificationClients: currentPlayersIndexes
        })
    }
}