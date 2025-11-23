# API Endpoints Documentation

**Base URL:** `http://localhost:3000`  
**Swagger UI:** `http://localhost:3000/api/docs`

---

## 📊 Data Import (`/data`)

### 1. Upload CSV File

**POST** `/data/upload`

**Content-Type:** `multipart/form-data`

**Form Data:**

- `file`: CSV file (binary)
- `fileType`: `SUPPLIES` | `FIRES` | `TEMPERATURE` | `WEATHER`

**Example (cURL):**

```bash
curl -X POST http://localhost:3000/data/upload \
  -F "file=@/path/to/supplies.csv" \
  -F "fileType=SUPPLIES"
```

**Example (JavaScript/Fetch with FormData):**

```javascript
const formData = new FormData()
formData.append('file', fileInput.files[0])
formData.append('fileType', 'SUPPLIES')

const response = await fetch('http://localhost:3000/data/upload', {
	method: 'POST',
	body: formData,
})
const result = await response.json()
```

**Example Response:**

```json
{
	"success": true,
	"message": "Upload created and queued for processing",
	"data": {
		"id": 1,
		"filename": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.csv",
		"fileType": "SUPPLIES",
		"uploadedBy": null,
		"status": "PENDING",
		"rowsTotal": null,
		"rowsProcessed": null,
		"rowsFailed": null,
		"errors": null,
		"metadata": {
			"originalName": "supplies.csv",
			"mimeType": "text/csv",
			"size": 102400
		},
		"createdAt": "2025-11-22T19:00:00.000Z",
		"updatedAt": "2025-11-22T19:00:00.000Z"
	},
	"errors": null
}
```

---

### 2. Get All Uploads

**GET** `/data/uploads`

**Example (cURL):**

```bash
curl -X GET http://localhost:3000/data/uploads
```

**Example Response:**

```json
{
	"success": true,
	"message": "Uploads retrieved",
	"data": [
		{
			"id": 1,
			"filename": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.csv",
			"fileType": "SUPPLIES",
			"uploadedBy": null,
			"status": "COMPLETED",
			"rowsTotal": 1500,
			"rowsProcessed": 1500,
			"rowsFailed": 0,
			"errors": null,
			"metadata": {
				"originalName": "supplies.csv",
				"mimeType": "text/csv",
				"size": 102400
			},
			"createdAt": "2025-11-22T19:00:00.000Z",
			"updatedAt": "2025-11-22T19:05:00.000Z"
		},
		{
			"id": 2,
			"filename": "b2c3d4e5-f6g7-8901-bcde-f12345678901.csv",
			"fileType": "TEMPERATURE",
			"uploadedBy": null,
			"status": "PROCESSING",
			"rowsTotal": null,
			"rowsProcessed": null,
			"rowsFailed": null,
			"errors": null,
			"metadata": {
				"originalName": "temperature.csv",
				"mimeType": "text/csv",
				"size": 51200
			},
			"createdAt": "2025-11-22T19:10:00.000Z",
			"updatedAt": "2025-11-22T19:10:00.000Z"
		}
	],
	"errors": null
}
```

---

### 3. Get Upload by ID

**GET** `/data/uploads/:id`

**Example (cURL):**

```bash
curl -X GET http://localhost:3000/data/uploads/1
```

**Example Response:**

```json
{
	"success": true,
	"message": "Upload retrieved",
	"data": {
		"id": 1,
		"filename": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.csv",
		"fileType": "SUPPLIES",
		"uploadedBy": null,
		"status": "COMPLETED",
		"rowsTotal": 1500,
		"rowsProcessed": 1500,
		"rowsFailed": 0,
		"errors": null,
		"metadata": {
			"originalName": "supplies.csv",
			"mimeType": "text/csv",
			"size": 102400
		},
		"createdAt": "2025-11-22T19:00:00.000Z",
		"updatedAt": "2025-11-22T19:05:00.000Z"
	},
	"errors": null
}
```

