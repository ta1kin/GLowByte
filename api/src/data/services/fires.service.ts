import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { AppLogger } from '../../common/logger/logger.service'

interface FireCSVRow {
	Склад?: string
	Штабель?: string
	'Дата составления'?: string
	Груз?: string
	'Вес по акту, тн'?: string
	'Дата начала'?: string
	'Дата окончания'?: string
	'Нач.форм.штабеля'?: string
}

@Injectable()
export class FiresService {
	private readonly logger = new AppLogger()
	private readonly CONTEXT = 'FiresService'

	constructor(private prisma: PrismaService) {}

	async processCSV(data: FireCSVRow[], uploadId: number) {
		let processed = 0
		let failed = 0
		const errors: Array<{ row: number; error: string }> = []

		this.logger.log(`Processing ${data.length} fire records`, this.CONTEXT, {
			uploadId,
			totalRows: data.length,
		})

		for (let i = 0; i < data.length; i++) {
			const row = data[i]
			const rowNumber = i + 2

			try {
				if (!row.Склад || !row['Дата начала'] || !row['Дата составления']) {
					failed++
					errors.push({
						row: rowNumber,
						error: 'Отсутствуют обязательные поля: Склад, Дата начала или Дата составления',
					})
					continue
				}

				const skladNumber = parseInt(row.Склад, 10)
				if (isNaN(skladNumber)) {
					failed++
					errors.push({
						row: rowNumber,
						error: `Неверный номер склада: ${row.Склад}`,
					})
					continue
				}

				const reportDate = this.parseDate(row['Дата составления'])
				const startDate = this.parseDate(row['Дата начала'])
				if (!reportDate || !startDate) {
					failed++
					errors.push({
						row: rowNumber,
						error: `Неверный формат даты: ${row['Дата составления']} или ${row['Дата начала']}`,
					})
					continue
				}

				const endDate = row['Дата окончания']
					? this.parseDate(row['Дата окончания'])
					: null
				const formedAt = row['Нач.форм.штабеля']
					? this.parseDate(row['Нач.форм.штабеля'])
					: null

				const weight_t = row['Вес по акту, тн']
					? parseFloat(row['Вес по акту, тн'].replace(/,/g, '.'))
					: null

				const duration_hours =
					endDate && startDate
						? (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
						: null

				await this.prisma.$transaction(async (tx) => {
					let sklad = await tx.sklad.findUnique({
						where: { number: skladNumber },
					})

					if (!sklad) {
						try {
							sklad = await tx.sklad.create({
								data: {
									number: skladNumber,
									name: `Склад ${skladNumber}`,
								},
							})
							this.logger.debug(`Создан новый склад: ${skladNumber}`, this.CONTEXT)
						} catch (error: any) {
							if (error.code === 'P2002') {
								sklad = await tx.sklad.findUnique({
									where: { number: skladNumber },
								})
								if (!sklad) {
									throw new Error(`Не удалось создать или найти склад ${skladNumber}`)
								}
							} else {
								throw error
							}
						}
					}

					let shtabelId: number | null = null
					if (row.Штабель) {
						const shtabelLabel = row.Штабель.trim()
						const shtabel = await tx.shtabel.findUnique({
							where: {
								skladId_label: {
									skladId: sklad.id,
									label: shtabelLabel,
								},
							},
						})

						if (shtabel) {
							shtabelId = shtabel.id

							await tx.shtabel.update({
								where: { id: shtabel.id },
								data: {
									status: 'FIRED',
								},
							})
						}
					}

					const fireRecord = await tx.fireRecord.create({
						data: {
							skladId: sklad.id,
							shtabelId: shtabelId,
							reportDate: reportDate,
							mark: row.Груз || null,
							weight_t: weight_t && !isNaN(weight_t) ? weight_t : null,
							startDate: startDate,
							endDate: endDate,
							formedAt: formedAt,
							duration_hours:
								duration_hours && !isNaN(duration_hours) ? duration_hours : null,
							damage_t: weight_t && !isNaN(weight_t) ? weight_t : null,
						},
					})

					// Обновляем предсказания с фактической датой возгорания для расчета метрик
					if (shtabelId) {
						const predictions = await tx.prediction.findMany({
							where: {
								shtabelId: shtabelId,
								actualFireDate: null,
								predictedDate: { not: null },
							},
						})

						for (const prediction of predictions) {
							if (prediction.predictedDate) {
								const accuracyDays = this.calculateAccuracyDays(
									startDate,
									prediction.predictedDate
								)
								const isAccurate = this.checkAccuracy(
									startDate,
									prediction.predictedDate
								)

								await tx.prediction.update({
									where: { id: prediction.id },
									data: {
										actualFireDate: startDate,
										accuracy_days: accuracyDays,
										isAccurate: isAccurate,
									},
								})
							}
						}
					}
				})

				processed++
			} catch (error) {
				failed++
				errors.push({
					row: rowNumber,
					error: error instanceof Error ? error.message : String(error),
				})
				this.logger.warn(
					`Failed to process fire row ${rowNumber}`,
					this.CONTEXT,
					{ error: error instanceof Error ? error.message : String(error), row }
				)
			}
		}

		this.logger.log(
			`Fire processing completed: ${processed} processed, ${failed} failed`,
			this.CONTEXT,
			{ uploadId, processed, failed }
		)

		return { processed, failed, errors: errors.slice(0, 100) }
	}

	/**
	 * Рассчитать точность предсказания в днях
	 */
	private calculateAccuracyDays(actualDate: Date, predictedDate: Date | null): number | null {
		if (!predictedDate) return null
		const diffMs = Math.abs(actualDate.getTime() - predictedDate.getTime())
		return diffMs / (1000 * 60 * 60 * 24)
	}

	/**
	 * Проверить, попадает ли предсказание в диапазон ±2 дня
	 */
	private checkAccuracy(actualDate: Date, predictedDate: Date | null): boolean | null {
		if (!predictedDate) return null
		const accuracyDays = this.calculateAccuracyDays(actualDate, predictedDate)
		return accuracyDays !== null && accuracyDays <= 2
	}

	private parseDate(dateString: string): Date | null {
		if (!dateString) return null

		const dateStr = dateString.trim()

		if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
			const date = new Date(dateStr)
			if (!isNaN(date.getTime())) return date
		}

		if (/^\d{2}\.\d{2}\.\d{4}/.test(dateStr)) {
			const [day, month, year] = dateStr.split('.')
			const date = new Date(`${year}-${month}-${day}`)
			if (!isNaN(date.getTime())) return date
		}

		if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
			const [day, month, year] = dateStr.split('/')
			const date = new Date(`${year}-${month}-${day}`)
			if (!isNaN(date.getTime())) return date
		}
		const date = new Date(dateStr)
		if (!isNaN(date.getTime())) return date

		return null
	}
}
