# Environment Setup Guide

## Configuration

This application uses environment variables to configure the backend API URL and other settings.

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000

# Environment
REACT_APP_ENV=development

# App Configuration
REACT_APP_APP_NAME=Resources Hub
REACT_APP_APP_VERSION=1.0.0
```

### 2. Environment Configurations

#### Development
```env
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_ENV=development
```

#### Production
```env
REACT_APP_API_BASE_URL=https://your-production-api.com
REACT_APP_ENV=production
```

#### Staging
```env
REACT_APP_API_BASE_URL=https://your-staging-api.com
REACT_APP_ENV=staging
```

### 3. API Configuration

The application uses a centralized API configuration located at `src/config/api.ts`. This file:

- Reads the `REACT_APP_API_BASE_URL` environment variable
- Provides predefined endpoints for all API calls
- Includes helper functions for file URLs
- Falls back to `http://localhost:5000` if no environment variable is set

### 4. Usage

All API calls in the application now use the centralized configuration:

```typescript
import { API_ENDPOINTS, getFileUrl } from '../config/api';

// Instead of hardcoded URLs:
// fetch('http://localhost:5000/api/users')

// Use the configuration:
fetch(API_ENDPOINTS.USERS)

// For file URLs:
const imageUrl = getFileUrl(resource.preview_image);
```

### 5. Benefits

- **Easy Deployment**: Change API URL once in environment file
- **Environment Management**: Different URLs for dev/staging/production
- **Maintainability**: All API endpoints centralized
- **Type Safety**: TypeScript support for all endpoints
- **Consistency**: Standardized API calls across the application

### 6. Deployment

When deploying to different environments:

1. Create environment-specific `.env` files
2. Set the appropriate `REACT_APP_API_BASE_URL`
3. Build the application with the correct environment variables
4. No code changes required!

### 7. Available Endpoints

The configuration includes endpoints for:
- Authentication (login, register, verify)
- User management
- Resource management (CRUD operations)
- Metadata (grades, subjects, types, tags)
- File uploads
- Downloads and previews