---

## 📦 Stockpiles (`/stockpiles`)

### 4. Get All Stockpiles

**GET** `/stockpiles?skladId=1&status=ACTIVE&limit=100`

**Query Parameters:**

- `skladId` (optional): Filter by warehouse ID
- `status` (optional): Filter by status (`ACTIVE`, `SHIPPED`, `FIRED`, `ARCHIVED`)
- `limit` (optional): Limit results (default: 100)

**Example (cURL):**

```bash
curl -X GET "http://localhost:3000/stockpiles?skladId=1&status=ACTIVE&limit=50"
```

**Example (JavaScript/Fetch):**

```javascript
const params = new URLSearchParams({
	skladId: '1',
	status: 'ACTIVE',
	limit: '50',
})
const response = await fetch(`http://localhost:3000/stockpiles?${params}`)
const stockpiles = await response.json()
```

**Example Response:**

```json
{
	"success": true,
	"message": "Stockpiles retrieved",
	"data": [
		{
			"id": 1,
			"skladId": 1,
			"label": "ШТ-001",
			"mark": "A1",
			"formedAt": "2025-01-15T00:00:00.000Z",
			"height_m": 5.5,
			"width_m": 10.0,
			"length_m": 20.0,
			"mass_t": 1000.0,
			"status": "ACTIVE",
			"currentMass": 950.0,
			"lastTemp": 45.5,
			"lastTempDate": "2025-11-22T18:00:00.000Z",
			"createdAt": "2025-01-15T00:00:00.000Z",
			"updatedAt": "2025-11-22T18:00:00.000Z",
			"sklad": {
				"id": 1,
				"number": 1,
				"name": "Склад №1",
				"locationRaw": "Москва, ул. Промышленная, 10"
			}
		},
		{
			"id": 2,
			"skladId": 1,
			"label": "ШТ-002",
			"mark": "B2",
			"formedAt": "2025-02-01T00:00:00.000Z",
			"height_m": 6.0,
			"width_m": 12.0,
			"length_m": 25.0,
			"mass_t": 1500.0,
			"status": "ACTIVE",
			"currentMass": 1400.0,
			"lastTemp": 38.2,
			"lastTempDate": "2025-11-22T18:00:00.000Z",
			"createdAt": "2025-02-01T00:00:00.000Z",
			"updatedAt": "2025-11-22T18:00:00.000Z",
			"sklad": {
				"id": 1,
				"number": 1,
				"name": "Склад №1",
				"locationRaw": "Москва, ул. Промышленная, 10"
			}
		}
	],
	"errors": null
}
```

---

### 5. Get Stockpile by ID

**GET** `/stockpiles/:id`

**Example (cURL):**

```bash
curl -X GET http://localhost:3000/stockpiles/1
```

**Example Response:**

```json
{
	"success": true,
	"message": "Stockpile retrieved",
	"data": {
		"id": 1,
		"skladId": 1,
		"label": "ШТ-001",
		"mark": "A1",
		"formedAt": "2025-01-15T00:00:00.000Z",
		"height_m": 5.5,
		"width_m": 10.0,
		"length_m": 20.0,
		"mass_t": 1000.0,
		"status": "ACTIVE",
		"currentMass": 950.0,
		"lastTemp": 45.5,
		"lastTempDate": "2025-11-22T18:00:00.000Z",
		"createdAt": "2025-01-15T00:00:00.000Z",
		"updatedAt": "2025-11-22T18:00:00.000Z",
		"sklad": {
			"id": 1,
			"number": 1,
			"name": "Склад №1",
			"locationRaw": "Москва, ул. Промышленная, 10",
			"description": null
		}
	},
	"errors": null
}
```

---

### 6. Create Stockpile

**POST** `/stockpiles`

**Request Body:**

```json
{
	"skladId": 1,
	"label": "ШТ-001",
	"mark": "A1",
	"formedAt": "2025-01-15T00:00:00Z",
	"height_m": 5.5,
	"width_m": 10.0,
	"length_m": 20.0,
	"mass_t": 1000.0,
	"status": "ACTIVE"
}
```

**Example (cURL):**

```bash
curl -X POST http://localhost:3000/stockpiles \
  -H "Content-Type: application/json" \
  -d '{
    "skladId": 1,
    "label": "ШТ-001",
    "mark": "A1",
    "height_m": 5.5,
    "width_m": 10.0,
    "length_m": 20.0,
    "mass_t": 1000.0,
    "status": "ACTIVE"
  }'
