import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { AppLogger } from '../common/logger/logger.service';
import { successResponse, errorResponse } from '../common/helpers/api.response.helper';
import { FileType, UploadStatus } from '@prisma/client';

@Injectable()
export class DataService {
  private readonly logger = new AppLogger();
  private readonly CONTEXT = 'DataService';

  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

  async createUpload(filename: string, fileType: FileType, userId?: number) {
    try {
      const upload = await this.prisma.upload.create({
        data: {
          filename,
          fileType,
          uploadedBy: userId,
          status: 'PENDING',
        },
      });

      // Publish to queue for processing
      await this.queueService.publish('data.import', {
        uploadId: upload.id,
        filename,
        fileType,
      });

      return successResponse(upload, 'Upload created and queued for processing');
    } catch (error) {
      this.logger.error('Error creating upload', error.stack, this.CONTEXT);
      return errorResponse('Failed to create upload', error);
    }
  }

  async getUploads(userId?: number, limit = 50) {
    try {
      const uploads = await this.prisma.upload.findMany({
        where: userId ? { uploadedBy: userId } : undefined,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              telegramId: true,
              fullName: true,
            },
          },
        },
      });

      return successResponse(uploads, 'Uploads retrieved');
    } catch (error) {
      this.logger.error('Error getting uploads', error.stack, this.CONTEXT);
      return errorResponse('Failed to get uploads', error);
    }
  }

  async getUploadById(id: number) {
    try {
      const upload = await this.prisma.upload.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              telegramId: true,
              fullName: true,
            },
          },
        },
      });

      if (!upload) {
        return errorResponse('Upload not found');
      }

      return successResponse(upload, 'Upload retrieved');
    } catch (error) {
      this.logger.error('Error getting upload', error.stack, this.CONTEXT);
      return errorResponse('Failed to get upload', error);
    }
  }
}

