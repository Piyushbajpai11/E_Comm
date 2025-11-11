# Deployment Guide

This guide provides instructions for deploying the e-commerce application for DevOps operations.

## Pre-deployment Checklist

1. ✅ Backend API server with Express
2. ✅ React frontend application
3. ✅ Data persistence (JSON files - can be migrated to database)
4. ✅ Environment configuration
5. ✅ CORS configured
6. ✅ Error handling implemented

## Environment Setup

### Backend Environment Variables

Create `server/.env`:
```env
PORT=5000
JWT_SECRET=your-strong-secret-key-here-minimum-32-characters
NODE_ENV=production
```

### Frontend Environment Variables

Create `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

For production, update the API URL to your backend URL.

## Database Migration

Currently using JSON file storage. To migrate to a database:

1. **MongoDB:**
   - Install `mongoose`
   - Create schemas for Products, Users, Carts, Wishlists, Coupons, Orders
   - Update data access functions in `server/index.js`

2. **PostgreSQL:**
   - Install `pg` or `sequelize`
   - Create tables and migrations
   - Update data access functions

3. **MySQL:**
   - Install `mysql2` or use an ORM
   - Create database schema
   - Update data access functions

## Build Commands

### Backend
```bash
cd server
npm install --production
npm start
```

### Frontend
```bash
cd client
npm install
npm run build
```

The built files will be in `client/build/` and can be served with:
- Nginx
- Apache
- Express static file serving
- AWS S3 + CloudFront
- Netlify/Vercel

## Deployment Options

### Option 1: Monolithic Deployment
- Build frontend and serve from backend
- Single server deployment
- Use Express to serve React build files

### Option 2: Separate Deployment
- Backend: Deploy to server (EC2, Heroku, DigitalOcean)
- Frontend: Deploy to static hosting (Netlify, Vercel, S3)

### Option 3: Container Deployment
- Create Dockerfile for backend
- Create Dockerfile for frontend
- Use Docker Compose for local development
- Deploy to Kubernetes, ECS, or similar

## Security Considerations

1. **JWT Secret**: Use a strong, randomly generated secret
2. **CORS**: Configure allowed origins for production
3. **Rate Limiting**: Add rate limiting to API endpoints
4. **HTTPS**: Always use HTTPS in production
5. **Environment Variables**: Never commit `.env` files
6. **Input Validation**: Add input validation middleware
7. **Password Hashing**: Already implemented with bcryptjs

## Performance Optimization

1. **Caching**: Add Redis for session/cart caching
2. **CDN**: Use CDN for static assets
3. **Database Indexing**: When migrating to database, add indexes
4. **Image Optimization**: Implement image compression/optimization
5. **Code Splitting**: React already supports code splitting

## Monitoring

Recommended tools:
- Application monitoring: New Relic, Datadog
- Error tracking: Sentry
- Logging: Winston, Morgan
- Analytics: Google Analytics for frontend

## CI/CD Pipeline Example

### GitHub Actions Workflow
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
      - name: Install & Build
        run: |
          cd server
          npm install
      - name: Deploy
        run: |
          # Your deployment commands
          
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
      - name: Install & Build
        run: |
          cd client
          npm install
          npm run build
      - name: Deploy
        run: |
          # Your deployment commands
```

## Docker Support

### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install --production
COPY server/ .
EXPOSE 5000
CMD ["node", "index.js"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Scaling Considerations

1. **Horizontal Scaling**: Use load balancer for multiple backend instances
2. **Session Management**: Use Redis for shared sessions
3. **Database Scaling**: Use read replicas for database
4. **CDN**: Offload static assets to CDN
5. **Caching**: Implement Redis cache layer

## Backup Strategy

1. Regular backups of data files or database
2. Backup user data, orders, and configuration
3. Automated backup scripts
4. Test restore procedures

## Health Checks

Add health check endpoint to backend:
```javascript
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

## Notes

- The application is designed to be stateless (except for data storage)
- All authentication uses JWT tokens
- Cart and wishlist data is user-specific
- Sample data is auto-generated on first run

