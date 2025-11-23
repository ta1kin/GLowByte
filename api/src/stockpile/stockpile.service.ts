import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { ShtabelStatus } from '../common/enums/prisma-enums'
import {
	errorResponse,
	successResponse,
} from '../common/helpers/api.response.helper'
import { AppLogger } from '../common/logger/logger.service'
import { CreateSkladDto, CreateStockpileDto, UpdateStockpileDto } from './dto'

@Injectable()
export class StockpileService {
	private readonly logger = new AppLogger()
	private readonly CONTEXT = 'StockpileService'

	constructor(private prisma: PrismaService) {}

	// ============================================
	// Склады (Sklad)
	// ============================================

	async getSklads() {
		try {
			const sklads = await this.prisma.sklad.findMany({
				orderBy: { number: 'asc' },
				include: {
					_count: {
						select: {
							shtabels: true,
							fires: true,
						},
					},
				},
			})

			return successResponse(sklads, 'Склады получены')
		} catch (error) {
			this.logger.error(
				'Ошибка при получении складов',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT
			)
			return errorResponse('Не удалось получить склады', error)
		}
	}

	async getSkladById(id: number) {
		try {
			const sklad = await this.prisma.sklad.findUnique({
				where: { id },
				include: {
					_count: {
						select: {
							shtabels: true,
							fires: true,
							supplies: true,
							temps: true,
						},
					},
				},
			})

			if (!sklad) {
				return errorResponse('Склад не найден')
			}

			return successResponse(sklad, 'Склад получен')
		} catch (error) {
			this.logger.error(
				'Ошибка при получении склада',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT
			)
			return errorResponse('Не удалось получить склад', error)
		}
	}

	async createSklad(dto: CreateSkladDto) {
		try {
			const existing = await this.prisma.sklad.findUnique({
				where: { number: dto.number },
			})

			if (existing) {
				return errorResponse(`Склад с номером ${dto.number} уже существует`)
			}

			const sklad = await this.prisma.sklad.create({
				data: {
					number: dto.number,
					name: dto.name || `Склад ${dto.number}`,
					locationRaw: dto.locationRaw,
					description: dto.description,
				},
			})

			this.logger.log(`Склад создан: ${sklad.id}`, this.CONTEXT, {
				skladId: sklad.id,
			})

			return successResponse(sklad, 'Склад создан')
		} catch (error) {
			this.logger.error(
				'Ошибка при создании склада',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT,
				{ dto }
			)
			return errorResponse('Не удалось создать склад', error)
		}
	}

	async updateSklad(id: number, dto: Partial<CreateSkladDto>) {
		try {
			const sklad = await this.prisma.sklad.findUnique({ where: { id } })

			if (!sklad) {
				return errorResponse('Склад не найден')
			}

			if (dto.number && dto.number !== sklad.number) {
				const existing = await this.prisma.sklad.findUnique({
					where: { number: dto.number },
				})

				if (existing) {
					return errorResponse(`Склад с номером ${dto.number} уже существует`)
				}
			}

			const updated = await this.prisma.sklad.update({
				where: { id },
				data: {
					...(dto.number && { number: dto.number }),
					...(dto.name !== undefined && { name: dto.name }),
					...(dto.locationRaw !== undefined && {
						locationRaw: dto.locationRaw,
					}),
					...(dto.description !== undefined && {
						description: dto.description,
					}),
				},
			})

			this.logger.log(`Склад обновлен: ${id}`, this.CONTEXT, { skladId: id })

			return successResponse(updated, 'Склад обновлен')
		} catch (error) {
			this.logger.error(
				'Ошибка при обновлении склада',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT,
				{ id, dto }
			)
			return errorResponse('Не удалось обновить склад', error)
		}
	}

	// ============================================
	// Штабели (Shtabel)
	// ============================================

