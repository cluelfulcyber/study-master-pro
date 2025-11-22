# LimbusMentor - Docker Setup

Run the entire application with one command using Docker.

## Quick Start

1. **Copy environment file**
   ```bash
   cp .env.docker .env
   ```

2. **Add your OpenAI API key to `.env`**
   ```bash
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **Run everything**
   ```bash
   docker-compose up
   ```

That's it! The application will be available at:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## What's Running

The Docker setup includes:
- **PostgreSQL 15** - Database (port 5432)
- **Python FastAPI Backend** - API server (port 8000)
- **React Frontend** - Web interface (port 8080)

## Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove all data
docker-compose down -v

# View logs
docker-compose logs -f

# Rebuild after code changes
docker-compose up --build
```

## Database Access

Connect to PostgreSQL:
```bash
docker-compose exec postgres psql -U postgres -d limbus_mentor
```

## Troubleshooting

### Port already in use
If ports 5432, 8000, or 8080 are already in use, edit `docker-compose.yml` to change the port mappings.

### OpenAI API errors
Make sure you've added a valid `OPENAI_API_KEY` to your `.env` file.

### Database connection issues
The backend waits for PostgreSQL to be healthy before starting. If issues persist, try:
```bash
docker-compose down -v
docker-compose up
```

## Development

The setup uses volume mounts, so code changes are reflected immediately:
- Frontend: Hot reload enabled
- Backend: Restart container with `docker-compose restart backend`

## Production Deployment

For production, update:
1. Change `JWT_SECRET_KEY` to a secure random value
2. Build frontend for production (modify Dockerfile)
3. Use proper secrets management
4. Configure reverse proxy (nginx/traefik)
5. Set up SSL certificates
