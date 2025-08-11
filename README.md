# WhatsApp Clone

A real-time messaging application built with React frontend and Node.js backend using Socket.IO.

## Project Structure

```
whatsapp_clone/
├── backend/          # Node.js Express server
├── frontend/         # React application
├── package.json      # Root package.json for deployment
└── .render.yaml      # Render deployment configuration
```

## Features

- Real-time messaging using Socket.IO
- MongoDB database for message storage
- RESTful API endpoints
- Modern React frontend
- Responsive design

## Local Development

1. **Install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Set up environment variables:**
   Create a `.env` file in the `backend/` directory:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

   This will start both backend (port 5000) and frontend (port 3000) concurrently.

## Deployment on Render

This project is configured for deployment on Render with the following setup:

### Backend Service
- **Type:** Web Service
- **Environment:** Node.js
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Port:** 10000

### Frontend Service
- **Type:** Static Site
- **Build Command:** `cd frontend && npm install && npm run build`
- **Publish Path:** `./frontend/build`

### Environment Variables Required

For the backend service, you need to set:
- `MONGODB_URI`: Your MongoDB connection string
- `NODE_ENV`: production
- `PORT`: 10000

For the frontend service:
- `REACT_APP_API_URL`: URL of your backend service (e.g., https://your-backend-service.onrender.com)

## API Endpoints

- `GET /api/chats` - Get all chats
- `GET /api/chats/:wa_id/messages` - Get messages for a specific chat
- `POST /api/chats/:wa_id/messages` - Send a new message

## Technologies Used

- **Backend:** Node.js, Express, Socket.IO, MongoDB, Mongoose
- **Frontend:** React, Create React App
- **Deployment:** Render

## License

MIT
