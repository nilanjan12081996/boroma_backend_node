# 🚗 Boroma Fleet & Vehicle Management - Complete API Documentation

> **Base URL:** `http://localhost:5000`  
> **Interactive Swagger UI:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)  
> **Swagger / OpenAPI 3.0 JSON:** [http://localhost:5000/api-docs.json](http://localhost:5000/api-docs.json) or [swagger.json](./swagger.json)  
> **Static Uploads URL:** `http://localhost:5000/uploads/<filename>`  

---

## 📑 Table of Contents
1. [Authentication & Authorization](#-authentication--authorization)
2. [Dev / Testing Helper: Generate Token](#-dev--testing-helper-generate-token)
3. [Admin APIs](#-admin-apis)
4. [Category APIs](#-category-apis)
5. [Vehicle Info APIs](#-vehicle-info-apis)
6. [Vehicle Image APIs (File Uploads)](#-vehicle-image-apis-file-uploads)
7. [Category Vehicle Mapping APIs](#-category-vehicle-mapping-apis)
8. [Master Vehicle Listing with Details](#-master-vehicle-listing-with-details)
9. [Frontend Integration Examples (Axios / Fetch)](#-frontend-integration-examples)
10. [Standard Response Structures](#-standard-response-structures)

---

## 🔐 Authentication & Authorization

Protected endpoints use JWT Bearer Authentication.

### Request Headers Required:
```http
Authorization: Bearer <YOUR_JWT_ACCESS_TOKEN>
Content-Type: application/json
```
*(For image uploads, omit manual `Content-Type` header so browser/Axios automatically sets `multipart/form-data` with correct boundary).*

### Role Requirement:
The user role encoded in the JWT token must be **`SUPERADMIN`**.
If the token is missing:
```json
{
  "success": false,
  "message": "Access Denied , Token is required"
}
```
If the token is invalid or expired:
```json
{
  "success": false,
  "message": "Invalid or expired token."
}
```
If the token has a role other than `SUPERADMIN`:
```json
{
  "success": false,
  "message": "Access Denied"
}
```

---

## ⚡ Dev / Testing Helper: Generate Token

Use this API to instantly obtain a valid 30-day `SUPERADMIN` JWT token to test endpoints in Swagger or in your frontend application.

### `POST /api/admin/generate-token` *(Also supports GET)*
- **Auth Required:** None (Public dev utility)
- **Request Headers:** `Content-Type: application/json`
- **Request Payload (Optional):**
```json
{
  "role": "SUPERADMIN",
  "email": "admin@boroma.com",
  "id": 1
}
```
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "SUPERADMIN test token generated successfully for frontend & Swagger testing",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "authorization_header": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "decoded_payload": {
    "id": 1,
    "email": "admin@boroma.com",
    "role": "SUPERADMIN",
    "expiresIn": "30 days"
  }
}
```

---

## 👤 Admin APIs

### 1. Get All Admins
- **Method & URL:** `GET /api/admin/admins` *(Alias: `/api/api/admin/admins`)*
- **Auth Required:** None
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Admins fetched successfully",
  "data": [
    {
      "id": 1,
      "full_name": "Admin User",
      "email": "admin@boroma.com",
      "role_id": 1,
      "mobile": "9876543210",
      "avatar": "admin-avatar.jpg",
      "status_id": 1,
      "is_active": 1,
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z",
      "otp_verified": 1,
      "is_verified": 1
    }
  ]
}
```

---

## 🏷️ Category APIs

All Category endpoints require `Authorization: Bearer <token>` with `role: "SUPERADMIN"`.

### 1. Create Category
- **Method & URL:** `POST /api/category/save`
- **Request Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Payload (JSON Body):**
```json
{
  "category_name": "Sedan",
  "short_name": "sedan"
}
```
| Field | Type | Required | Description |
|---|---|---|---|
| `category_name` | String | Yes | Name of category (e.g. "Sedan", "SUV", "Hatchback") |
| `short_name` | String | Yes | Short slug/code (e.g. "sedan", "suv") |

- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Category created Successfully",
  "data": {
    "id": 1,
    "category_name": "Sedan",
    "short_name": "sedan",
    "status": 1
  }
}
```
- **Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "All fields Are required"
}
```

---

### 2. Get All Categories
- **Method & URL:** `GET /api/category/get`
- **Request Headers:** `Authorization: Bearer <token>`
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "data": [
    {
      "id": 1,
      "category_name": "Sedan",
      "short_name": "sedan",
      "status": 1
    },
    {
      "id": 2,
      "category_name": "SUV",
      "short_name": "suv",
      "status": 1
    }
  ]
}
```

---

### 3. Get Category By ID
- **Method & URL:** `GET /api/category/get/:id`
- **URL Parameter:** `id` (integer) - Example: `/api/category/get/1`
- **Request Headers:** `Authorization: Bearer <token>`
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "data": {
    "id": 1,
    "category_name": "Sedan",
    "short_name": "sedan",
    "status": 1
  }
}
```
- **Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Category Not Found"
}
```

---

### 4. Update Category
- **Method & URL:** `PUT /api/category/update/:id`
- **URL Parameter:** `id` (integer) - Example: `/api/category/update/1`
- **Request Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Payload (JSON Body):**
```json
{
  "category_name": "Luxury Sedan",
  "short_name": "lux-sedan"
}
```
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "id": 1,
    "category_name": "Luxury Sedan",
    "short_name": "lux-sedan",
    "status": 1
  }
}
```
- **Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Category not found"
}
```

---

### 5. Delete Category
- **Method & URL:** `DELETE /api/category/delete/:id`
- **URL Parameter:** `id` (integer) - Example: `/api/category/delete/1`
- **Request Headers:** `Authorization: Bearer <token>`
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

### 6. Toggle Category Status
- **Method & URL:** `PATCH /api/category/:id/toggle-status`
- **URL Parameter:** `id` (integer) - Example: `/api/category/1/toggle-status`
- **Request Headers:** `Authorization: Bearer <token>`
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Category status updated Successfully",
  "data": {
    "id": 1,
    "category_name": "Luxury Sedan",
    "status": 0
  }
}
```

---

## 🚙 Vehicle Info APIs

All Vehicle Info endpoints require `Authorization: Bearer <token>` with `role: "SUPERADMIN"`.

### 1. Create Vehicle Info
- **Method & URL:** `POST /api/vehicle-info/save`
- **Request Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Payload (JSON Body):**
```json
{
  "vehicle_no": "WB02AK1234",
  "no_of_seat": 5,
  "status": 1
}
```
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `vehicle_no` | String | Yes | - | Unique registration plate number |
| `no_of_seat` | Number | No | null | Number of passenger seats |
| `status` | Number | No | 1 | `1` for Active, `0` for Inactive |

- **Response Payload (201 Created):**
```json
{
  "success": true,
  "message": "Vehicle info created successfully",
  "data": {
    "id": 1,
    "vehicle_no": "WB02AK1234",
    "no_of_seat": 5,
    "status": 1
  }
}
```
- **Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Vehicle number is required"
}
```
- **Error Response (409 Conflict):**
```json
{
  "success": false,
  "message": "Vehicle with this vehicle number already exists"
}
```

---

### 2. Get All Vehicles
- **Method & URL:** `GET /api/vehicle-info/get`
- **Request Headers:** `Authorization: Bearer <token>`
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Vehicles fetched successfully",
  "data": [
    {
      "id": 1,
      "vehicle_no": "WB02AK1234",
      "no_of_seat": 5,
      "status": 1
    }
  ]
}
```

---

### 3. Get Vehicle By ID
- **Method & URL:** `GET /api/vehicle-info/get/:id`
- **URL Parameter:** `id` (integer) - Example: `/api/vehicle-info/get/1`
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Vehicle fetched successfully",
  "data": {
    "id": 1,
    "vehicle_no": "WB02AK1234",
    "no_of_seat": 5,
    "status": 1
  }
}
```

---

### 4. Update Vehicle Info
- **Method & URL:** `PUT /api/vehicle-info/update/:id`
- **URL Parameter:** `id` (integer) - Example: `/api/vehicle-info/update/1`
- **Request Payload (JSON Body):**
```json
{
  "vehicle_no": "WB02AK9999",
  "no_of_seat": 7,
  "status": 1
}
```
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Vehicle info updated successfully",
  "data": {
    "id": 1,
    "vehicle_no": "WB02AK9999",
    "no_of_seat": 7,
    "status": 1
  }
}
```

---

### 5. Delete Vehicle Info
- **Method & URL:** `DELETE /api/vehicle-info/delete/:id`
- **URL Parameter:** `id` (integer) - Example: `/api/vehicle-info/delete/1`
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Vehicle info deleted successfully"
}
```

---

### 6. Toggle Vehicle Status
- **Method & URL:** `PATCH /api/vehicle-info/:id/toggle-status`
- **URL Parameter:** `id` (integer) - Example: `/api/vehicle-info/1/toggle-status`
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Vehicle status updated successfully",
  "data": {
    "id": 1,
    "vehicle_no": "WB02AK9999",
    "status": 0
  }
}
```

---

## 📷 Vehicle Image APIs (File Uploads)

All Vehicle Image endpoints require `Authorization: Bearer <token>` with `role: "SUPERADMIN"`.

### 1. Upload Vehicle Images (Single or Multiple)
- **Method & URL:** `POST /api/vehicle-image/save`
- **Request Headers:**
  - `Authorization: Bearer <token>`
  - Content-Type: `multipart/form-data`
- **Request Payload (Form-Data):**
| Key | Type | Required | Description |
|---|---|---|---|
| `vehicle_id` | Text / Integer | Yes | ID of existing vehicle (e.g. `1`) |
| `images` | File(s) | Yes* | Select 1 or up to 20 images (jpg, png, webp) |
| `image` | File(s) | Yes* | Alternative field name for images |

- **Response Payload (201 Created):**
```json
{
  "success": true,
  "message": "Vehicle images created successfully",
  "data": [
    {
      "id": 1,
      "vehicle_id": "1",
      "image": "1740000000000-front.png"
    },
    {
      "id": 2,
      "vehicle_id": "1",
      "image": "1740000000001-back.png"
    }
  ]
}
```

---

### 2. Get All Vehicle Images
- **Method & URL:** `GET /api/vehicle-image/get`
- **Query Parameter (Optional):** `?vehicle_id=1`
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Vehicle images fetched successfully",
  "data": [
    {
      "id": 1,
      "vehicle_id": 1,
      "image": "1740000000000-front.png",
      "status": 1
    }
  ]
}
```

---

### 3. Get Images By Vehicle ID
- **Method & URL:** `GET /api/vehicle-image/vehicle/:vehicle_id`
- **URL Parameter:** `vehicle_id` (integer) - Example: `/api/vehicle-image/vehicle/1`
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Vehicle images fetched successfully",
  "data": [
    {
      "id": 1,
      "vehicle_id": 1,
      "image": "1740000000000-front.png",
      "status": 1
    }
  ]
}
```

---

### 4. Update Vehicle Image
- **Method & URL:** `PUT /api/vehicle-image/update/:id`
- **URL Parameter:** `id` (integer) - Record ID
- **Payload:** `multipart/form-data` or `application/json`
  - `image`: New binary file (optional)
  - `vehicle_id`: Integer (optional)
  - `status`: `1` or `0` (optional)
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Vehicle image updated successfully",
  "data": {
    "id": 1,
    "vehicle_id": 1,
    "image": "1740000000005-new.png",
    "status": 1
  }
}
```

---

### 5. Delete Vehicle Image
- **Method & URL:** `DELETE /api/vehicle-image/delete/:id`
- **URL Parameter:** `id` (integer)
- **Note:** Deletes the record from database and safely deletes the image file from server disk (`/uploads`).
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Vehicle image deleted successfully"
}
```

---

### 6. Toggle Vehicle Image Status
- **Method & URL:** `PATCH /api/vehicle-image/:id/toggle-status`
- **URL Parameter:** `id` (integer)
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Vehicle image status updated successfully",
  "data": {
    "id": 1,
    "vehicle_id": 1,
    "image": "1740000000000-front.png",
    "status": 0
  }
}
```

---

## 🔗 Category Vehicle Mapping APIs

Map vehicles to one or multiple categories.  
Base paths supported: `/api/category-vehicle-map` and `/api/category-vehical-map`.

### 1. Map Vehicle To Categories (Single or Bulk)
- **Method & URL:** `POST /api/category-vehicle-map/save`
- **Request Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Payload (JSON Body):**
```json
{
  "vehicle_id": 1,
  "category_id": [1, 2, 3],
  "status": 1,
  "replace": false
}
```
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `vehicle_id` | Integer | Yes | - | ID of the vehicle |
| `category_id` | Array / Comma string / Integer | Yes | - | e.g. `[1, 2, 3]` or `"1,2,3"` or `1` |
| `status` | Integer | No | 1 | Status (`1` Active, `0` Inactive) |
| `replace` | Boolean | No | false | If `true`, removes existing category mappings for this vehicle and replaces them with the new list |

- **Response Payload (201 Created):**
```json
{
  "success": true,
  "message": "Vehicle and categories mapped successfully",
  "created_count": 3,
  "already_mapped_category_ids": [],
  "missing_category_ids": [],
  "data": [
    {
      "id": 1,
      "vehicle_id": 1,
      "category_id": 1,
      "status": 1
    },
    {
      "id": 2,
      "vehicle_id": 1,
      "category_id": 2,
      "status": 1
    },
    {
      "id": 3,
      "vehicle_id": 1,
      "category_id": 3,
      "status": 1
    }
  ]
}
```
- **Error Response (409 Conflict):**
```json
{
  "success": false,
  "message": "All provided categories are already mapped to this vehicle",
  "already_mapped_category_ids": [1, 2, 3]
}
```

---

### 2. Get All Mappings
- **Method & URL:** `GET /api/category-vehicle-map/get`
- **Optional Query Filters:**
  - `?vehicle_id=1`
  - `?category_id=2`
  - `?status=1`
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Category vehicle mappings fetched successfully",
  "total": 1,
  "data": [
    {
      "id": 1,
      "vehicle_id": 1,
      "category_id": 1,
      "status": 1,
      "category": {
        "id": 1,
        "category_name": "SUV",
        "short_name": "suv"
      },
      "vehicle": {
        "id": 1,
        "vehicle_no": "WB02AK1234",
        "no_of_seat": 5
      }
    }
  ]
}
```

