#!/bin/bash

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running"
    echo "   Please start Docker and try again"
    exit 1
fi

# Function to check if a service is responding
check_service() {
    local url=$1
    local timeout=${2:-30}
    local count=0
    
    echo "Waiting for service at $url to be ready..."
    while [ $count -lt $timeout ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo "✅ Service at $url is ready!"
            return 0
        fi
        sleep 1
        count=$((count + 1))
    done
    echo "⚠️  Service at $url did not respond within ${timeout}s"
    return 1
}

# Function to start a service in background
start_service() {
    local service_name=$1
    local service_dir=$2
    local port=$3
    
    echo "🚀 Starting $service_name..."
    cd "$service_dir"
    ./mvnw spring-boot:run > "${service_name}.log" 2>&1 &
    local pid=$!
    echo "$pid" > "${service_name}.pid"
    echo "   PID: $pid (logs: ${service_name}.log)"
    cd - > /dev/null
}

# Store PIDs for cleanup
PIDS=()

# Trap to cleanup on script exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    
    # Stop Spring Boot services
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            echo "   Stopped process $pid"
        fi
    done
    
    # Stop Docker Compose services
    echo "🐳 Stopping infrastructure services..."
    docker compose -f docker-compose.dev.yml down
    
    exit 0
}
trap cleanup INT TERM

echo "🎯 Starting Distributed Memorix Services"
echo "========================================="

# Start Docker Compose infrastructure services
echo "🐳 Starting infrastructure services (Docker Compose)..."
docker compose -f docker-compose.dev.yml up -d
if [ $? -eq 0 ]; then
    echo "✅ Infrastructure services started successfully!"
    echo "   - PostgreSQL (Decks DB): localhost:5432"
    echo "   - MongoDB (Cards DB): localhost:27017"
    echo "   - RabbitMQ: localhost:5672 (Management: localhost:15672)"
    echo "   - Zipkin: localhost:9411"
else
    echo "❌ Failed to start infrastructure services"
    exit 1
fi

# Wait for databases to be ready
echo "⏳ Waiting for databases to be ready..."
sleep 15

# Start Eureka Server
echo "Starting Eureka Server..."
start_service "eureka-server" "eureka-server" 8761
PIDS+=($(cat eureka-server/eureka-server.pid))

# Wait for Eureka to be ready
check_service "http://localhost:8761/actuator/health" 60

# Start Config Server
echo "Starting Config Server..."
start_service "config-server" "config-server" 8888
PIDS+=($(cat config-server/config-server.pid))

# Wait for Config Server to be ready
check_service "http://localhost:8888/actuator/health" 30

# Start API Gateway
echo "Starting API Gateway..."
start_service "api-gateway" "api-gateway" 8080
PIDS+=($(cat api-gateway/api-gateway.pid))

# Wait for Gateway to be ready
check_service "http://localhost:8080/actuator/health" 30

# Start Deck Service
echo "Starting Deck Service..."
start_service "deck-service" "deck-service" 8081
PIDS+=($(cat deck-service/deck-service.pid))

# Start Card Service
echo "Starting Card Service..."
start_service "card-service" "card-service" 8082
PIDS+=($(cat card-service/card-service.pid))

# Wait a bit for services to register with Eureka
echo "⏳ Waiting for services to register with Eureka..."
sleep 10

# Start Web Client
echo "🌐 Starting Web Client..."
cd web-client
npm run dev > web-client.log 2>&1 &
WEB_PID=$!
echo "$WEB_PID" > web-client.pid
PIDS+=($WEB_PID)
cd - > /dev/null

echo ""
echo "✅ All services started successfully!"
echo "========================================="
echo "🌐 Web Client: http://localhost:5173"
echo "🔧 Eureka Dashboard: http://localhost:8761"
echo "⚙️  Config Server: http://localhost:8888"
echo "🚪 API Gateway: http://localhost:8080"
echo ""
echo "� Infrastructure Services:"
echo "   - PostgreSQL (Decks): localhost:5432"
echo "   - MongoDB (Cards): localhost:27017"
echo "   - RabbitMQ: localhost:5672"
echo "   - RabbitMQ Management: http://localhost:15672 (user: rabbitmq, pass: rabbitmq)"
echo "   - Zipkin Tracing: http://localhost:9411"
echo ""
echo "📋 Spring Boot Services:"
echo "   - Eureka Server: PID $(cat eureka-server/eureka-server.pid)"
echo "   - Config Server: PID $(cat config-server/config-server.pid)"
echo "   - API Gateway: PID $(cat api-gateway/api-gateway.pid)"
echo "   - Deck Service: PID $(cat deck-service/deck-service.pid)"
echo "   - Card Service: PID $(cat card-service/card-service.pid)"
echo "   - Web Client: PID $(cat web-client/web-client.pid)"
echo ""
echo "📝 Logs are available in each service directory (*.log files)"
echo "🛑 Press Ctrl+C to stop all services"
echo ""

# Keep script running
while true; do
    sleep 1
done