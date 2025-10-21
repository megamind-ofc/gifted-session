# Gifted Session Generator

## Overview
This is a WhatsApp Bot Session Generator application that allows users to generate WhatsApp session IDs for use with the Gifted-MD WhatsApp bot. The application provides two methods for authentication:
- QR Code authentication
- Phone number pairing code authentication

## Project Architecture

### Technology Stack
- **Backend Framework**: Express.js (Node.js)
- **WhatsApp Library**: @whiskeysockets/baileys v6.7.20
- **Session Storage**: GitHub repository (via GitHub API)
- **Session Mapping**: MongoDB (stores session ID to GitHub URL mapping)
- **QR Code Generation**: qrcode library
- **Logging**: Pino logger

### Project Structure
```
/
├── index.js                 # Main application entry point
├── db.js                    # MongoDB session mapping and GitHub integration
├── github-storage.js        # GitHub API operations for session storage
├── routes/
│   ├── index.js            # Route exports
│   ├── qr.js               # QR code authentication route
│   ├── pair.js             # Pairing code authentication route
│   └── admin.js            # Admin routes
├── public/
│   ├── index.html          # Landing page
│   └── pair.html           # Pairing code page
├── gift/
│   └── index.js            # Utility functions (ID generation, file removal)
└── package.json            # Dependencies and scripts
```

### Key Features
1. **QR Code Login** (`/qr`): Traditional QR code scanning method for WhatsApp authentication
2. **Pair Code Login** (`/code?number=...`): Phone number-based pairing code authentication
3. **GitHub Storage**: Session data stored as JSON files in private GitHub repository
4. **MongoDB Mapping**: Short session IDs mapped to GitHub URLs for efficient retrieval
5. **Auto-cleanup**: Temporary session files are automatically removed after use

## Configuration

### Environment Variables
- `PORT`: Server port (defaults to 5000)
- `MONGODB_URI`: MongoDB connection string for session ID mapping
- `GITHUB_TOKEN`: GitHub Personal Access Token (Classic) with repo permissions
- `GITHUB_USERNAME`: GitHub username
- `GITHUB_REPO`: Private GitHub repository name for session storage

### Port Configuration
- Development: Port 5000 (bound to 0.0.0.0)
- Production: Uses PORT environment variable or defaults to 5000

### Routes
- `GET /` - Landing page with feature overview
- `GET /pair` - Pairing code page
- `GET /qr` - QR code authentication endpoint
- `GET /code?number=<phone>` - Pairing code endpoint (requires phone number parameter)
- `GET /session/:id` - Retrieve session data by 6-character session ID (for bot integration)
- `GET /health` - Health check endpoint

## Development

### Running Locally
The application runs automatically via the configured workflow:
```bash
node index.js
```

### Dependencies
All dependencies are managed via npm and are listed in package.json:
- @whiskeysockets/baileys (WhatsApp connection library)
- @octokit/rest (GitHub API client)
- express (Web framework)
- mongodb (MongoDB driver for session mapping)
- qrcode (QR code generation)
- pino (Logging)
- body-parser (Request parsing)

## Deployment

### Production Configuration
- **Deployment Type**: Autoscale (stateless web application)
- **Run Command**: `node index.js`
- **Port**: 5000

## Recent Changes
- **2025-10-21**: GitHub Storage Integration
  - Migrated from zlib compression to plain JSON storage
  - Implemented GitHub repository storage for session data
  - Each session is stored as `/sessions/{sessionId}.json` in the GitHub repo
  - MongoDB now stores only session ID to GitHub URL mapping (not full session data)
  - Removed zlib dependency from routes
  - Updated session retrieval to fetch from GitHub via MongoDB mapping
  - Session data stored as readable JSON for better debugging and portability

- **2025-10-19**: MongoDB Session Storage Implementation
  - Implemented MongoDB-backed session storage for short session IDs
  - Changed session ID prefix from "Gifted~" to "Darex~"
  - Short session IDs are now 6 characters (e.g., Darex~abc123)
  - Added unique index on sessionId to prevent duplicates
  - Added TTL index on expiresAt for automatic 30-day cleanup
  - Created /session/:id endpoint for bot session retrieval
  - Updated both QR and pair code routes to use MongoDB storage
  
- **2025-10-19**: Migrated to Replit environment
  - Updated server to bind to 0.0.0.0:5000 for Replit compatibility
  - Configured workflow for automatic server startup
  - Set up deployment configuration for production
  - Updated .gitignore to exclude session directories and logs

## Security Notes
- Session files are temporarily stored in `routes/session/<id>` directories during generation
- All temporary session directories are automatically cleaned up after use
- Final session data is stored as JSON files in your private GitHub repository
- MongoDB stores only the session ID mapping (not sensitive data)
- GitHub credentials are stored as Replit secrets (never committed)
- Session data expires after 30 days (MongoDB TTL index)
- Never commit session files or credentials to the repository

## User Workflow
1. User visits the landing page
2. User chooses authentication method (QR or Pair Code)
3. For QR: User scans the displayed QR code with WhatsApp
4. For Pair: User enters phone number and receives a pairing code
5. Session credentials are generated and stored as JSON in GitHub repo
6. Short session ID (e.g., Darex~abc123) is generated and mapped to GitHub URL in MongoDB
7. Session ID is sent to user's WhatsApp
8. User uses the short session ID in their bot configuration
9. Bot fetches full session data via /session/:id endpoint which retrieves from GitHub

## Support
- GitHub: https://github.com/mrfr8nk/
- WhatsApp Channel: https://whatsapp.com/channel/0029VagQEmB002T7MWo3Sj1D
