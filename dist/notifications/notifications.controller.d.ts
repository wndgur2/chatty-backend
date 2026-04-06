import { NotificationsService } from './notifications.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    registerDevice(registerDeviceDto: RegisterDeviceDto): Promise<{
        status: string;
        message: string;
    }>;
}
