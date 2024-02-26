import { ShipType, TShip } from "../models/types";

type TGeneratedShip = Omit<TShip, 'targetPositions' | 'aroundPositions' | 'isKilled'>

export const BOT_SHIPS: TGeneratedShip[][] = [
    [
        { position: { x: 2, y: 6 }, direction: false, type: ShipType.HUGE, length: 4 },
        { position: { x: 7, y: 7 }, direction: false, type: ShipType.LARGE, length: 3 },
        { position: { x: 5, y: 1 }, direction: false, type: ShipType.LARGE, length: 3 },
        { position: { x: 7, y: 3 }, direction: true, type: ShipType.MEDIUM, length: 2 },
        { position: { x: 1, y: 2 }, direction: true, type: ShipType.MEDIUM, length: 2 },
        { position: { x: 3, y: 4 }, direction: false, type: ShipType.MEDIUM, length: 2 },
        { position: { x: 3, y: 1 }, direction: false, type: ShipType.SMALL, length: 1 },
        { position: { x: 9, y: 1 }, direction: false, type: ShipType.SMALL, length: 1 },
        { position: { x: 0, y: 9 }, direction: false, type: ShipType.SMALL, length: 1 },
        { position: { x: 9, y: 3 }, direction: false, type: ShipType.SMALL, length: 1 },
    ],
    [
        { position: { x: 4, y: 7 }, direction: false, type: ShipType.HUGE, length: 4 },
        { position: { x: 6, y: 2 }, direction: false, type: ShipType.LARGE, length: 3 },
        { position: { x: 0, y: 8 }, direction: false, type: ShipType.LARGE, length: 3 },
        { position: { x: 1, y: 0 }, direction: false, type: ShipType.MEDIUM, length: 2 },
        { position: { x: 2, y: 4 }, direction: false, type: ShipType.MEDIUM, length: 2 },
        { position: { x: 0, y: 2 }, direction: true, type: ShipType.MEDIUM, length: 2 },
        { position: { x: 4, y: 0 }, direction: true, type: ShipType.SMALL, length: 1 },
        { position: { x: 9, y: 8 }, direction: false, type: ShipType.SMALL, length: 1 },
        { position: { x: 8, y: 4 }, direction: false, type: ShipType.SMALL, length: 1 },
        { position: { x: 3, y: 2 }, direction: false, type: ShipType.SMALL, length: 1 },
    ],
    [
        { position: { x: 3, y: 7 }, direction: false, type: ShipType.HUGE, length: 4 },
        { position: { x: 2, y: 0 }, direction: false, type: ShipType.LARGE, length: 3 },
        { position: { x: 4, y: 2 }, direction: true, type: ShipType.LARGE, length: 3 },
        { position: { x: 8, y: 7 }, direction: true, type: ShipType.MEDIUM, length: 2 },
        { position: { x: 8, y: 1 }, direction: true, type: ShipType.MEDIUM, length: 2 },
        { position: { x: 7, y: 4 }, direction: true, type: ShipType.MEDIUM, length: 2 },
        { position: { x: 3, y: 9 }, direction: true, type: ShipType.SMALL, length: 1 },
        { position: { x: 0, y: 0 }, direction: false, type: ShipType.SMALL, length: 1 },
        { position: { x: 1, y: 4 }, direction: false, type: ShipType.SMALL, length: 1 },
        { position: { x: 6, y: 1 }, direction: false, type: ShipType.SMALL, length: 1 },
    ],
];