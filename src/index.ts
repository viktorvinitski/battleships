import {httpServer} from "./http_server";
import {wss} from "./ws-server";
import {ClientActions, ServerActions, TWebSocketClient, TRoom, TUser, TGame} from "./ws-server/models/types";
import {getRandomTurn, notifyClients, prepareServerResponse} from "./ws-server/helpers";
import {randomUUID} from 'crypto'

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

let users: TUser[] = []
let rooms: TRoom[] = []
let games: TGame[] = []

let userId = 0

wss.on('connection', (ws: TWebSocketClient, req) => {
    ws.clientId = userId++;

    ws.on('error', console.error);

    ws.on('message', (message: string) => {
        const { type, data } = JSON.parse(message);

        console.log(type, data)

        switch (type) {
            case ClientActions.REG:
                const { name } = JSON.parse(data);
                const newUser = {
                    name,
                    index: ws.clientId,
                }

                const isUserExists = users.find(user => user.name === name)
                if (!isUserExists) {
                    users = [...users, newUser]
                    ws.send(prepareServerResponse({ type: ServerActions.REG, data: newUser }))
                    notifyClients({ wss, notifications: [{ type: ServerActions.UPDATE_ROOM, data: rooms }] })
                } else {
                    ws.send(prepareServerResponse({
                        type: ServerActions.REG,
                        data: {...newUser, errorText: `User with name ${newUser.name} already exists`, error: true}
                    }))
                }
                break;

            case ClientActions.CREATE_ROOM:
                const roomCreator = users.find(user => user.index === ws.clientId)
                const newRoom = {
                    roomId: randomUUID(),
                    roomUsers: [roomCreator],
                };

                const isExistsRoomWithUser = rooms.some(room => {
                    return room.roomUsers.find(user => user.index === roomCreator.index)
                })

                if (isExistsRoomWithUser) {
                    return;
                }

                rooms = [...rooms, newRoom];
                notifyClients({ wss, notifications: [{ type: ServerActions.UPDATE_ROOM, data: rooms }] })
                break;

            case ClientActions.ADD_USER_TO_ROOM:
                const { indexRoom } = JSON.parse(data);
                const currentRoom = rooms.find(room => room.roomId === indexRoom)
                const newUserInRoom = users.find(user => user.index === ws.clientId)

                const isUserInRoom = currentRoom.roomUsers.find(user => user.name === newUserInRoom.name)

                if (isUserInRoom) {
                    return;
                }

                rooms = rooms.map(room => {
                    return room.roomId === currentRoom.roomId
                        ? {...room, roomUsers: [...room.roomUsers, newUserInRoom]}
                        : room
                })
                // notifyClients({ wss, notifications: [{ type: ServerActions.UPDATE_ROOM, data: rooms }] })

                const idGame = randomUUID();
                const usersInRoom = rooms
                    .find(room => room.roomId === indexRoom).roomUsers
                    .reduce((acc, user) => [...acc, user.index], [])

                // Removing of the room when it has 2 players
                rooms = rooms.filter(room => room.roomId !== indexRoom)
                notifyClients({ wss, notifications: [{ type: ServerActions.UPDATE_ROOM, data: rooms }] })

                // Notifying of player in the room that game was started
                usersInRoom.forEach(idPlayer => {
                    notifyClients({
                        wss,
                        notifications: [
                            { type: ServerActions.CREATE_GAME, data: { idGame, idPlayer} }
                        ],
                        notificationClients: [idPlayer]
                    })
                })

                games = [
                    ...games,
                    { gameId: idGame, players: usersInRoom.map(idPlayer => ({ indexPlayer: idPlayer, ships: [] }))}
                ]
                break;

            case ClientActions.ADD_SHIPS:
                const { gameId, indexPlayer, ships } = JSON.parse(data);

                games = games.map(game => {
                    if (game.gameId === gameId) {
                        return {...game, players: game.players.map(player => {
                            return player.indexPlayer === indexPlayer ? {...player, ships} : player
                        })}
                    }
                    return game
                });

                const currentGame = games.find(game => game.gameId === gameId)
                const isBothPlayersReady = currentGame.players.every(player => player.ships.length > 0)

                if (isBothPlayersReady) {
                    const indexes = currentGame.players.map(player => player.indexPlayer);
                    const turn = getRandomTurn(indexes)

                    currentGame.players.forEach(({indexPlayer, ships}) => {
                        notifyClients({
                            wss,
                            notifications: [
                                { type: ServerActions.START_GAME, data: { ships, currentPlayerIndex: indexPlayer} },
                                { type: ServerActions.TURN, data: { currentPlayer: turn } },
                            ],
                            notificationClients: [indexPlayer]
                        })
                    })

                }
                break;

            case ClientActions.RANDOM_ATTACK:


        }
    });

    ws.on('close', () => {
        users = []
        rooms = []
        userId = 0
    })
});

