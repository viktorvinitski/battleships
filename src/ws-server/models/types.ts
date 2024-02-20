import { randomUUID } from "crypto";
import { WebSocket } from "ws";

export type TWebSocketClient = WebSocket & { clientId?: number; }

export enum ClientActions {
    REG = "reg",
    CREATE_ROOM = "create_room",
    ADD_USER_TO_ROOM = "add_user_to_room",
    ADD_SHIPS = "add_ships",
    RANDOM_ATTACK = "randomAttack",
}

export enum ServerActions {
    REG = "reg",
    UPDATE_WINNERS = "update_winners",
    CREATE_GAME = "create_game",
    UPDATE_ROOM = "update_room",
    START_GAME = "start_game",
    ATTACK = "attack",
    TURN = "turn",
    FINISH = "finish",
}

export enum ShipType {
    SMALL = 'small',
    MEDIUM = 'medium',
    LARGE = 'large',
    HUGE = 'huge',
}

export type TUser = {
    name: string,
    index: number,
    error?: boolean,
    errorText?: string,
}

export type TRoom = {
    roomId: ReturnType<typeof randomUUID>;
    roomUsers: TUser[];
}

export type TShip = {
    position: {
        x: number;
        y: number;
    },
    direction: boolean;
    length: number;
    type: ShipType;
}

export type TPlayer = {
    indexPlayer: number;
    ships: TShip[]
}

export type TGame = {
    gameId: ReturnType<typeof randomUUID>;
    players: TPlayer[];
}