```

**Example Response:**

```json
{
	"success": true,
	"message": "Stockpile created",
	"data": {
		"id": 1,
		"skladId": 1,
		"label": "ШТ-001",
		"mark": "A1",
		"formedAt": "2025-01-15T00:00:00.000Z",
		"height_m": 5.5,
		"width_m": 10.0,
		"length_m": 20.0,
		"mass_t": 1000.0,
		"status": "ACTIVE",
		"currentMass": null,
		"lastTemp": null,
		"lastTempDate": null,
		"createdAt": "2025-11-22T19:00:00.000Z",
		"updatedAt": "2025-11-22T19:00:00.000Z"
	},
	"errors": null
}
```

---

### 7. Update Stockpile

**PUT** `/stockpiles/:id`

**Request Body:**

```json
{
	"height_m": 6.0,
	"mass_t": 1200.0,
	"status": "ACTIVE"
}
```

**Example (cURL):**

```bash
curl -X PUT http://localhost:3000/stockpiles/1 \
  -H "Content-Type: application/json" \
  -d '{
    "height_m": 6.0,
    "mass_t": 1200.0
  }'
```

**Example Response:**

```json
{
	"success": true,
	"message": "Stockpile updated",
	"data": {
		"id": 1,
		"skladId": 1,
		"label": "ШТ-001",
		"mark": "A1",
		"formedAt": "2025-01-15T00:00:00.000Z",
		"height_m": 6.0,
		"width_m": 10.0,
		"length_m": 20.0,
		"mass_t": 1200.0,
		"status": "ACTIVE",
		"currentMass": 1150.0,
		"lastTemp": 45.5,
		"lastTempDate": "2025-11-22T18:00:00.000Z",
		"createdAt": "2025-01-15T00:00:00.000Z",
		"updatedAt": "2025-11-22T19:00:00.000Z"
	},
	"errors": null
}
```

---

### 8. Delete Stockpile

**DELETE** `/stockpiles/:id`

**Example (cURL):**

```bash
curl -X DELETE http://localhost:3000/stockpiles/1
```

**Example Response:**

```json
{
	"success": true,
	"message": "Stockpile deleted",
	"data": {
		"id": 1,
		"status": "ARCHIVED"
	},
	"errors": null
}
```

---

### 9. Get Stockpile Temperature History

**GET** `/stockpiles/:id/temperature?days=30`

**Query Parameters:**

- `days` (optional): Number of days (default: 30)

**Example (cURL):**

```bash
curl -X GET "http://localhost:3000/stockpiles/1/temperature?days=30"
```

**Example Response:**

```json
{
	"success": true,
	"message": "Temperature history retrieved",
	"data": [
		{
			"id": 1,
			"shtabelId": 1,
			"skladId": 1,
			"mark": "A1",
			"maxTemp": 45.5,
			"piket": "П-1",
			"recordDate": "2025-11-22T18:00:00.000Z",
			"shift": 1.0,
			"riskLevel": "MEDIUM",
			"createdAt": "2025-11-22T18:00:00.000Z"
		},
		{
			"id": 2,
			"shtabelId": 1,
			"skladId": 1,
			"mark": "A1",
			"maxTemp": 42.3,
			"piket": "П-2",
			"recordDate": "2025-11-21T18:00:00.000Z",
			"shift": 2.0,
			"riskLevel": "LOW",
			"createdAt": "2025-11-21T18:00:00.000Z"
		}
	],
	"errors": null
}
```

---

### 10. Get All Sklads (Warehouses)

**GET** `/stockpiles/sklads`

**Example (cURL):**

```bash
curl -X GET http://localhost:3000/stockpiles/sklads
```

**Example Response:**

```json
{
	"success": true,
	"message": "Sklads retrieved",
	"data": [
		{
			"id": 1,
			"number": 1,
			"name": "Склад №1",
			"locationRaw": "Москва, ул. Промышленная, 10",
			"description": null,
			"createdAt": "2025-01-01T00:00:00.000Z",
			"updatedAt": "2025-01-01T00:00:00.000Z",
			"_count": {
				"shtabels": 5,
				"fires": 2
			}
		},
		{
			"id": 2,
			"number": 2,
			"name": "Склад №2",
			"locationRaw": "Санкт-Петербург, ул. Заводская, 5",
			"description": null,
			"createdAt": "2025-01-01T00:00:00.000Z",
			"updatedAt": "2025-01-01T00:00:00.000Z",
			"_count": {
				"shtabels": 3,
				"fires": 0
			}
		}
	],
	"errors": null
}
```

---

### 11. Get Sklad by ID

**GET** `/stockpiles/sklads/:id`

**Example (cURL):**

```bash
curl -X GET http://localhost:3000/stockpiles/sklads/1
```

**Example Response:**

```json
{
	"success": true,
	"message": "Sklad retrieved",
	"data": {
		"id": 1,
		"number": 1,
		"name": "Склад №1",
		"locationRaw": "Москва, ул. Промышленная, 10",
		"description": null,
		"createdAt": "2025-01-01T00:00:00.000Z",
		"updatedAt": "2025-01-01T00:00:00.000Z",
		"_count": {
			"shtabels": 5,
			"fires": 2,
			"supplies": 150,
			"temps": 300
		}
	},
	"errors": null
}
```

---

### 12. Create Sklad

**POST** `/stockpiles/sklads`

**Request Body:**

```json
{
	"name": "Склад №1",
	"location": "Москва, ул. Промышленная, 10",
	"coordinates": {
		"lat": 55.7558,
		"lng": 37.6173
	}
}
```

**Example (cURL):**

```bash
curl -X POST http://localhost:3000/stockpiles/sklads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Склад №1",
    "location": "Москва, ул. Промышленная, 10"
  }'
