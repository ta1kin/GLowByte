// Временные enum до полной генерации Prisma Client после миграций
// Должны соответствовать enum в prisma/schema.prisma

export enum UploadStatus {
	PENDING = 'PENDING',
	PROCESSING = 'PROCESSING',
	COMPLETED = 'COMPLETED',
	FAILED = 'FAILED',
	PARTIAL = 'PARTIAL',
}

export enum FileType {
	SUPPLIES = 'SUPPLIES',
	FIRES = 'FIRES',
	TEMPERATURE = 'TEMPERATURE',
	WEATHER = 'WEATHER',
}

export enum ModelStatus {
	TRAINING = 'TRAINING',
	READY = 'READY',
	FAILED = 'FAILED',
	DEPRECATED = 'DEPRECATED',
}

export enum ShtabelStatus {
	ACTIVE = 'ACTIVE',
	SHIPPED = 'SHIPPED',
	FIRED = 'FIRED',
	ARCHIVED = 'ARCHIVED',
}

