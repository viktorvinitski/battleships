import { WebSocketServer } from "ws";

export const wss = new WebSocketServer({ port: 3000, clientTracking: true });