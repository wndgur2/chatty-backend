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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatroomsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const create_chatroom_dto_1 = require("./dto/create-chatroom.dto");
const update_chatroom_dto_1 = require("./dto/update-chatroom.dto");
const chatrooms_service_1 = require("./chatrooms.service");
let ChatroomsController = class ChatroomsController {
    chatroomsService;
    constructor(chatroomsService) {
        this.chatroomsService = chatroomsService;
    }
    async findAll() {
        return this.chatroomsService.findAll();
    }
    async create(createChatroomDto, file, req) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        return this.chatroomsService.create(createChatroomDto, baseUrl, file);
    }
    async findOne(chatroomId) {
        return this.chatroomsService.findOne(chatroomId);
    }
    async update(chatroomId, updateChatroomDto, file, req) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        return this.chatroomsService.update(chatroomId, updateChatroomDto, baseUrl, file);
    }
    async remove(chatroomId) {
        return this.chatroomsService.remove(chatroomId);
    }
    async clone(chatroomId) {
        return this.chatroomsService.clone(chatroomId);
    }
    async branch(chatroomId) {
        return this.chatroomsService.branch(chatroomId);
    }
};
exports.ChatroomsController = ChatroomsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatroomsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profileImage')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_chatroom_dto_1.CreateChatroomDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ChatroomsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':chatroomId'),
    __param(0, (0, common_1.Param)('chatroomId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChatroomsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':chatroomId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profileImage')),
    __param(0, (0, common_1.Param)('chatroomId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_chatroom_dto_1.UpdateChatroomDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ChatroomsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':chatroomId'),
    __param(0, (0, common_1.Param)('chatroomId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChatroomsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':chatroomId/clone'),
    __param(0, (0, common_1.Param)('chatroomId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChatroomsController.prototype, "clone", null);
__decorate([
    (0, common_1.Post)(':chatroomId/branch'),
    __param(0, (0, common_1.Param)('chatroomId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChatroomsController.prototype, "branch", null);
exports.ChatroomsController = ChatroomsController = __decorate([
    (0, common_1.Controller)('api/chatrooms'),
    __metadata("design:paramtypes", [chatrooms_service_1.ChatroomsService])
], ChatroomsController);
//# sourceMappingURL=chatrooms.controller.js.map