	async getStockpiles(skladId?: number, status?: string, limit = 100) {
		try {
			const stockpiles = await this.prisma.shtabel.findMany({
				where: {
					...(skladId && { skladId }),
					...(status && { status: status as ShtabelStatus }),
				},
				include: {
					sklad: true,
					temps: {
						orderBy: { recordDate: 'desc' },
						take: 1,
					},
					predictions: {
						orderBy: { ts: 'desc' },
						take: 1,
					},
					_count: {
						select: {
							supplies: true,
							fires: true,
						},
					},
				},
				orderBy: { createdAt: 'desc' },
				take: limit,
			})

			return successResponse(stockpiles, 'Штабели получены')
		} catch (error) {
			this.logger.error(
				'Ошибка при получении штабелей',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT
			)
			return errorResponse('Не удалось получить штабели', error)
		}
	}

	async getStockpileById(id: number) {
		try {
			const stockpile = await this.prisma.shtabel.findUnique({
				where: { id },
				include: {
					sklad: true,
					supplies: {
						orderBy: { dateIn: 'desc' },
						take: 20,
					},
					temps: {
						orderBy: { recordDate: 'desc' },
						take: 50,
					},
					predictions: {
						orderBy: { ts: 'desc' },
						take: 10,
					},
					fires: {
						orderBy: { startDate: 'desc' },
						take: 10,
					},
				},
			})

			if (!stockpile) {
				return errorResponse('Штабель не найден')
			}

			return successResponse(stockpile, 'Штабель получен')
		} catch (error) {
			this.logger.error(
				'Ошибка при получении штабеля',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT
			)
			return errorResponse('Не удалось получить штабель', error)
		}
	}

	async createStockpile(dto: CreateStockpileDto) {
		try {
			const sklad = await this.prisma.sklad.findUnique({
				where: { id: dto.skladId },
			})

			if (!sklad) {
				return errorResponse(`Склад с id ${dto.skladId} не найден`)
			}

			const existing = await this.prisma.shtabel.findUnique({
				where: {
					skladId_label: {
						skladId: dto.skladId,
						label: dto.label,
					},
				},
			})

			if (existing) {
				return errorResponse(
					`Штабель с меткой "${dto.label}" уже существует в складе ${dto.skladId}`
				)
			}

			const stockpile = await this.prisma.shtabel.create({
				data: {
					skladId: dto.skladId,
					label: dto.label,
					mark: dto.mark,
					formedAt: dto.formedAt ? new Date(dto.formedAt) : null,
					height_m: dto.height_m,
					width_m: dto.width_m,
					length_m: dto.length_m,
					mass_t: dto.mass_t,
					currentMass: dto.mass_t,
					status: dto.status || ShtabelStatus.ACTIVE,
				},
				include: {
					sklad: true,
				},
			})

			this.logger.log(`Штабель создан: ${stockpile.id}`, this.CONTEXT, {
				stockpileId: stockpile.id,
				skladId: dto.skladId,
			})

			return successResponse(stockpile, 'Штабель создан')
		} catch (error) {
			this.logger.error(
				'Ошибка при создании штабеля',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT,
				{ dto }
			)
			return errorResponse('Не удалось создать штабель', error)
		}
	}

