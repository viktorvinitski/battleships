import { notifyClients } from "../helpers";
import { ServerActions, TWebSocketClient } from "../models/types";
import { randomUUID } from "crypto";
import db from '../db'

type TParams = {
    ws: TWebSocketClient;
    data: string;
}

export const addToRoom = ({ ws, data }: TParams ) => {
    const { indexRoom } = JSON.parse(data);
    const newUserInRoom = db.getUserById(ws.clientId);
    const isUserInRoom = db.checkIsUserInRoom(indexRoom, newUserInRoom.name)

    if (isUserInRoom) {
        return;
    }

    db.addUserToRoom(indexRoom, newUserInRoom)
    const usersInRoom = db.getRoomUsers(indexRoom)

    // Notifying of players in the room that game was started
    const idGame = randomUUID();
    usersInRoom.forEach(user => {
        notifyClients({
            notifications: [
                { type: ServerActions.CREATE_GAME, data: { idGame, idPlayer: user.index} }
            ],
            notificationClients: [user.index]
        })
    })

    // Create game with both players
    db.addGame(idGame, usersInRoom);

    // Delete rooms of both users
    usersInRoom.forEach(roomUser => {
        db.getRooms().forEach(room => {
            const isUserWithRoom = room.roomUsers.some(user => user.index === roomUser.index);
            if (isUserWithRoom) {
                db.deleteRoom(room.roomId);
            }
        })
    })
    const rooms = db.getRooms();
    notifyClients({ notifications: [{ type: ServerActions.UPDATE_ROOM, data: rooms }] })
}