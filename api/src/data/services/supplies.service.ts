import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { AppLogger } from '../../common/logger/logger.service'

interface SupplyCSVRow {
	Склад?: string
	Штабель?: string
	ВыгрузкаНаСклад?: string
	'Наим. ЕТСНГ'?: string
	ПогрузкаНаСудно?: string
	'На склад, тн'?: string
	'На судно, тн'?: string
}

@Injectable()
export class SuppliesService {
	private readonly logger = new AppLogger()
	private readonly CONTEXT = 'SuppliesService'

	constructor(private prisma: PrismaService) {}

	async processCSV(data: SupplyCSVRow[], uploadId: number) {
		let processed = 0
		let failed = 0
		const errors: Array<{ row: number; error: string }> = []

		this.logger.log(`Processing ${data.length} supply records`, this.CONTEXT, {
			uploadId,
			totalRows: data.length,
		})

		for (let i = 0; i < data.length; i++) {
			const row = data[i]
			const rowNumber = i + 2

			try {
				if (!row.Склад || !row.Штабель || !row.ВыгрузкаНаСклад) {
					failed++
					errors.push({
						row: rowNumber,
						error:
							'Отсутствуют обязательные поля: Склад, Штабель или ВыгрузкаНаСклад',
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

				const dateIn = this.parseDate(row.ВыгрузкаНаСклад)
				if (!dateIn) {
					failed++
					errors.push({
						row: rowNumber,
						error: `Неверный формат даты: ${row.ВыгрузкаНаСклад}`,
					})
					continue
				}

				const dateShip = row.ПогрузкаНаСудно
					? this.parseDate(row.ПогрузкаНаСудно)
					: null

				const toStorage_t = row['На склад, тн']
					? parseFloat(row['На склад, тн'].replace(/,/g, '.'))
					: null
				const toShip_t = row['На судно, тн']
					? parseFloat(row['На судно, тн'].replace(/,/g, '.'))
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

				await this.prisma.$transaction(async tx => {
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
							this.logger.debug(
								`Создан новый склад: ${skladNumber}`,
								this.CONTEXT
							)
						} catch (error: any) {
							if (error.code === 'P2002') {
								sklad = await tx.sklad.findUnique({
									where: { number: skladNumber },
								})
								if (!sklad) {
									throw new Error(
										`Не удалось создать или найти склад ${skladNumber}`
									)
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
									mark: row['Наим. ЕТСНГ'] || null,
									formedAt: dateIn,
									mass_t: toStorage_t,
									currentMass: toStorage_t,
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
										`Не удалось создать или найти штабель ${shtabelLabel} в складе ${skladNumber}`
									)
								}
								await tx.shtabel.update({
									where: { id: shtabel.id },
									data: {
										mark: row['Наим. ЕТСНГ'] || shtabel.mark,
										currentMass: toStorage_t || shtabel.currentMass,
									},
								})
							} else {
								throw error
							}
						}
					} else {
						await tx.shtabel.update({
							where: { id: shtabel.id },
							data: {
								mark: row['Наим. ЕТСНГ'] || shtabel.mark,
								currentMass: toStorage_t || shtabel.currentMass,
							},
						})
					}

					await tx.supply.create({
						data: {
							skladId: sklad.id,
							shtabelId: shtabel.id,
							dateIn: dateIn,
							mark: row['Наим. ЕТСНГ'] || null,
							dateShip: dateShip,
							toStorage_t:
								toStorage_t && !isNaN(toStorage_t) ? toStorage_t : null,
							toShip_t: toShip_t && !isNaN(toShip_t) ? toShip_t : null,
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
					`Failed to process supply row ${rowNumber}`,
					this.CONTEXT,
					{ error: error instanceof Error ? error.message : String(error), row }
				)
			}
		}

		this.logger.log(
			`Supply processing completed: ${processed} processed, ${failed} failed`,
			this.CONTEXT,
			{ uploadId, processed, failed }
		)

		return { processed, failed, errors: errors.slice(0, 100) }
	}

	private parseDate(dateString: string): Date | null {
		if (!dateString) return null
		const formats = [
			/^\d{4}-\d{2}-\d{2}$/,
			/^\d{2}\.\d{2}\.\d{4}$/,
			/^\d{2}\/\d{2}\/\d{4}$/,
			/^\d{4}\.\d{2}\.\d{2}$/,
		]

		const dateStr = dateString.trim()

		if (formats[0].test(dateStr)) {
			const date = new Date(dateStr)
			if (!isNaN(date.getTime())) return date
		}

		if (formats[1].test(dateStr)) {
			const [day, month, year] = dateStr.split('.')
			const date = new Date(`${year}-${month}-${day}`)
			if (!isNaN(date.getTime())) return date
		}

		if (formats[2].test(dateStr)) {
			const [day, month, year] = dateStr.split('/')
			const date = new Date(`${year}-${month}-${day}`)
			if (!isNaN(date.getTime())) return date
		}

		if (formats[3].test(dateStr)) {
			const [year, month, day] = dateStr.split('.')
			const date = new Date(`${year}-${month}-${day}`)
			if (!isNaN(date.getTime())) return date
		}
		const date = new Date(dateStr)
		if (!isNaN(date.getTime())) return date

		return null
	}
}
