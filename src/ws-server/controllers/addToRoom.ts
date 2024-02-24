import { notifyClients } from "../helpers";
import { ServerActions, TWebSocketClient } from "../models/types";
import { wss } from "../index";
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
            wss,
            notifications: [
                { type: ServerActions.CREATE_GAME, data: { idGame, idPlayer: user.index} }
            ],
            notificationClients: [user.index]
        })
    })

    // Create game with both players
    db.addGame(idGame, usersInRoom)

    // If user have his own room, we need to delete it TODO:NOT WORKING!!!!!!!
    // const newUserRoom = db.getRooms().find(room => room.roomUsers.some(user => user.name === newUserInRoom.name))
    // if (newUserRoom) {
    //     db.deleteRoom(newUserRoom.roomId)
    // }

    // Delete current room after starting of the game
    db.deleteRoom(indexRoom);
    const rooms = db.getRooms()
    notifyClients({ wss, notifications: [{ type: ServerActions.UPDATE_ROOM, data: rooms }] })
}