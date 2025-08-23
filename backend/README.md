# Resources Backend API

A comprehensive Node.js/Express.js backend API for an educational resource sharing platform. This application allows schools and administrators to share, manage, and access educational resources like PDFs, videos, presentations, and more.

## Features

- **User Management**: Registration, authentication, and role-based access control (Admin/School)
- **Resource Management**: Upload, update, delete, and organize educational resources
- **File Handling**: Support for multiple file types (PDF, Video, PPT, ZIP, etc.)
- **Search & Filtering**: Advanced search with subject, grade, and type filters
- **Analytics**: Download tracking, view counting, and usage statistics
- **Security**: JWT authentication, rate limiting, and input validation
- **Logging**: Comprehensive logging with Winston

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer
- **Validation**: express-validator
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or pnpm

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=resources_db
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   
   # File Upload Configuration
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=104857600
   ALLOWED_FILE_TYPES=pdf,doc,docx,ppt,pptx,xls,xlsx,zip,rar,mp4,avi,mov,jpg,jpeg,png,gif
   ```

4. **Set up the database**
   - Create a MySQL database named `resources_db`
   - Import the `resources_db.sql` file to create tables and views
   ```bash
   mysql -u root -p resources_db < ../resources_db.sql
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |
| PUT | `/api/auth/change-password` | Change password | Yes |
| GET | `/api/auth/users` | Get all users (Admin) | Yes |
| PUT | `/api/auth/users/:userId/status` | Update user status (Admin) | Yes |

### Resources

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/resources` | Get all resources | Optional |
| GET | `/api/resources/popular` | Get popular resources | Optional |
| GET | `/api/resources/:id` | Get resource by ID | Optional |
| GET | `/api/resources/:id/download` | Download resource | Optional |
| POST | `/api/resources` | Create new resource | Yes |
| PUT | `/api/resources/:id` | Update resource | Yes |
| DELETE | `/api/resources/:id` | Delete resource | Yes |
| POST | `/api/resources/:id/like` | Like/Unlike resource | Yes |
| GET | `/api/resources/user/my-resources` | Get user's resources | Yes |

### Meta Data

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/meta/grades` | Get all grades | No |
| GET | `/api/meta/subjects` | Get all subjects | No |
| GET | `/api/meta/resource-types` | Get resource types | No |
| GET | `/api/meta/tags` | Get all tags | No |
| GET | `/api/meta/stats` | Get platform statistics | No |

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## File Upload

Resources are uploaded using multipart/form-data with the field name `file`. The API supports various file types:

- **Documents**: PDF, DOC, DOCX, TXT
- **Presentations**: PPT, PPTX, KEY
- **Videos**: MP4, AVI, MOV, WMV, FLV
- **Images**: JPG, JPEG, PNG, GIF, BMP
- **Archives**: ZIP, RAR, 7Z, TAR, GZ
- **Spreadsheets**: XLS, XLSX, CSV
- **Audio**: MP3, WAV, OGG, AAC

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "field_name",
      "message": "Validation error message",
      "value": "invalid_value"
    }
  ]
}
```

## Default Admin Account

The system creates a default admin account during initialization:

- **Email**: admin@resources.com
- **Password**: admin123
- **Role**: admin

**Important**: Change the default password after first login!

## Development

### Running in Development Mode

```bash
npm run dev
```

This starts the server with nodemon for automatic restarts on file changes.

### Testing

```bash
npm test
```

### Logs

Logs are stored in the `logs/` directory:
- `combined.log`: All logs
- `error.log`: Error logs only

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing protection
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Request validation using express-validator
- **JWT**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **File Type Validation**: Whitelist of allowed file types
- **File Size Limits**: Configurable file size restrictions

## Database Schema

The application uses a comprehensive MySQL database with the following main tables:

- `users`: User accounts and profiles
- `resources`: Educational resources
- `grades`: Grade levels (1-12)
- `subjects`: Academic subjects
- `resource_types`: Supported file types
- `resource_tags`: Resource tagging system
- `resource_likes`: User likes on resources
- `resource_comments`: User comments
- `resource_downloads`: Download tracking
- `resource_views`: View tracking
- `activity_logs`: System activity logging

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 3306 |
| `DB_USER` | Database user | root |
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | resources_db |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | JWT expiration | 7d |
| `UPLOAD_PATH` | File upload directory | ./uploads |
| `MAX_FILE_SIZE` | Maximum file size (bytes) | 104857600 |
| `ALLOWED_FILE_TYPES` | Comma-separated file extensions | - |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