```

**Example Response:**

```json
{
	"success": true,
	"message": "Sklad created",
	"data": {
		"id": 1,
		"number": 1,
		"name": "Склад №1",
		"locationRaw": "Москва, ул. Промышленная, 10",
		"description": null,
		"createdAt": "2025-11-22T19:00:00.000Z",
		"updatedAt": "2025-11-22T19:00:00.000Z"
	},
	"errors": null
}
```

---

### 13. Update Sklad

**PUT** `/stockpiles/sklads/:id`

**Request Body:**

```json
{
	"name": "Склад №1 (обновлен)"
}
```

**Example (cURL):**

```bash
curl -X PUT http://localhost:3000/stockpiles/sklads/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Склад №1 (обновлен)"}'
```

**Example Response:**

```json
{
	"success": true,
	"message": "Sklad updated",
	"data": {
		"id": 1,
		"number": 1,
		"name": "Склад №1 (обновлен)",
		"locationRaw": "Москва, ул. Промышленная, 10",
		"description": null,
		"createdAt": "2025-01-01T00:00:00.000Z",
		"updatedAt": "2025-11-22T19:00:00.000Z"
	},
	"errors": null
}
```

---

## 🔮 Predictions (`/predictions`)

### 14. Get All Predictions

**GET** `/predictions?shtabelId=1&skladId=1&riskLevel=HIGH&limit=100`

**Query Parameters:**

- `shtabelId` (optional): Filter by stockpile ID
- `skladId` (optional): Filter by warehouse ID
- `riskLevel` (optional): Filter by risk level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `limit` (optional): Limit results (default: 100)

**Example (cURL):**

```bash
curl -X GET "http://localhost:3000/predictions?shtabelId=1&riskLevel=HIGH"
```

**Example Response:**

```json
{
	"success": true,
	"message": "Predictions retrieved",
	"data": [
		{
			"id": 1,
			"ts": "2025-11-22T19:00:00.000Z",
			"skladId": 1,
			"shtabelId": 1,
			"modelName": "xgboost_v1",
			"modelVersion": "1.0.0",
			"predictedDate": "2025-11-29T00:00:00.000Z",
			"probEvent": 0.85,
			"riskLevel": "HIGH",
			"horizonDays": 7,
			"intervalLow": "2025-11-27T00:00:00.000Z",
			"intervalHigh": "2025-12-01T00:00:00.000Z",
			"confidence": 0.82,
			"actualFireDate": null,
			"accuracy_days": null,
			"isAccurate": null,
			"meta": {
				"features": ["temp", "mass", "age"],
				"modelParams": {}
			},
			"notified": false,
			"createdAt": "2025-11-22T19:00:00.000Z",
			"updatedAt": "2025-11-22T19:00:00.000Z",
			"shtabel": {
				"id": 1,
				"label": "ШТ-001",
				"mark": "A1",
				"sklad": {
					"id": 1,
					"number": 1,
					"name": "Склад №1"
				}
			}
		},
		{
			"id": 2,
			"ts": "2025-11-22T18:00:00.000Z",
			"skladId": 1,
			"shtabelId": 2,
			"modelName": "xgboost_v1",
			"modelVersion": "1.0.0",
			"predictedDate": "2025-12-05T00:00:00.000Z",
			"probEvent": 0.45,
			"riskLevel": "MEDIUM",
			"horizonDays": 7,
			"intervalLow": "2025-12-03T00:00:00.000Z",
			"intervalHigh": "2025-12-07T00:00:00.000Z",
			"confidence": 0.65,
			"actualFireDate": null,
			"accuracy_days": null,
			"isAccurate": null,
			"meta": {
				"features": ["temp", "mass", "age"],
				"modelParams": {}
			},
			"notified": false,
			"createdAt": "2025-11-22T18:00:00.000Z",
			"updatedAt": "2025-11-22T18:00:00.000Z",
			"shtabel": {
				"id": 2,
				"label": "ШТ-002",
				"mark": "B2",
				"sklad": {
					"id": 1,
					"number": 1,
					"name": "Склад №1"
				}
			}
		}
	],
	"errors": null
}
```

---

### 15. Get Prediction by ID

**GET** `/predictions/:id`

**Example (cURL):**

```bash
curl -X GET http://localhost:3000/predictions/1
```

**Example Response:**

```json
{
	"success": true,
	"message": "Prediction retrieved",
	"data": {
		"id": 1,
		"ts": "2025-11-22T19:00:00.000Z",
		"skladId": 1,
		"shtabelId": 1,
		"modelName": "xgboost_v1",
		"modelVersion": "1.0.0",
		"predictedDate": "2025-11-29T00:00:00.000Z",
		"probEvent": 0.85,
		"riskLevel": "HIGH",
		"horizonDays": 7,
		"intervalLow": "2025-11-27T00:00:00.000Z",
		"intervalHigh": "2025-12-01T00:00:00.000Z",
		"confidence": 0.82,
		"actualFireDate": null,
		"accuracy_days": null,
		"isAccurate": null,
		"meta": {
			"features": ["temp", "mass", "age"],
			"modelParams": {}
		},
		"notified": false,
		"createdAt": "2025-11-22T19:00:00.000Z",
		"updatedAt": "2025-11-22T19:00:00.000Z",
		"shtabel": {
			"id": 1,
			"label": "ШТ-001",
			"mark": "A1",
			"sklad": {
				"id": 1,
				"number": 1,
				"name": "Склад №1",
				"locationRaw": "Москва, ул. Промышленная, 10"
			}
		}
	},
	"errors": null
}
```

---

### 16. Create Prediction

**POST** `/predictions`

**Request Body:**

```json
{
	"shtabelId": 1,
	"horizonDays": 7
}
```

**Example (cURL):**

```bash
curl -X POST http://localhost:3000/predictions \
  -H "Content-Type: application/json" \
  -d '{
    "shtabelId": 1,
    "horizonDays": 7
  }'
