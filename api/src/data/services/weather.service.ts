import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { AppLogger } from '../../common/logger/logger.service'

interface WeatherCSVRow {
	date?: string
	t?: string
	p?: string
	humidity?: string
	precipitation?: string
	wind_dir?: string
	v_avg?: string
	v_max?: string
	cloudcover?: string
	visibility?: string
	weather_code?: string
}

@Injectable()
export class WeatherService {
	private readonly logger = new AppLogger()
	private readonly CONTEXT = 'WeatherService'

	constructor(private prisma: PrismaService) {}

	async processCSV(data: WeatherCSVRow[], uploadId: number) {
		let processed = 0
		let failed = 0
		const errors: Array<{ row: number; error: string }> = []

		this.logger.log(`Processing ${data.length} weather records`, this.CONTEXT, {
			uploadId,
			totalRows: data.length,
		})

		for (let i = 0; i < data.length; i++) {
			const row = data[i]
			const rowNumber = i + 2

			try {
				if (!row.date) {
					failed++
					errors.push({
						row: rowNumber,
						error: 'Отсутствует обязательное поле: date',
					})
					continue
				}

				const ts = this.parseDate(row.date)
				if (!ts) {
					failed++
					errors.push({
						row: rowNumber,
						error: `Неверный формат даты: ${row.date}`,
					})
					continue
				}

				const parseFloatOrNull = (value: string | undefined): number | null => {
					if (!value || value.trim() === '' || value.toLowerCase() === 'null') {
						return null
					}
					const parsed = parseFloat(value.replace(/,/g, '.'))
					return isNaN(parsed) ? null : parsed
				}

				const parseIntOrNull = (value: string | undefined): number | null => {
					if (!value || value.trim() === '' || value.toLowerCase() === 'null') {
						return null
					}
					const parsed = parseInt(value, 10)
					return isNaN(parsed) ? null : parsed
				}

				await this.prisma.$transaction(async (tx) => {
					const existing = await tx.weather.findUnique({
						where: { ts },
					})

					if (existing) {
						await tx.weather.update({
							where: { ts },
							data: {
								t: parseFloatOrNull(row.t),
								p: parseFloatOrNull(row.p),
								humidity: parseFloatOrNull(row.humidity),
								precipitation: parseFloatOrNull(row.precipitation),
								wind_dir: parseIntOrNull(row.wind_dir),
								v_avg: parseFloatOrNull(row.v_avg),
								v_max: parseFloatOrNull(row.v_max),
								cloudcover: parseFloatOrNull(row.cloudcover),
								visibility: parseFloatOrNull(row.visibility),
								weather_code: parseIntOrNull(row.weather_code),
							},
						})
					} else {
						await tx.weather.create({
							data: {
								ts: ts,
								t: parseFloatOrNull(row.t),
								p: parseFloatOrNull(row.p),
								humidity: parseFloatOrNull(row.humidity),
								precipitation: parseFloatOrNull(row.precipitation),
								wind_dir: parseIntOrNull(row.wind_dir),
								v_avg: parseFloatOrNull(row.v_avg),
								v_max: parseFloatOrNull(row.v_max),
								cloudcover: parseFloatOrNull(row.cloudcover),
								visibility: parseFloatOrNull(row.visibility),
								weather_code: parseIntOrNull(row.weather_code),
							},
						})
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
					`Failed to process weather row ${rowNumber}`,
					this.CONTEXT,
					{ error: error instanceof Error ? error.message : String(error), row }
				)
			}
		}

		this.logger.log(
			`Weather processing completed: ${processed} processed, ${failed} failed`,
			this.CONTEXT,
			{ uploadId, processed, failed }
		)

		return { processed, failed, errors: errors.slice(0, 100) }
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

		if (/^\d+$/.test(dateStr)) {
			const timestamp = parseInt(dateStr, 10)
			if (timestamp > 0) {
				const date =
					timestamp < 10000000000
						? new Date(timestamp * 1000)
						: new Date(timestamp)
				if (!isNaN(date.getTime())) return date
			}
		}
		const date = new Date(dateStr)
		if (!isNaN(date.getTime())) return date

		return null
	}
}
