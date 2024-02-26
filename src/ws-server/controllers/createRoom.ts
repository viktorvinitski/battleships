import { notifyClients } from "../helpers";
import { ServerActions, TWebSocketClient } from "../models/types";
import { randomUUID } from "crypto";
import db from '../db'

type TParams = {
    ws: TWebSocketClient;
}

export const createRoom = ({ ws }: TParams ) => {
    const roomCreator = db.getUserById(ws.clientId);
    const newRoom = {
        roomId: randomUUID(),
        roomUsers: [roomCreator],
    };


    const isExistsRoomWithUser = db.checkIsExistsRoomWithUser(roomCreator.index)
    if (isExistsRoomWithUser) {
        return;
    }

    db.addRoom(newRoom);
    const rooms = db.getRooms();
    const winners = db.getWinners();
    notifyClients({
        notifications: [
            { type: ServerActions.UPDATE_ROOM, data: rooms },
            { type: ServerActions.UPDATE_WINNERS, data: winners }
        ]
    })

    return newRoom;
}