---

### 3. Get All Categories For A Specific Vehicle
- **Method & URL:** `GET /api/category-vehicle-map/vehicle/:vehicle_id`
- **URL Parameter:** `vehicle_id` (integer) - Example: `/api/category-vehicle-map/vehicle/1`
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Categories for vehicle fetched successfully",
  "total": 2,
  "data": [ ... ]
}
```

---

### 4. Get All Vehicles For A Specific Category
- **Method & URL:** `GET /api/category-vehicle-map/category/:category_id`
- **URL Parameter:** `category_id` (integer) - Example: `/api/category-vehicle-map/category/1`
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Vehicles for category fetched successfully",
  "total": 4,
  "data": [ ... ]
}
```

---

### 5. Remove Categories From A Vehicle
- **Method & URL:** `DELETE /api/category-vehicle-map/vehicle/:vehicle_id/remove`
- **URL Parameter:** `vehicle_id` (integer) - Example: `/api/category-vehicle-map/vehicle/1/remove`
- **Request Payload (JSON Body - Optional):**
```json
{
  "category_id": [2, 3]
}
```
*(If payload is empty, removes ALL category mappings from this vehicle).*
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "2 mapping(s) removed successfully",
  "deleted_count": 2
}
```

---

### 6. Toggle Mapping Status
- **Method & URL:** `PATCH /api/category-vehicle-map/:id/toggle-status`
- **URL Parameter:** `id` (integer)
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Mapping status updated successfully",
  "data": {
    "id": 1,
    "vehicle_id": 1,
    "category_id": 2,
    "status": 0
  }
}
```

