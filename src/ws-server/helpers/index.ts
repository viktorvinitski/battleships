import { AttackStatus, ServerActions, TPosition, TShip, TWebSocketClient } from "../models/types";
import { wss } from "../index";
import { BOT_SHIPS } from "../constants";

type TServerResponseParams = {
    type: ServerActions;
    data: unknown;
}

type TNotifyClientsParams = {
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

export const notifyClients = ({ notifications, notificationClients = [] }: TNotifyClientsParams) => {
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

// true - vertical
// false - horizontal

const getShipAroundPositions = (targetPositions: TPosition[], direction: boolean) => {
    let aroundPositions: TPosition[] = []
    if (direction) {
        for (let i = - 1; i <= targetPositions.length; i++){
            aroundPositions.push({ x: targetPositions[0].x - 1, y: targetPositions[0].y + i })
            aroundPositions.push({ x: targetPositions[0].x + 1, y: targetPositions[0].y + i })
        }
        aroundPositions.push({ x: targetPositions[0].x, y: targetPositions[0].y - 1 })
        aroundPositions.push({ x: targetPositions[0].x, y: targetPositions[targetPositions.length - 1].y + 1 })
    } else {
        for (let i = - 1; i <= targetPositions.length; i++){
            aroundPositions.push({ x: targetPositions[0].x + i, y: targetPositions[0].y - 1 })
            aroundPositions.push({ x: targetPositions[0].x + i, y: targetPositions[0].y + 1})
        }
        aroundPositions.push({ x: targetPositions[0].x - 1, y: targetPositions[0].y })
        aroundPositions.push({ x: targetPositions[targetPositions.length - 1].x + 1, y: targetPositions[0].y })
    }
    return aroundPositions
        .filter(position => position.x >= 0 && position.y >= 0)
        .map(position => ({...position, isAttacked: false}));
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
                    })
                } else {
                    additionalTargetCoordinates.push({
                        ...defaultTargetCoordinates,
                        x: defaultTargetCoordinates.x + i,
                    })
                }
            }
        }

        const targetPositions = [defaultTargetCoordinates, ...additionalTargetCoordinates]

        return {
            ...ship,
            targetPositions,
            aroundPositions: getShipAroundPositions(targetPositions, ship.direction)
        }
    })
}

export const getShotStatus = (ships: TShip[], x: number, y: number) => {
    const isSuccessShot = ships.some(ship => {
        return ship.targetPositions.some(position => position.x === x && position.y === y)
    })
    return isSuccessShot ? AttackStatus.SHOT : AttackStatus.MISS
}

const getRandomCoordinates = () => {
    const randomX = Math.floor(Math.random() * 10);
    const randomY = Math.floor(Math.random() * 10);

    return { x: randomX, y: randomY };
}

export const getRandomPosition = (shots: TPosition[]): { x: number, y: number } => {
    const { y, x} = getRandomCoordinates();

    const isShotExits = shots.find(shot => shot.y === y && shot.x === x);
    if (isShotExits) {
        return getRandomPosition(shots);
    } else {
        return { x, y }
    }
}

export const getBotAttackData = (gameId: string, shots: TPosition[], indexPlayer: string)=> {
    const { x, y } = getRandomPosition(shots);
    return  JSON.stringify({ x, y, gameId, indexPlayer})
}

export const checkIsBot = (name: string) => name.includes('BOT')

export const generateShips = () => {
    return BOT_SHIPS[Math.floor(Math.random() * BOT_SHIPS.length)]
}