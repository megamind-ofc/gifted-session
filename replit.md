# Gifted Session Generator

## Overview
This is a WhatsApp Bot Session Generator application that allows users to generate WhatsApp session IDs for use with the Gifted-MD WhatsApp bot. The application provides two methods for authentication:
- QR Code authentication
- Phone number pairing code authentication

## Project Architecture

### Technology Stack
- **Backend Framework**: Express.js (Node.js)
- **WhatsApp Library**: @whiskeysockets/baileys v6.7.20
- **Session Management**: Multi-file auth state with zlib compression
- **QR Code Generation**: qrcode library
- **Logging**: Pino logger

### Project Structure
```
/
├── index.js                 # Main application entry point
├── routes/
│   ├── index.js            # Route exports
│   ├── qr.js               # QR code authentication route
│   └── pair.js             # Pairing code authentication route
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
3. **Session Compression**: Sessions are compressed using zlib for efficient storage
4. **Auto-cleanup**: Temporary session files are automatically removed after use

## Configuration

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
- express (Web framework)
- mongodb (MongoDB driver for session storage)
- qrcode (QR code generation)
- pino (Logging)
- body-parser (Request parsing)
- bcryptjs (Security utilities)
- pm2 (Process management)

## Deployment

### Production Configuration
- **Deployment Type**: Autoscale (stateless web application)
- **Run Command**: `node index.js`
- **Port**: 5000

### Environment Variables
- `PORT`: Server port (defaults to 5000)
- `MONGODB_URI`: MongoDB connection string for session storage (required)

## Recent Changes
- **2025-10-19**: MongoDB Session Storage Implementation
  - Implemented MongoDB-backed session storage for short session IDs
  - Changed session ID prefix from "Gifted~" to "Darex~"
  - Short session IDs are now 6 characters (e.g., Darex~abc123)
  - Added unique index on sessionId to prevent duplicates
  - Added TTL index on expiresAt for automatic 30-day cleanup
  - Created /session/:id endpoint for bot session retrieval
  - Updated both QR and pair code routes to use MongoDB storage
  - Added retry logic to handle concurrent session generation safely
  - Updated README with new bot integration instructions
  
- **2025-10-19**: Migrated to Replit environment
  - Updated server to bind to 0.0.0.0:5000 for Replit compatibility
  - Configured workflow for automatic server startup
  - Set up deployment configuration for production
  - Updated .gitignore to exclude session directories and logs

## Security Notes
- Session files are temporarily stored in `routes/session/<id>` directories
- All session directories are automatically cleaned up after use
- Session data is compressed and sent to the user's WhatsApp
- Never commit session files or credentials to the repository

## User Workflow
1. User visits the landing page
2. User chooses authentication method (QR or Pair Code)
3. For QR: User scans the displayed QR code with WhatsApp
4. For Pair: User enters phone number and receives a pairing code
5. Short session ID (e.g., Darex~abc123) is generated and stored in MongoDB
6. Session ID is sent to user's WhatsApp
7. User uses the short session ID in their bot configuration
8. Bot fetches full session data via /session/:id endpoint when starting

## Support
- GitHub: https://github.com/mauricegift/gifted-md
- Telegram: https://t.me/mouricedevs
- WhatsApp Channel: https://whatsapp.com/channel/0029Vb3hlgX5kg7G0nFggl0Y