---

## 🌟 Master Vehicle Listing with Details

This is the ultimate API for frontend cards, tables, vehicle catalog, and vehicle detail views. It returns the vehicle info, all its mapped categories, and all uploaded images with direct displayable URLs.

### 1. Master Vehicle Catalog Listing
- **Method & URL:**
  - `GET /api/vehicle-info/details`
  - *(Aliases: `/api/category-vehicle-map/vehicle-details` or `/api/category-vehicle-map/details`)*
- **Query Parameters (All Optional):**
  - `search`: Filter vehicle number (partial string match, e.g. `?search=WB`)
  - `category_id`: Filter vehicles assigned to a specific category (e.g. `?category_id=1`)
  - `status`: Filter by status (e.g. `?status=1`)
  - `vehicle_id`: Return single vehicle by ID
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Vehicles listing fetched successfully",
  "total": 1,
  "data": [
    {
      "id": 1,
      "vehicle_no": "WB02AK1234",
      "no_of_seat": 5,
      "status": 1,
      "total_categories": 2,
      "categories": [
        {
          "id": 1,
          "category_name": "SUV",
          "short_name": "suv",
          "status": 1,
          "mapping_id": 10,
          "map_status": 1
        },
        {
          "id": 2,
          "category_name": "Luxury",
          "short_name": "luxury",
          "status": 1,
          "mapping_id": 11,
          "map_status": 1
        }
      ],
      "total_images": 2,
      "images": [
        {
          "id": 1,
          "image": "1740000000000-front.png",
          "image_url": "http://localhost:5000/uploads/1740000000000-front.png",
          "status": 1
        },
        {
          "id": 2,
          "image": "1740000000001-side.png",
          "image_url": "http://localhost:5000/uploads/1740000000001-side.png",
          "status": 1
        }
      ]
    }
  ]
}
```

---

### 2. Single Vehicle Full Details
- **Method & URL:**
  - `GET /api/vehicle-info/details/:id`
  - *(Aliases: `/api/category-vehicle-map/vehicle-details/:vehicle_id` or `/api/category-vehicle-map/details/:vehicle_id`)*
- **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Vehicle details fetched successfully",
  "data": {
    "id": 1,
    "vehicle_no": "WB02AK1234",
    "no_of_seat": 5,
    "status": 1,
    "total_categories": 2,
    "categories": [ ... ],
    "total_images": 2,
    "images": [ ... ]
  }
}
```

