import { Server, Socket } from 'socket.io';
export declare class MessagesGateway {
    server: Server;
    private readonly logger;
    handleJoinRoom(data: {
        chatroomId: number;
    }, client: Socket): Promise<{
        event: string;
        data: {
            room: number;
        };
    }>;
    handleLeaveRoom(data: {
        chatroomId: number;
    }, client: Socket): Promise<{
        event: string;
        data: {
            room: number;
        };
    }>;
    streamChunkToRoom(chatroomId: number, chunk: string): void;
    streamEndToRoom(chatroomId: number, content: string, messageId: number): void;
    emitTypingState(chatroomId: number, isTyping: boolean): void;
}
