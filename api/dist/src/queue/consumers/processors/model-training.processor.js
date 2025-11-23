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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelTrainingProcessor = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const prisma_service_1 = require("../../../../prisma/prisma.service");
const logger_service_1 = require("../../../common/logger/logger.service");
const ml_service_1 = require("../../../prediction/ml.service");
let ModelTrainingProcessor = class ModelTrainingProcessor {
    prisma;
    mlService;
    logger = new logger_service_1.AppLogger();
    CONTEXT = 'ModelTrainingProcessor';
    mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    constructor(prisma, mlService) {
        this.prisma = prisma;
        this.mlService = mlService;
    }
    async processTraining(modelName, modelVersion, config) {
        try {
            let modelArtifact = await this.prisma.modelArtifact.findFirst({
                where: {
                    name: modelName,
                    version: modelVersion,
                },
            });
            if (!modelArtifact) {
                modelArtifact = await this.prisma.modelArtifact.create({
                    data: {
                        name: modelName,
                        version: modelVersion,
                        status: 'TRAINING',
                        path: '',
                        trainingData: config,
                    },
                });
            }
            else {
                modelArtifact = await this.prisma.modelArtifact.update({
                    where: { id: modelArtifact.id },
                    data: {
                        status: 'TRAINING',
                        trainingData: config,
                    },
                });
            }
            this.logger.log(`Starting model training: ${modelName} v${modelVersion}`, this.CONTEXT, { modelArtifactId: modelArtifact.id, config });
            const response = await axios_1.default.post(`${this.mlServiceUrl}/train`, {
                model_name: modelName,
                model_version: modelVersion,
                config: config || {},
            }, {
                timeout: 7200000,
            });
            const trainingResult = response.data;
            await this.prisma.modelArtifact.update({
                where: { id: modelArtifact.id },
                data: {
                    status: trainingResult.success ? 'ACTIVE' : 'FAILED',
                    path: trainingResult.model_path || '',
                    fileSize: trainingResult.file_size
                        ? BigInt(trainingResult.file_size)
                        : null,
                    trainedAt: new Date(),
                    trainedBy: 'system',
                    trainingData: {
                        ...config,
                        trainingResult,
                    },
                    hyperparams: trainingResult.hyperparams,
                    trainMetrics: trainingResult.train_metrics,
                    valMetrics: trainingResult.val_metrics,
                    testMetrics: trainingResult.test_metrics,
                    meta: trainingResult.meta,
                },
            });
            if (trainingResult.metrics) {
                await this.prisma.metric.create({
                    data: {
                        modelName,
                        modelVersion,
                        periodStart: new Date(trainingResult.metrics.period_start),
                        periodEnd: new Date(trainingResult.metrics.period_end),
                        mae_days: trainingResult.metrics.mae_days,
                        rmse_days: trainingResult.metrics.rmse_days,
                        mape: trainingResult.metrics.mape,
                        accuracy_within_2d: trainingResult.metrics.accuracy_within_2d,
                        accuracy_within_3d: trainingResult.metrics.accuracy_within_3d,
                        accuracy_within_5d: trainingResult.metrics.accuracy_within_5d,
                        c_index: trainingResult.metrics.c_index,
                        precision: trainingResult.metrics.precision,
                        recall: trainingResult.metrics.recall,
                        f1_score: trainingResult.metrics.f1_score,
                        raw: trainingResult.metrics.raw,
                    },
                });
            }
            this.logger.log(`Model training completed: ${modelName} v${modelVersion}`, this.CONTEXT, {
                modelArtifactId: modelArtifact.id,
                success: trainingResult.success,
                metrics: trainingResult.metrics,
            });
        }
        catch (error) {
            try {
                await this.prisma.modelArtifact.updateMany({
                    where: {
                        name: modelName,
                        version: modelVersion,
                    },
                    data: {
                        status: 'FAILED',
                    },
                });
            }
            catch (updateError) {
                this.logger.error('Failed to update model artifact status', updateError instanceof Error
                    ? updateError.stack
                    : String(updateError), this.CONTEXT);
            }
            this.logger.error(`Model training failed: ${modelName} v${modelVersion}`, error instanceof Error ? error.stack : String(error), this.CONTEXT, { modelName, modelVersion, error });
            throw error;
        }
    }
};
exports.ModelTrainingProcessor = ModelTrainingProcessor;
exports.ModelTrainingProcessor = ModelTrainingProcessor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ml_service_1.MlService])
], ModelTrainingProcessor);
//# sourceMappingURL=model-training.processor.js.map