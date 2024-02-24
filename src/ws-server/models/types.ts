import { randomUUID } from "crypto";
import { WebSocket } from "ws";

export type TWebSocketClient = WebSocket & { clientId?: string; }

export enum ClientActions {
    REG = "reg",
    CREATE_ROOM = "create_room",
    ADD_USER_TO_ROOM = "add_user_to_room",
    ADD_SHIPS = "add_ships",
    ATTACK = "attack",
    RANDOM_ATTACK = "randomAttack",
}

export enum ServerActions {
    REG = "reg",
    UPDATE_WINNERS = "update_winners",
    CREATE_GAME = "create_game",
    UPDATE_ROOM = "update_room",
    START_GAME = "start_game",
    TURN = "turn",
    ATTACK = "attack",
    FINISH = "finish",
}

export enum ShipType {
    SMALL = 'small',
    MEDIUM = 'medium',
    LARGE = 'large',
    HUGE = 'huge',
}

export enum AttackStatus {
    MISS = 'miss',
    KILLED = 'killed',
    SHOT = 'shot',
}

export type TUser = {
    name: string,
    index: string,
    error?: boolean,
    errorText?: string,
}

export type TRoom = {
    roomId: ReturnType<typeof randomUUID>;
    roomUsers: TUser[];
}

export type TPosition = {
    x: number;
    y: number;
    isAttacked?: boolean;
}

export type TShip = {
    position: TPosition,
    direction: boolean;
    length: number;
    type: ShipType;
    targetPositions: TPosition[];
    isKilled: boolean;
}

export type TPlayer = {
    name: string,
    indexPlayer: string;
    ships: TShip[];
    turn: boolean;
    shots: TPosition[];
}

export type TGame = {
    gameId: ReturnType<typeof randomUUID>;
    players: TPlayer[];
}

export type TWinner = {
    name: string,
    wins: number,
}