	async updateStockpile(id: number, dto: UpdateStockpileDto) {
		try {
			const stockpile = await this.prisma.shtabel.findUnique({ where: { id } })

			if (!stockpile) {
				return errorResponse('Штабель не найден')
			}

			if (
				(dto.skladId || dto.label) &&
				(dto.skladId !== stockpile.skladId || dto.label !== stockpile.label)
			) {
				const newSkladId = dto.skladId || stockpile.skladId
				const newLabel = dto.label || stockpile.label

				if (dto.skladId) {
					const sklad = await this.prisma.sklad.findUnique({
						where: { id: dto.skladId },
					})

					if (!sklad) {
						return errorResponse(`Склад с id ${dto.skladId} не найден`)
					}
				}

				const existing = await this.prisma.shtabel.findUnique({
					where: {
						skladId_label: {
							skladId: newSkladId,
							label: newLabel,
						},
					},
				})

				if (existing && existing.id !== id) {
					return errorResponse(
						`Штабель с меткой "${newLabel}" уже существует в складе ${newSkladId}`
					)
				}
			}

			const updated = await this.prisma.shtabel.update({
				where: { id },
				data: {
					...(dto.skladId && { skladId: dto.skladId }),
					...(dto.label && { label: dto.label }),
					...(dto.mark !== undefined && { mark: dto.mark }),
					...(dto.formedAt && { formedAt: new Date(dto.formedAt) }),
					...(dto.height_m !== undefined && { height_m: dto.height_m }),
					...(dto.width_m !== undefined && { width_m: dto.width_m }),
					...(dto.length_m !== undefined && { length_m: dto.length_m }),
					...(dto.mass_t !== undefined && { mass_t: dto.mass_t }),
					...(dto.currentMass !== undefined && {
						currentMass: dto.currentMass,
					}),
					...(dto.lastTemp !== undefined && { lastTemp: dto.lastTemp }),
					...(dto.lastTempDate !== undefined && {
						lastTempDate: dto.lastTempDate
							? new Date(dto.lastTempDate)
							: null,
					}),
					...(dto.status && { status: dto.status }),
				},
				include: {
					sklad: true,
				},
			})

			this.logger.log(`Штабель обновлен: ${id}`, this.CONTEXT, {
				stockpileId: id,
			})

			return successResponse(updated, 'Штабель обновлен')
		} catch (error) {
			this.logger.error(
				'Ошибка при обновлении штабеля',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT,
				{ id, dto }
			)
			return errorResponse('Не удалось обновить штабель', error)
		}
	}

	async deleteStockpile(id: number) {
		try {
			const stockpile = await this.prisma.shtabel.findUnique({ where: { id } })

			if (!stockpile) {
				return errorResponse('Штабель не найден')
			}

			const [suppliesCount, tempsCount, predictionsCount, firesCount] =
				await Promise.all([
					this.prisma.supply.count({ where: { shtabelId: id } }),
					this.prisma.tempRecord.count({ where: { shtabelId: id } }),
					this.prisma.prediction.count({ where: { shtabelId: id } }),
					this.prisma.fireRecord.count({ where: { shtabelId: id } }),
				])

			if (
				suppliesCount > 0 ||
				tempsCount > 0 ||
				predictionsCount > 0 ||
				firesCount > 0
			) {
				const archived = await this.prisma.shtabel.update({
					where: { id },
					data: { status: ShtabelStatus.ARCHIVED },
				})

				this.logger.log(`Штабель архивирован: ${id}`, this.CONTEXT, {
					stockpileId: id,
				})

				return successResponse(
					archived,
					'Штабель архивирован (имеет связанные данные)'
				)
			}

			await this.prisma.shtabel.delete({ where: { id } })

			this.logger.log(`Штабель удален: ${id}`, this.CONTEXT, {
				stockpileId: id,
			})

			return successResponse(null, 'Штабель удален')
		} catch (error) {
			this.logger.error(
				'Ошибка при удалении штабеля',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT,
				{ id }
			)
			return errorResponse('Не удалось удалить штабель', error)
		}
	}

	async getStockpileTemperatureHistory(shtabelId: number, days = 30) {
		try {
			const startDate = new Date()
			startDate.setDate(startDate.getDate() - days)

			const temps = await this.prisma.tempRecord.findMany({
				where: {
					shtabelId,
					recordDate: {
						gte: startDate,
					},
				},
				orderBy: { recordDate: 'asc' },
			})

			return successResponse(temps, 'История температуры получена')
		} catch (error) {
			this.logger.error(
				'Ошибка при получении истории температуры',
				error instanceof Error ? error.stack : String(error),
				this.CONTEXT
			)
			return errorResponse('Не удалось получить историю температуры', error)
		}
	}
}
