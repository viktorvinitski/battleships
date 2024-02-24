import { notifyClients, prepareServerResponse } from "../helpers";
import { ServerActions, TWebSocketClient } from "../models/types";
import { wss } from "../index";
import db from "../db";

type TParams = {
    ws: TWebSocketClient;
    data: string;
}

export const registration = ({ ws, data }: TParams ) => {
    const { name } = JSON.parse(data);
    const newUser = {
        name,
        index: ws.clientId,
    }

    const isUserExists = db.checkIsUserExists(name)
    if (!isUserExists) {
        db.addUser(newUser)
        const rooms = db.getRooms();
        const winners = db.getWinners();
        ws.send(prepareServerResponse({ type: ServerActions.REG, data: newUser }))
        notifyClients({
            wss,
            notifications: [
                { type: ServerActions.UPDATE_ROOM, data: rooms },
                { type: ServerActions.UPDATE_WINNERS, data: winners }
            ]
        })
    } else {
        ws.send(prepareServerResponse({
            type: ServerActions.REG,
            data: {...newUser, errorText: `User with name ${newUser.name} already exists`, error: true}
        }))
    }
}