import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { AppLogger } from '../../common/logger/logger.service'

interface TemperatureCSVRow {
	Склад?: string
	Штабель?: string
	Марка?: string
	'Макс. температура'?: string
	Пикет?: string
	'Дата акта'?: string
	Смена?: string
}

@Injectable()
export class TemperatureService {
	private readonly logger = new AppLogger()
	private readonly CONTEXT = 'TemperatureService'

	constructor(private prisma: PrismaService) {}

	async processCSV(data: TemperatureCSVRow[], uploadId: number) {
		let processed = 0
		let failed = 0
		const errors: Array<{ row: number; error: string }> = []

		this.logger.log(
			`Processing ${data.length} temperature records`,
			this.CONTEXT,
			{ uploadId, totalRows: data.length }
		)

		for (let i = 0; i < data.length; i++) {
			const row = data[i]
			const rowNumber = i + 2

			try {
				if (
					!row.Склад ||
					!row.Штабель ||
					!row['Макс. температура'] ||
					!row['Дата акта']
				) {
					failed++
					errors.push({
						row: rowNumber,
						error:
							'Missing required fields: Склад, Штабель, Макс. температура, or Дата акта',
					})
					continue
				}

				const skladNumber = parseInt(row.Склад, 10)
				if (isNaN(skladNumber)) {
					failed++
					errors.push({
						row: rowNumber,
						error: `Invalid sklad number: ${row.Склад}`,
					})
					continue
				}

				const maxTemp = parseFloat(
					row['Макс. температура'].replace(/,/g, '.').replace(/[^\d.-]/g, '')
				)
				if (isNaN(maxTemp)) {
					failed++
					errors.push({
						row: rowNumber,
						error: `Неверная температура: ${row['Макс. температура']}`,
					})
					continue
				}

				const recordDate = this.parseDate(row['Дата акта'])
				if (!recordDate) {
					failed++
					errors.push({
						row: rowNumber,
						error: `Неверный формат даты: ${row['Дата акта']}`,
					})
					continue
				}

				const shift = row.Смена
					? parseFloat(row.Смена.replace(/,/g, '.'))
					: null

				if (!row.Штабель) {
					failed++
					errors.push({
						row: rowNumber,
						error: 'Отсутствует поле "Штабель"',
					})
					continue
				}

				const shtabelLabel = row.Штабель.trim()
				const riskLevel = this.calculateRiskLevel(maxTemp)

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
									throw new Error(`Failed to create or find sklad ${skladNumber}`)
								}
							} else {
								throw error
							}
						}
					}

					let shtabel = await tx.shtabel.findUnique({
						where: {
							skladId_label: {
								skladId: sklad.id,
								label: shtabelLabel,
							},
						},
					})

					if (!shtabel) {
						try {
							shtabel = await tx.shtabel.create({
								data: {
									skladId: sklad.id,
									label: shtabelLabel,
									mark: row.Марка || null,
								},
							})
							this.logger.debug(
								`Создан новый штабель: ${shtabelLabel} в складе ${skladNumber}`,
								this.CONTEXT
							)
						} catch (error: any) {
							if (error.code === 'P2002') {
								shtabel = await tx.shtabel.findUnique({
									where: {
										skladId_label: {
											skladId: sklad.id,
											label: shtabelLabel,
										},
									},
								})
								if (!shtabel) {
									throw new Error(
										`Failed to create or find shtabel ${shtabelLabel} in sklad ${skladNumber}`
									)
								}
							} else {
								throw error
							}
						}
					}

					await tx.shtabel.update({
						where: { id: shtabel.id },
						data: {
							mark: row.Марка || shtabel.mark,
							lastTemp: maxTemp,
							lastTempDate: recordDate,
						},
					})

					await tx.tempRecord.create({
						data: {
							skladId: sklad.id,
							shtabelId: shtabel.id,
							mark: row.Марка || null,
							maxTemp: maxTemp,
							piket: row.Пикет || null,
							recordDate: recordDate,
							shift: shift && !isNaN(shift) ? shift : null,
							riskLevel: riskLevel,
						},
					})
				})

				processed++
			} catch (error) {
				failed++
				errors.push({
					row: rowNumber,
					error: error instanceof Error ? error.message : String(error),
				})
				this.logger.warn(
					`Failed to process temperature row ${rowNumber}`,
					this.CONTEXT,
					{ error: error instanceof Error ? error.message : String(error), row }
				)
			}
		}

		this.logger.log(
			`Temperature processing completed: ${processed} processed, ${failed} failed`,
			this.CONTEXT,
			{ uploadId, processed, failed }
		)

		return { processed, failed, errors: errors.slice(0, 100) }
	}

	private calculateRiskLevel(temperature: number): string {
		if (temperature >= 80) return 'CRITICAL'
		if (temperature >= 60) return 'HIGH'
		if (temperature >= 40) return 'MEDIUM'
		return 'LOW'
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
