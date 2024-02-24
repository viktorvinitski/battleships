import { AttackStatus, ServerActions, TPosition, TShip, TWebSocketClient } from "../models/types";
import { Server } from "ws";

type TServerResponseParams = {
    type: ServerActions;
    data: unknown;
}

type TNotifyClientsParams = {
    wss: Server;
    notifications: TServerResponseParams[];
    notificationClients?: string[]
}

export const prepareServerResponse = ({ type, data }: TServerResponseParams) => (
    JSON.stringify({
        type,
        data: JSON.stringify(data),
        id: 0,
    })
);

export const notifyClients = ({ wss, notifications, notificationClients = [] }: TNotifyClientsParams) => {
    wss.clients.forEach((client: TWebSocketClient) => {
        if (client.readyState === 1) {
            // Notify all clients
            if(!notificationClients.length) {
                notifications.forEach(notification => {
                    client.send(prepareServerResponse(notification))
                });
            }
            // Notify specified clients
            if(notificationClients.includes(client.clientId)) {
                notifications.forEach(notification => {
                    client.send(prepareServerResponse(notification))
                });
            }
        }
    });
}

export const getRandomTurn = (indexes: string[], ) => {
    const random = Math.floor(Math.random() * indexes.length);
    return indexes[random];
}

export const getMappedShips = (ships: TShip[]) => {
    return ships.map(ship => {
        const defaultTargetCoordinates: TPosition = {...ship.position, isAttacked: false}
        let additionalTargetCoordinates = []
        if (ship.length > 1) {
            for(let i = 1; i < ship.length; i++) {
                if (ship.direction) {
                    additionalTargetCoordinates.push({
                        ...defaultTargetCoordinates,
                        y: defaultTargetCoordinates.y + i,
                        isAttacked: false
                    })
                } else {
                    additionalTargetCoordinates.push({
                        ...defaultTargetCoordinates,
                        x: defaultTargetCoordinates.x + i,
                        isAttacked: false,
                    })
                }
            }
        }

        return {
            ...ship,
            targetPositions: [defaultTargetCoordinates, ...additionalTargetCoordinates],
        }
    })
}

export const getShotStatus = (ships: TShip[], x: number, y: number) => {
    const isSuccessShot = ships.some(ship => {
        return ship.targetPositions.some(position => position.x === x && position.y === y)
    })
    return isSuccessShot ? AttackStatus.SHOT : AttackStatus.MISS
}

