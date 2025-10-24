# Asclepius AI Frontend

A modern Vue.js 3 application for pharmaceutical document management with AI-powered Q&A capabilities.

## Overview

Asclepius AI Frontend provides an intuitive interface for uploading, managing, and querying pharmaceutical documents. The application features role-based access control (RBAC), HIPAA-compliant PHI handling, and real-time document processing monitoring.

## Features

### Document Management

- **Batch Upload**: Upload multiple documents simultaneously with drag-and-drop support
- **Classification Levels**: Public, Confidential, and Restricted access control
- **PHI Handling**: HIPAA-compliant Protected Health Information management
- **Document Processing**: Background job processing with real-time status updates
- **Search & Filter**: Advanced search capabilities across uploaded documents

### AI-Powered Q&A

- Semantic search across document collections
- Context-aware answers with source citations
- Query history and audit trail
- Multi-document querying

### Admin Features

- **User Management**: Create, update, and manage user accounts and roles
- **Analytics Dashboard**: Usage statistics, document metrics, and system health
- **Audit Logs**: Comprehensive activity tracking for compliance
- **Background Jobs Monitor**: Real-time Sidekiq job monitoring and management
- **Compliance Dashboard**: HIPAA compliance status and reports

### Security & Compliance

- Role-based access control (Admin, Auditor, Researcher, Doctor)
- Session management with Redis
- Inactivity timeout (15 minutes)
- Audit logging for all sensitive operations
- PHI access restrictions

## Technology Stack

- **Framework**: Vue.js 3 (Composition API)
- **Build Tool**: Vite
- **Routing**: Vue Router
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Styling**: Scoped CSS with modern design patterns

## Prerequisites

- Node.js 18+ and npm
- Access to Asclepius AI Backend API (Rails)

## Installation

1. Clone the repository:

```bash
git clone git@github.com:git4ruby/pharma_ai_frontend.git
cd pharma_ai_frontend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
# Create .env file
cp .env.example .env

# Update API endpoint
VITE_API_URL=http://localhost:3000
```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:4000`

## Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Testing

Run unit tests:

```bash
npm run test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Project Structure

```
src/
├── assets/           # Static assets (images, fonts)
├── components/       # Reusable Vue components
├── layouts/          # Layout components (DashboardLayout)
├── router/           # Vue Router configuration
├── services/         # API service layer
│   └── api.js        # Axios instance and service methods
├── stores/           # Pinia stores
│   └── auth.js       # Authentication state management
├── views/            # Page components
│   ├── auth/         # Login, Signup
│   ├── admin/        # Admin pages (Users, Analytics, Audit Logs, etc.)
│   ├── Dashboard.vue
│   ├── Documents.vue
│   ├── UploadDocument.vue
│   ├── Queries.vue
│   └── QueryAudit.vue
└── App.vue           # Root component
```

## User Roles

### Admin

- Full system access
- User management
- System configuration
- All analytics and audit logs

### Auditor

- Read-only access to query audit logs
- View all queries and responses
- Access compliance reports

### Researcher

- Upload and manage own documents
- Query all accessible documents
- View own documents and public documents
- Limited analytics

### Doctor

- Upload and manage own documents
- Query all accessible documents
- Access to PHI documents (only uploaded by them)
- Full analytics access

## Key Features Guide

### Uploading Documents

1. Navigate to **Upload** page
2. Click or drag files to upload (PDF, DOCX, TXT)
3. Select classification level:
   - **Public**: Accessible to all users
   - **Confidential**: Accessible to researchers and above
   - **Restricted**: Limited access (same as Confidential currently)
4. Mark **Contains PHI** if document has Protected Health Information
5. Upload single or multiple files (batch upload)

### Querying Documents

1. Navigate to **Q&A** page
2. Enter your question in natural language
3. System searches across accessible documents
4. View AI-generated answer with source citations
5. All queries are logged for audit purposes

### Admin Operations

#### User Management

- Create new users with specific roles
- Update user information and permissions
- Monitor user activity

#### Background Jobs

- View Sidekiq job statistics
- Monitor document processing status
- Retry or delete failed jobs
- Track queue latency

#### Analytics

- Document upload trends
- Query patterns and frequency
- User activity metrics
- System performance indicators

## API Integration

The frontend communicates with the Rails backend API:

```javascript
// Example API call
import { documentService } from "@/services/api";

// Upload document
await documentService.upload(file, title, containsPhi, classification);

// Query documents
const response = await documentService.query(question);
```

## Environment Variables

```env
VITE_API_URL=http://localhost:3000    # Backend API URL
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## Common Issues

### CORS Errors

Ensure the backend API has CORS configured to allow requests from the frontend origin.

### Session Timeout

Default inactivity timeout is 15 minutes. Users receive a warning at 13 minutes.

### File Upload Limits

Maximum file size: 50MB per file. Larger files will be rejected.

## License

Apache License 2.0 - see LICENSE file for details