```

**Note:** Прогноз создается асинхронно через очередь. Ответ содержит `jobId` для отслеживания статуса.

**Example Response:**

```json
{
	"success": true,
	"message": "Prediction queued for processing",
	"data": {
		"jobId": "prediction-job-12345",
		"shtabelId": 1,
		"horizonDays": 7,
		"status": "PENDING"
	},
	"errors": null
}
```

---

### 17. Batch Predictions (Calculate for All Active Stockpiles)

**POST** `/predictions/batch/calculate`

**Example (cURL):**

```bash
curl -X POST http://localhost:3000/predictions/batch/calculate
```

**Note:** Запускает массовое вычисление прогнозов для всех активных штабелей через очередь.

**Example Response:**

```json
{
	"success": true,
	"message": "Batch prediction queued",
	"data": {
		"jobId": "batch-prediction-job-67890",
		"activeStockpiles": 5,
		"status": "PENDING"
	},
	"errors": null
}
```

---

## 📈 Analytics (`/analytics`)

### 18. Get Model Metrics

**GET** `/analytics/metrics?modelName=default&periodDays=30`

**Query Parameters:**

- `modelName` (optional): Model name filter
- `periodDays` (optional): Period in days (default: 30)

**Example (cURL):**

```bash
curl -X GET "http://localhost:3000/analytics/metrics?modelName=default&periodDays=30"
```

**Example Response:**

```json
{
	"success": true,
	"message": "Model metrics retrieved",
	"data": [
		{
			"id": 1,
			"modelName": "xgboost_v1",
			"periodStart": "2025-10-23T00:00:00.000Z",
			"periodEnd": "2025-11-22T00:00:00.000Z",
			"accuracy": 0.75,
			"precision": 0.82,
			"recall": 0.68,
			"f1Score": 0.74,
			"mae": 1.5,
			"rmse": 2.1,
			"createdAt": "2025-11-22T00:00:00.000Z"
		},
		{
			"id": 2,
			"modelName": "xgboost_v1",
			"periodStart": "2025-09-23T00:00:00.000Z",
			"periodEnd": "2025-10-23T00:00:00.000Z",
			"accuracy": 0.72,
			"precision": 0.79,
			"recall": 0.65,
			"f1Score": 0.71,
			"mae": 1.8,
			"rmse": 2.4,
			"createdAt": "2025-10-23T00:00:00.000Z"
		}
	],
	"errors": null
}
```

---

### 19. Get Prediction Accuracy

**GET** `/analytics/accuracy`

**Example (cURL):**

```bash
curl -X GET http://localhost:3000/analytics/accuracy
```

**Example Response:**

```json
{
	"success": true,
	"message": "Prediction accuracy retrieved",
	"data": {
		"total": 100,
		"accurate": 75,
		"accuracy": 0.75,
		"byRiskLevel": {
			"HIGH": {
				"total": 30,
				"accurate": 25,
				"accuracy": 0.83
			},
			"MEDIUM": {
				"total": 40,
				"accurate": 30,
				"accuracy": 0.75
			},
			"LOW": {
				"total": 30,
				"accurate": 20,
				"accuracy": 0.67
			}
		},
		"byModel": {
			"xgboost_v1": {
				"total": 100,
				"accurate": 75,
				"accuracy": 0.75
			}
		}
	},
	"errors": null
}
```

---

### 20. Get Dashboard Statistics

**GET** `/analytics/dashboard`

**Example (cURL):**

```bash
curl -X GET http://localhost:3000/analytics/dashboard
```

**Example Response:**

```json
{
	"success": true,
	"message": "Dashboard statistics retrieved",
	"data": {
		"totalStockpiles": 15,
		"activeStockpiles": 12,
		"totalPredictions": 150,
		"highRiskPredictions": 25,
		"criticalRiskPredictions": 5,
		"recentFires": 3,
		"modelAccuracy": 0.75,
		"avgTemperature": 42.5,
		"maxTemperature": 65.0,
		"lastUpdate": "2025-11-22T19:00:00.000Z"
	},
	"errors": null
}
```

---

### 21. Get Risk Distribution

**GET** `/analytics/risk-distribution`

**Example (cURL):**

```bash
curl -X GET http://localhost:3000/analytics/risk-distribution
```

**Example Response:**

```json
{
	"success": true,
	"message": "Risk distribution retrieved",
	"data": {
		"LOW": 40,
		"MEDIUM": 60,
		"HIGH": 25,
		"CRITICAL": 5,
		"total": 130,
		"period": {
			"start": "2025-10-23T00:00:00.000Z",
			"end": "2025-11-22T00:00:00.000Z"
		}
	},
	"errors": null
}
```

---

### 22. Get Temperature Trends

**GET** `/analytics/temperature-trends?shtabelId=1&days=30`

**Query Parameters:**

- `shtabelId` (optional): Filter by stockpile ID
- `days` (optional): Number of days (default: 30)

**Example (cURL):**

```bash
curl -X GET "http://localhost:3000/analytics/temperature-trends?shtabelId=1&days=30"
```

**Example Response:**

```json
{
	"success": true,
	"message": "Temperature trends retrieved",
	"data": {
		"shtabelId": 1,
		"period": {
			"start": "2025-10-23T00:00:00.000Z",
			"end": "2025-11-22T00:00:00.000Z"
		},
		"trends": [
			{
				"date": "2025-11-22T00:00:00.000Z",
				"avgTemp": 45.5,
				"maxTemp": 48.2,
				"minTemp": 42.1,
				"count": 3
			},
			{
				"date": "2025-11-21T00:00:00.000Z",
				"avgTemp": 43.8,
				"maxTemp": 46.5,
				"minTemp": 40.2,
				"count": 3
			}
		],
		"summary": {
			"avgTemp": 44.2,
			"maxTemp": 48.2,
			"minTemp": 38.5,
			"trend": "increasing"
		}
	},
	"errors": null
}
```

---

## 🤖 ML Service (`/ml`)

### 23. Queue Model Training

**POST** `/ml/train`

**Request Body:**

```json
{
	"modelName": "default",
	"modelVersion": "1.0.0",
	"config": {
		"epochs": 100,
		"batchSize": 32
	}
}
```

**Example (cURL):**

```bash
curl -X POST http://localhost:3000/ml/train \
  -H "Content-Type: application/json" \
  -d '{
    "modelName": "default",
    "modelVersion": "1.0.0",
    "config": {}
  }'
