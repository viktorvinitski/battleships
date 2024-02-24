import {TGame, TPlayer, TPosition, TRoom, TShip, TUser, TWinner} from "../models/types";

type TDatabase = {
    _users: TUser[];
    getUsers: () => TUser[];
    getUserById: (id: string) => TUser;
    addUser: (user: { name: string, index: string }) => TUser[];
    checkIsUserExists: (name: string) => boolean;
    deleteUser: (id: string) => void;

    _rooms: TRoom[];
    getRooms: () => TRoom[];
    getRoomById: (id: string) => TRoom;
    checkIsUserInRoom: (roomId: string, userName: string) => TUser;
    checkIsExistsRoomWithUser: (id: string) => boolean;
    addRoom: (room: TRoom) => void;
    addUserToRoom: (roomId: string, newUser: TUser) => void;
    getRoomUsers: (roomId: string) => TUser[];
    deleteRoom: (roomId: string) => void;

    _games: TGame[];
    getGames: () => TGame[];
    getGameById: (gameId: string) => TGame;
    addGame: (gameId: string, users: TUser[]) => void;
    addPlayerShips: (gameId: string, playerId: string, ships: TShip[]) => void;
    checkIsPlayersReady: (gameId: string) => boolean;
    getPlayers: (gameId: string) => TPlayer[];
    getPlayerById: (gameId: string, id: string) => TPlayer;
    updatePlayersTurns: (gameId: string, turn: string) => void;
    getAttackedPlayer: (gameId: string, playerId: string) => TPlayer;
    getEnemy: (gameId: string, playerId: string) => TPlayer;
    checkIsPositionAttacked: (value: { gameId: string, player: TPlayer, x: number, y: number }) => boolean;
    addPlayerShot: (value: { gameId: string, player: TPlayer, x: number, y: number }) => void;
    getGameIndex: (gameId: string) => number;
    setIsAttackedPosition: (value: { gameId: string, playerId: string, x: number, y: number, isAttacked: boolean }) => void;
    checkIsKilledShip: (value: { gameId: string, playerId: string, x: number, y: number }) => boolean;
    setShipKilled: (value: { gameId: string, playerId: string, x: number, y: number }) => void;
    getAttackedShip: (value: { gameId: string, playerId: string, x: number, y: number }) => TShip;
    changePlayerTurn: (gameId: string, playerId: string) => void;
    getNextTurnPlayerId: (gameId: string) => string;

    _winners: TWinner[];
    getWinners: () => TWinner[];
    setWinner: (name: string, playerId: string) => void;

    reset: () => void;
};