---

## 💻 Frontend Integration Examples

### Axios Setup & Interceptor (React / Vue / Next.js)

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Automatically inject Bearer Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### 1. Fetching Master Vehicle Listing
```javascript
import api from "./api";

export const getVehicles = async ({ search = "", categoryId = "", status = 1 }) => {
  const response = await api.get("/vehicle-info/details", {
    params: {
      search,
      category_id: categoryId,
      status,
    },
  });
  return response.data; // { success: true, total: ..., data: [ ... ] }
};
```

### 2. Uploading Vehicle Images with Progress
```javascript
import api from "./api";

export const uploadVehicleImages = async (vehicleId, imageFiles, onUploadProgress) => {
  const formData = new FormData();
  formData.append("vehicle_id", vehicleId);

  // Append multiple files under 'images' key
  Array.from(imageFiles).forEach((file) => {
    formData.append("images", file);
  });

  const response = await api.post("/vehicle-image/save", formData, {
    headers: {
      // Let browser automatically calculate Content-Type and multipart boundary
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });

  return response.data;
};
```

### 3. Mapping Vehicle to Multiple Categories
```javascript
import api from "./api";

export const mapVehicleCategories = async (vehicleId, categoryIds, replace = false) => {
  const response = await api.post("/category-vehicle-map/save", {
    vehicle_id: vehicleId,
    category_id: categoryIds, // e.g. [1, 2, 3]
    status: 1,
    replace: replace,
  });
  return response.data;
};
```

---

## 📋 Standard Response Structures

### Success Format:
```json
{
  "success": true,
  "message": "Human readable success message",
  "data": { ... } // Or array of objects [ ... ]
}
```

### Error Format:
```json
{
  "success": false,
  "message": "Clear explanation of the error",
  "error": "Internal error string (optional)"
}
```
