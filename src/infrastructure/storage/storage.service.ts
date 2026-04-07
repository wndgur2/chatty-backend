import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  async saveProfileImage(
    file: Express.Multer.File,
    baseUrl: string,
  ): Promise<string> {
    const assetsDir = path.join(process.cwd(), 'src', 'assets');
    if (!fs.existsSync(assetsDir)) {
      await fs.promises.mkdir(assetsDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(assetsDir, fileName);
    await fs.promises.writeFile(filePath, file.buffer);
    return `${baseUrl}/assets/${fileName}`;
  }
}
