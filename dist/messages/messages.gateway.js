"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MessagesGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let MessagesGateway = MessagesGateway_1 = class MessagesGateway {
    server;
    logger = new common_1.Logger(MessagesGateway_1.name);
    async handleJoinRoom(data, client) {
        const roomName = `chatroom_${data.chatroomId}`;
        await client.join(roomName);
        this.logger.debug(`Client ${client.id} joined room ${roomName}`);
        return { event: 'joined', data: { room: data.chatroomId } };
    }
    async handleLeaveRoom(data, client) {
        const roomName = `chatroom_${data.chatroomId}`;
        await client.leave(roomName);
        this.logger.debug(`Client ${client.id} left room ${roomName}`);
        return { event: 'left', data: { room: data.chatroomId } };
    }
    streamChunkToRoom(chatroomId, chunk) {
        this.server.to(`chatroom_${chatroomId}`).emit('ai_message_chunk', {
            chatroomId,
            chunk,
        });
    }
    streamEndToRoom(chatroomId, content, messageId) {
        this.server.to(`chatroom_${chatroomId}`).emit('ai_message_complete', {
            chatroomId,
            content,
            messageId,
        });
    }
    emitTypingState(chatroomId, isTyping) {
        this.server.to(`chatroom_${chatroomId}`).emit('ai_typing_state', {
            chatroomId,
            isTyping,
        });
    }
};
exports.MessagesGateway = MessagesGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MessagesGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleLeaveRoom", null);
exports.MessagesGateway = MessagesGateway = MessagesGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], MessagesGateway);
//# sourceMappingURL=messages.gateway.js.map