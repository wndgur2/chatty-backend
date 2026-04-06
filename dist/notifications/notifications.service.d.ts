import { PrismaService } from '../prisma/prisma.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly currentUserId;
    registerDevice(dto: RegisterDeviceDto): Promise<{
        status: string;
        message: string;
    }>;
}
