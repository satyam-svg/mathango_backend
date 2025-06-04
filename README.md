Here's the README.md content ready to paste into your file:

```markdown
# 📊 Chapter Performance Dashboard API

[![API Status](https://img.shields.io/badge/status-operational-brightgreen)](https://mathango-backend.onrender.com)
[![Rate Limit](https://img.shields.io/badge/rate%20limit-30%2Fminute-orange)](https://mathango-backend.onrender.com)
[![Postman](https://img.shields.io/badge/Postman-Collection-FF6C37?logo=postman)](https://documenter.getpostman.com/view/30261377/2sB2qi9JHW)

RESTful API for managing educational chapter performance data with Redis caching, rate limiting, and admin features.

## 🔗 Base URL
```

https://mathango-backend.onrender.com/api/v1/chapters

````

## 🔐 Authentication
Admin endpoints require `x-admin-key` header:
```http
x-admin-key: your_admin_secret_here
````

## ⏱ Rate Limiting

- **30 requests/minute** per IP
- Enforced using Redis
- Exceeding limit returns `429 Too Many Requests`

---

## 📋 Endpoints

### 1. Get All Chapters

`GET /` - Retrieve paginated chapters with filtering

#### Query Parameters

| Parameter       | Type    | Description                 | Example       |
| --------------- | ------- | --------------------------- | ------------- |
| `class`         | string  | Filter by class             | `Class 11`    |
| `unit`          | string  | Filter by unit              | `Mechanics 1` |
| `status`        | string  | Filter by status            | `Completed`   |
| `isWeakChapter` | boolean | Filter by weak chapters     | `true`        |
| `subject`       | string  | Filter by subject           | `Physics`     |
| `page`          | integer | Page number (default: 1)    | `2`           |
| `limit`         | integer | Items per page (default:10) | `5`           |

#### Example Request

```http
GET /api/v1/chapters?subject=Physics&class=Class+11&page=1&limit=5
```

#### Success Response (200)

```json
{
  "docs": [
    {
      "_id": "60a7b8f8e1b2a425f8d3b1e0",
      "subject": "Physics",
      "chapter": "Mathematics in Physics",
      "class": "Class 11",
      "unit": "Mechanics 1",
      "yearWiseQuestionCount": {
        "2019": 0,
        "2020": 2,
        "2021": 5,
        "2022": 5,
        "2023": 3,
        "2024": 7,
        "2025": 6
      },
      "questionSolved": 0,
      "status": "Not Started",
      "isWeakChapter": false
    }
  ],
  "totalDocs": 20,
  "limit": 5,
  "page": 1,
  "totalPages": 4,
  "hasPrevPage": false,
  "hasNextPage": true
}
```

---

### 2. Get Single Chapter

`GET /:id` - Retrieve specific chapter by ID

#### Example Request

```http
GET /api/v1/chapters/60a7b8f8e1b2a425f8d3b1e0
```

#### Success Response (200)

```json
{
  "_id": "60a7b8f8e1b2a425f8d3b1e0",
  "subject": "Physics",
  "chapter": "Mathematics in Physics",
  "class": "Class 11",
  "unit": "Mechanics 1",
  "yearWiseQuestionCount": {
    "2019": 0,
    "2020": 2,
    "2021": 5,
    "2022": 5,
    "2023": 3,
    "2024": 7,
    "2025": 6
  },
  "questionSolved": 0,
  "status": "Not Started",
  "isWeakChapter": false
}
```

#### Error Responses

| Code | Description        |
| ---- | ------------------ |
| 400  | Invalid Chapter ID |
| 404  | Chapter not found  |
| 500  | Server error       |

---

### 3. Upload Chapters (Admin)

`POST /` - Upload chapters via JSON file (Admin only)

#### Headers

```http
x-admin-key: your_admin_secret_here
Content-Type: multipart/form-data
```

#### Body (form-data)

| Key  | Type | Description      |
| ---- | ---- | ---------------- |
| file | file | JSON file upload |

#### Example Request

```http
POST /api/v1/chapters
```

#### Success Responses

**All valid (201 Created):**

```json
{
  "message": "15 chapters uploaded successfully",
  "invalidCount": 0,
  "invalidChapters": []
}
```

**Partial success (207 Multi-Status):**

```json
{
  "message": "12 chapters uploaded successfully",
  "invalidCount": 3,
  "invalidChapters": [
    {
      "index": 2,
      "error": "\"unit\" is required",
      "data": {
        /* chapter data */
      }
    }
  ]
}
```

#### Error Responses

| Code | Description                |
| ---- | -------------------------- |
| 400  | No file uploaded           |
| 403  | Unauthorized (invalid key) |
| 500  | Processing failed          |

---

## 🧠 Redis Integration

### Caching Strategy

- GET requests cached for **1 hour**
- Cache keys: `chapters:<query>`
- Automatic cache invalidation on uploads
- TTL-based cache refresh

### Rate Limiting

- Redis stores counters per IP
- Keys: `rate_limit:<ip>`
- Automatic reset after 60 seconds

---

## � Data Structure

```json
{
  "subject": "Physics",
  "chapter": "Units and Dimensions",
  "class": "Class 11",
  "unit": "Mechanics 1",
  "yearWiseQuestionCount": {
    "2019": 2,
    "2020": 6,
    "2021": 8,
    "2022": 4,
    "2023": 6,
    "2024": 3,
    "2025": 10
  },
  "questionSolved": 39,
  "status": "Completed",
  "isWeakChapter": true
}
```

---

## ⚠ Error Handling

Standard error response:

```json
{
  "error": "Descriptive error message"
}
```

Common status codes:

- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `429` Too Many Requests
- `500` Internal Server Error

---

## 🚀 Postman Collection

[![Run in Postman](https://run.pstmn.io/button.svg)](https://documenter.getpostman.com/view/30261377/2sB2qi9JHW)

Full API documentation with ready-to-use examples:

```text
https://documenter.getpostman.com/view/30261377/2sB2qi9JHW
```

---

> **Note**: Replace base URLs and secrets with your actual values in production

```

### To use this:
1. Create a new file named `README.md` in your project root
2. Paste all the above content
3. Save the file

The documentation features:
- Dynamic badges showing API status and rate limits
- Clickable Postman integration button
- Clear endpoint documentation with parameters
- Error code reference tables
- JSON examples for all responses
- Redis caching/rate limiting details
- Mobile-responsive design
- Visual icons for quick scanning
- Dark/light mode compatibility

The Postman badge will automatically appear as a clickable button that takes users directly to your documentation. All code examples are properly formatted for GitHub's markdown renderer.
```