const database: TDatabase = {
    _users: [],
    getUsers: function () {
        return this._users
    },
    getUserById: function (id) {
        return this._users.find((user: TUser) => user.index === id)
    },
    addUser: function (user) {
        return this._users = [...this._users, user]
    },
    checkIsUserExists: function (name) {
        if (this._users.length) {
            return this._users.find((user: TUser) => user.name === name);
        }
        return false;
    },
    deleteUser: function (id) {
        return this._users = this._users.filter((user: TUser) => user.index !== id)
    },


    _rooms: [],
    getRooms: function () {
        return this._rooms
    },
    getRoomById: function (id) {
        return this._rooms.find((room: TRoom) => room.roomId === id)
    },
    checkIsUserInRoom: function (roomId, userName) {
        const room = this._rooms.find((room: TRoom) => room.roomId === roomId);
        return room.roomUsers.find((user: TUser) => user.name === userName)
    },
    checkIsExistsRoomWithUser: function (id) {
        return this._rooms.some((room: TRoom) => {
            return room.roomUsers.find((user: TUser) => user.index === id);
        });
    },
    addRoom: function (room) {
        return this._rooms = [...this._rooms, room];
    },
    addUserToRoom: function (roomId, newUser) {
        this._rooms = this._rooms.map((room: TRoom) => (
            room.roomId === roomId ? { ...room, roomUsers: [...room.roomUsers, newUser] } : room
        ));
    },
    getRoomUsers: function (roomId) {
        return this._rooms.find((room: TRoom) => room.roomId === roomId).roomUsers
    },
    deleteRoom: function (roomId) {
        this._rooms = this._rooms.filter((room: TRoom) => room.roomId !== roomId)
    },


    _games: [],
    getGames: function () {
        return this._games
    },
    getGameById: function (gameId) {
        return this._games.find((game: TGame) => game.gameId === gameId)
    },
    addGame: function (gameId, users) {
        this._games = [
            ...this._games,
            {
                gameId,
                players: users.map(user => ({
                    name: user.name,
                    indexPlayer: user.index,
                    ships: [],
                    turn: false,
                    shots: []
                }))
            }
        ]
    },
    addPlayerShips: function (gameId, playerId, ships) {
        this._games = this._games.map((game: TGame) => {
            if (game.gameId === gameId) {
                return {
                    ...game,
                    players: game.players.map(player => {
                        return player.indexPlayer === playerId ? {...player, ships} : player
                    })
                }
            }
            return game
        });
    },
    checkIsPlayersReady: function (gameId) {
        const players =  this._games.find((game: TGame) => game.gameId === gameId).players;
        return players.every((player: TPlayer) => player.ships.length > 0)
    },
    getPlayers: function (gameId) {
        return this._games.find((game: TGame) => game.gameId === gameId).players;
    },
    getPlayerById: function (gameId, id ) {
        const game = this.getGameById(gameId);
        return game.players.find((player: TPlayer) => player.indexPlayer === id);
    },
    updatePlayersTurns: function (gameId, turn) {
        this._games = this._games.map((game: TGame) => {
            if(game.gameId === gameId) {
                return {
                    ...game,
                    players: game.players.map(player => {
                        return { ...player, turn: player.indexPlayer === turn }
                    })
                }
            }

            return game;
        })
    },
    getAttackedPlayer: function (gameId, playerId) {
        return this.getPlayers(gameId).find((player: TPlayer) => player.indexPlayer === playerId)
    },
    getEnemy: function (gameId, playerId) {
        return this.getPlayers(gameId).find((player: TPlayer) => player.indexPlayer !== playerId)
    },
    checkIsPositionAttacked: function ({gameId, player, x, y}) {
        return this.getAttackedPlayer(gameId, player.indexPlayer).shots.find((shot: TPosition) => shot.x === x && shot.y === y)
    },
    addPlayerShot: function ({gameId, player, x, y}) {
        this.getAttackedPlayer(gameId, player.indexPlayer).shots.push({ y, x })
    },
    getGameIndex: function (gameId) {
        return this._games.findIndex((game: TGame) => game.gameId === gameId);
    },
    setIsAttackedPosition: function ({ gameId, playerId, x, y, isAttacked}) {
        const currentGame = this.getGameById(gameId);
        const currentGameIndex = this.getGameIndex(gameId);
        const enemy = this.getEnemy(gameId, playerId);
        const enemyIndex = currentGame.players.findIndex((player: TPlayer) => player.indexPlayer !== playerId);

        const attackedShipIndex = enemy.ships.findIndex((ship: TShip) => {
            return ship.targetPositions.some(position => position.x === x && position.y === y)
        });
        const attackedShip = enemy.ships.find((ship: TShip) => {
            return ship.targetPositions.some(position => position.x === x && position.y === y)
        });
        const attackedPosition = attackedShip.targetPositions.find((position: TPosition) => position.x === x && position.y === y)
        const attackedPositionIndex = attackedShip.targetPositions.findIndex((position: TPosition) => position.x === x && position.y === y)

        this._games[currentGameIndex].players[enemyIndex].ships[attackedShipIndex].targetPositions[attackedPositionIndex] = {
            ...attackedPosition,
            isAttacked
        }
    },
    checkIsKilledShip: function ({ gameId, playerId, x, y }) {
        const currentGame = this.getGameById(gameId);
        const enemy = this.getEnemy(gameId, playerId);
        const currentGameIndex = this.getGameIndex(gameId);
        const enemyIndex = currentGame.players.findIndex((player: TPlayer) => player.indexPlayer !== playerId);
        const attackedShipIndex = enemy.ships.findIndex((ship: TShip) => {
            return ship.targetPositions.some(position => position.x === x && position.y === y)
        });

        return this._games[currentGameIndex].players[enemyIndex].ships[attackedShipIndex].targetPositions.every((position: TPosition) => {
            return position.isAttacked
        })
    },
    setShipKilled: function ({ gameId, playerId, x, y }) {
        const currentGame = this.getGameById(gameId);
        const currentGameIndex = this.getGameIndex(gameId);
        const enemy = this.getEnemy(gameId, playerId);
        const enemyIndex = currentGame.players.findIndex((player: TPlayer) => player.indexPlayer !== playerId);
        const attackedShip = enemy.ships.find((ship: TShip) => {
            return ship.targetPositions.some(position => position.x === x && position.y === y)
        });
        const attackedShipIndex = enemy.ships.findIndex((ship: TShip) => {
            return ship.targetPositions.some(position => position.x === x && position.y === y)
        });

        this._games[currentGameIndex].players[enemyIndex].ships[attackedShipIndex] = {...attackedShip, isKilled: true}
    },
    getAttackedShip: function ({ gameId, playerId, x, y }) {
        const enemy = this.getEnemy(gameId, playerId);
        return enemy.ships.find((ship: TShip) => {
            return ship.targetPositions.some(position => position.x === x && position.y === y)
        });
    },
    changePlayerTurn: function (gameId, playerId) {
        const currentGame = this.getGameById(gameId);
        const currentGameIndex = this.getGameIndex(gameId);
        this._games[currentGameIndex].players = currentGame.players.map((player: TPlayer) => {
            return { ...player, turn: player.indexPlayer !== playerId }
        })
    },
    getNextTurnPlayerId: function (gameId) {
        const currentGameIndex = this.getGameIndex(gameId);
        return this._games[currentGameIndex].players.find((player: TPlayer) => player.turn).indexPlayer
    },


    _winners: [],
    getWinners: function () {
        return this._winners
    },
    setWinner: function (gameId, playerId) {
        const winners = this._winners;
        const attackedPlayer = this.getAttackedPlayer(gameId, playerId);
        const winnerIndex = winners.findIndex((winner: TWinner) => winner.name === attackedPlayer.name)
        const winner = winners.find((winner: TWinner) => winner.name === attackedPlayer.name)

        if(winner) {
            winners[winnerIndex] = { name: winner.name, wins: winner.wins++}
        } else {
            winners.push({ name: attackedPlayer.name, wins: 1})
        }
    },


    reset: function () {
        this._users = [];
        this._rooms = [];
        this._winners = [];
        this._games = [];
    }
}

export default database;
