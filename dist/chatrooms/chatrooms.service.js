"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatroomsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let ChatroomsService = class ChatroomsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    currentUserId = BigInt(1);
    async saveProfileImage(file, baseUrl) {
        const assetsDir = path.join(process.cwd(), 'src', 'assets');
        if (!fs.existsSync(assetsDir)) {
            await fs.promises.mkdir(assetsDir, { recursive: true });
        }
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(assetsDir, fileName);
        await fs.promises.writeFile(filePath, file.buffer);
        return `${baseUrl}/assets/${fileName}`;
    }
    async findAll() {
        return this.prisma.chatroom.findMany({
            where: { userId: this.currentUserId },
        });
    }
    async create(dto, baseUrl, file) {
        let profileImageUrl = null;
        if (file) {
            profileImageUrl = await this.saveProfileImage(file, baseUrl);
        }
        return this.prisma.chatroom.create({
            data: {
                userId: this.currentUserId,
                name: dto.name,
                basePrompt: dto.basePrompt,
                profileImageUrl,
            },
        });
    }
    async findOne(id) {
        const chatroom = await this.prisma.chatroom.findFirst({
            where: { id: BigInt(id), userId: this.currentUserId },
        });
        if (!chatroom)
            throw new common_1.NotFoundException('Chatroom not found');
        return chatroom;
    }
    async update(id, dto, baseUrl, file) {
        const chatroom = await this.findOne(id);
        let profileImageUrl = chatroom.profileImageUrl;
        if (file) {
            profileImageUrl = await this.saveProfileImage(file, baseUrl);
        }
        return this.prisma.chatroom.update({
            where: { id: chatroom.id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.basePrompt && { basePrompt: dto.basePrompt }),
                profileImageUrl,
            },
        });
    }
    async remove(id) {
        const chatroom = await this.findOne(id);
        await this.prisma.chatroom.delete({ where: { id: chatroom.id } });
    }
    async clone(id) {
        const source = await this.findOne(id);
        return this.prisma.chatroom.create({
            data: {
                userId: source.userId,
                name: `${source.name} (Clone)`,
                basePrompt: source.basePrompt,
                profileImageUrl: source.profileImageUrl,
            },
        });
    }
    async branch(id) {
        const source = await this.findOne(id);
        return this.prisma.$transaction(async (tx) => {
            const newChatroom = await tx.chatroom.create({
                data: {
                    userId: source.userId,
                    name: `${source.name} (Branch)`,
                    basePrompt: source.basePrompt,
                    profileImageUrl: source.profileImageUrl,
                },
            });
            const messages = await tx.message.findMany({
                where: { chatroomId: source.id },
            });
            if (messages.length > 0) {
                await tx.message.createMany({
                    data: messages.map((m) => ({
                        chatroomId: newChatroom.id,
                        sender: m.sender,
                        content: m.content,
                        createdAt: m.createdAt,
                    })),
                });
            }
            return newChatroom;
        });
    }
};
exports.ChatroomsService = ChatroomsService;
exports.ChatroomsService = ChatroomsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatroomsService);
//# sourceMappingURL=chatrooms.service.js.map