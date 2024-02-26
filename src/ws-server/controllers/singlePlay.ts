import { TWebSocketClient } from "../models/types";
import { createRoom } from "./createRoom";
import { randomUUID } from "crypto";
import { addToRoom } from "./addToRoom";
import { addShips } from "./addShips";
import db from "../db";
import { generateShips } from "../helpers";

type TParams = {
    ws: TWebSocketClient;
}

export const singlePlay = ({ ws }: TParams) => {
    const botId = `BOT${randomUUID()}`
    db.addUser({ name: botId, index: botId })
    const roomId = createRoom({ ws: { clientId: botId } as TWebSocketClient });
    const addRoomBotData = JSON.stringify({ indexRoom: roomId.roomId })
    const gameId = addToRoom({ ws, data: addRoomBotData })

    const addShipsBotData = JSON.stringify({ gameId, indexPlayer: botId, ships: generateShips()})
    addShips({ data: addShipsBotData })
} 