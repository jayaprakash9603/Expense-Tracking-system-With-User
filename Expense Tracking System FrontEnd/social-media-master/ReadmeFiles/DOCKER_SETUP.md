# Docker Compose Setup for Expense Tracking System

This docker-compose configuration provides a complete development environment with all required infrastructure services.

## 🚀 Quick Start

### Start Infrastructure Services Only
```bash
docker-compose up -d
```

### Start Infrastructure + Build All Services
```bash
docker-compose --profile build up -d
```

### Stop All Services
```bash
docker-compose down
```

### Stop and Remove Volumes (Clean Start)
```bash
docker-compose down -v
```

## 📦 Services Included

### Infrastructure Services (Always Run)
- **MySQL** - Port 5000 (mapped to 3306)
- **Redis** - Port 6379
- **Zookeeper** - Port 2181
- **Kafka** - Port 9092
- **Kafka UI** - Port 9080 (Web Interface)

### Maven Builder (Optional - Use `--profile build`)
- Builds all microservices using Maven
- Caches dependencies in a Docker volume for faster subsequent builds
- All built JARs are stored in their respective `target` directories

## 🔧 Usage Scenarios

### Scenario 1: Just Infrastructure (Recommended for Development)
When you want to run services locally using your IDE or batch scripts:
```bash
docker-compose up -d
```

This starts:
- ✅ MySQL
- ✅ Redis  
- ✅ Kafka
- ✅ Zookeeper
- ✅ Kafka UI

Then run your services using:
- Your existing `run-all-services.bat` file
- Or individual `mvn spring-boot:run` commands

### Scenario 2: Infrastructure + Maven Build
When you want to build all services using Docker:
```bash
docker-compose --profile build up -d
```

This will:
1. Start all infrastructure services
2. Build all microservices using Maven in Docker
3. Cache Maven dependencies for faster future builds

### Scenario 3: Clean Build (Fresh Start)
```bash
# Stop everything and clean volumes
docker-compose down -v

# Start fresh
docker-compose --profile build up -d
```

## 🔍 Monitoring & Management

### Check Service Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f mysql
docker-compose logs -f kafka
docker-compose logs -f maven-builder
```

### Access Kafka UI
Open browser: http://localhost:9080

### Access MySQL
```bash
mysql -h localhost -P 5000 -u root -p123456
```

### Access Redis
```bash
redis-cli -p 6379
```

## 📊 Service Details

### MySQL Configuration
- **Host**: localhost
- **Port**: 5000
- **Username**: root
- **Password**: 123456
- **Default Database**: expense_tracker
- **Health Check**: Automatic with retry logic

### Kafka Configuration
- **Bootstrap Server**: localhost:9092
- **Internal Communication**: kafka:29092
- **Zookeeper**: localhost:2181
- **Auto Topic Creation**: Enabled
- **Replication Factor**: 1 (Single broker setup)

### Redis Configuration
- **Host**: localhost
- **Port**: 6379
- **No Password**: Default configuration

### Maven Builder
- **Maven Version**: 3.9
- **Java Version**: Eclipse Temurin 17
- **Cache Location**: Docker volume `maven_cache`
- **Workspace**: Maps to your local backend directory

## 🎯 Best Practices

### For Daily Development
1. Start infrastructure once in the morning:
   ```bash
   docker-compose up -d
   ```

2. Use your existing batch file to run services:
   ```bash
   .\run-all-services.bat
   ```

3. At end of day, optionally stop:
   ```bash
   docker-compose stop
   ```

### For CI/CD or Testing
```bash
# Full clean build
docker-compose down -v
docker-compose --profile build up -d
```

### To Update a Single Service
```bash
# Rebuild specific service
docker-compose up -d --force-recreate mysql
```

## 🔄 Data Persistence

The following data is persisted in Docker volumes:
- **mysql_data**: All MySQL databases
- **maven_cache**: Maven dependencies (.m2 repository)

To backup data:
```bash
docker run --rm -v expense-tracking-system-with-user_mysql_data:/data -v ${PWD}:/backup alpine tar czf /backup/mysql-backup.tar.gz /data
```

## ⚡ Performance Tips

1. **Maven Cache**: The first build will take longer as it downloads dependencies. Subsequent builds are much faster due to caching.

2. **Health Checks**: Services have health checks configured, so dependent services wait for prerequisites to be ready.

3. **Resource Allocation**: Ensure Docker Desktop has at least:
   - 4 GB RAM
   - 2 CPUs
   - 20 GB Disk Space

## 🐛 Troubleshooting

### Kafka Won't Start
```bash
docker-compose restart zookeeper
docker-compose restart kafka
```

### MySQL Connection Issues
```bash
# Check if MySQL is healthy
docker-compose ps mysql

# View MySQL logs
docker-compose logs mysql
```

### Port Already in Use
```bash
# Find what's using the port (Windows)
netstat -ano | findstr :5000
netstat -ano | findstr :9092

# Stop the service or change port in docker-compose.yml
```

### Build Failures
```bash
# Clean Maven cache and rebuild
docker-compose down
docker volume rm expense-tracking-system-with-user_maven_cache
docker-compose --profile build up -d
```

## 📝 Environment Variables

Current services use these environment variables:
- `MYSQL_ROOT_PASSWORD`: 123456
- `KAFKA_BROKER_ID`: 1
- `ZOOKEEPER_CLIENT_PORT`: 2181

To customize, edit the `docker-compose.yml` file.

## 🔐 Security Notes

⚠️ **For Development Only**: Default passwords and configurations are used. For production:
- Change default passwords
- Enable SSL/TLS
- Configure proper authentication
- Use secrets management

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Redis Documentation](https://redis.io/documentation)

## 🆘 Need Help?

If you encounter issues:
1. Check service logs: `docker-compose logs [service-name]`
2. Verify service health: `docker-compose ps`
3. Try clean restart: `docker-compose down && docker-compose up -d`