```

**Example Response:**

```json
{
	"success": true,
	"message": "Model training queued",
	"data": {
		"jobId": "training-job-12345",
		"modelName": "default",
		"modelVersion": "1.0.0",
		"status": "PENDING"
	},
	"errors": null
}
```

---

### 24. Get All Models

**GET** `/ml/models`

**Example (cURL):**

```bash
curl -X GET http://localhost:3000/ml/models
```

**Example Response:**

```json
{
	"success": true,
	"message": "Models retrieved",
	"data": [
		{
			"id": 1,
			"name": "xgboost_v1",
			"version": "1.0.0",
			"status": "ACTIVE",
			"path": "/models/xgboost_v1_1.0.0.pkl",
			"fileSize": 5242880,
			"trainedAt": "2025-11-15T10:00:00.000Z",
			"trainedBy": "system",
			"trainingData": {
				"samples": 10000,
				"features": 50
			},
			"hyperparams": {
				"n_estimators": 100,
				"max_depth": 6
			},
			"metrics": {
				"accuracy": 0.75,
				"precision": 0.82,
				"recall": 0.68
			},
			"createdAt": "2025-11-15T10:00:00.000Z",
			"updatedAt": "2025-11-15T10:00:00.000Z"
		},
		{
			"id": 2,
			"name": "xgboost_v1",
			"version": "0.9.0",
			"status": "ARCHIVED",
			"path": "/models/xgboost_v1_0.9.0.pkl",
			"fileSize": 5120000,
			"trainedAt": "2025-10-01T10:00:00.000Z",
			"trainedBy": "system",
			"trainingData": {
				"samples": 8000,
				"features": 45
			},
			"hyperparams": {
				"n_estimators": 80,
				"max_depth": 5
			},
			"metrics": {
				"accuracy": 0.72,
				"precision": 0.78,
				"recall": 0.65
			},
			"createdAt": "2025-10-01T10:00:00.000Z",
			"updatedAt": "2025-10-01T10:00:00.000Z"
		}
	],
	"errors": null
}
```

---

### 25. Get Model Metrics

**GET** `/ml/metrics?modelName=default&limit=10`

**Query Parameters:**

- `modelName` (required): Model name
- `limit` (optional): Limit results (default: 10)

**Example (cURL):**

```bash
curl -X GET "http://localhost:3000/ml/metrics?modelName=default&limit=10"
```

**Example Response:**

```json
{
	"success": true,
	"message": "Model metrics retrieved",
	"data": [
		{
			"id": 1,
			"modelName": "xgboost_v1",
			"periodStart": "2025-11-15T00:00:00.000Z",
			"periodEnd": "2025-11-22T00:00:00.000Z",
			"accuracy": 0.75,
			"precision": 0.82,
			"recall": 0.68,
			"f1Score": 0.74,
			"mae": 1.5,
			"rmse": 2.1,
			"createdAt": "2025-11-22T00:00:00.000Z"
		}
	],
	"errors": null
}
```

---

## 🏥 System (`/`)

### 26. Root Endpoint

**GET** `/`

**Example (cURL):**

```bash
curl -X GET http://localhost:3000/
```

**Example Response:**

```json
{
	"success": true,
	"message": "Coal Fire Predictor API",
	"data": {
		"version": "1.0.0",
		"status": "running"
	},
	"errors": null
}
```

---

### 27. Health Check

**GET** `/health`

**Example (cURL):**

```bash
curl -X GET http://localhost:3000/health
```

**Example Response:**

```json
{
	"success": true,
	"message": "Health check",
	"data": {
		"status": "ok",
		"database": "connected",
		"timestamp": "2025-11-22T19:00:00.000Z"
	},
	"errors": null
}
```

---

## 📝 Response Format

Все ответы API следуют стандартному формату:

**Success Response:**

```json
{
	"success": true,
	"message": "Operation completed successfully",
	"data": { ... },
	"errors": null
}
```

**Error Response:**

```json
{
	"success": false,
	"message": "Error description",
	"data": null,
	"errors": [
		{
			"field": "fieldName",
			"message": "Error message"
		}
	]
}
```

---

## 📚 Swagger Documentation

Полная интерактивная документация доступна по адресу:
**http://localhost:3000/api/docs**

Там вы можете:

- Просмотреть все эндпоинты
- Протестировать запросы прямо в браузере
- Увидеть схемы данных и примеры
