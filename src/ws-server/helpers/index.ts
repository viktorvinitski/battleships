import {ServerActions, TWebSocketClient} from "../models/types";
import { Server } from "ws";

type TServerResponseParams = {
    type: ServerActions;
    data: unknown;
}

type TNotifyClientsParams = {
    wss: Server;
    notifications: TServerResponseParams[];
    notificationClients?: number[]
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

export const getRandomTurn = (indexes: number[], ) => {
    const random = Math.floor(Math.random() * indexes.length);
    return indexes[random];
}