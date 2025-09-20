#!/bin/bash

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running"
    echo "   Please start Docker and try again"
    exit 1
fi

# Function to dispecho ""
echo "🐳 Infrastructure Services:"y service status
display_service_status() {
    local service_name=$1
    local replicas=$2
    
    echo "   - $service_name:"
    for i in $(seq 1 $replicas); do
        local instance_name="${service_name}-${i}"
        if [ -f "${service_name}/${instance_name}.pid" ]; then
            local pid=$(cat "${service_name}/${instance_name}.pid")
            echo "     └── Instance $i: PID $pid"
        fi
    done
}

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

# Function to check Eureka registration for services with random ports
check_eureka_registration() {
    local service_name=$1
    local expected_instances=$2
    local timeout=120  # Increased from 60 to 120 seconds
    local count=0
    
    echo "⏳ Waiting for $expected_instances instance(s) of $service_name to register with Eureka..."
    echo "   This may take up to 2 minutes due to Eureka's registration process..."
    
    while [ $count -lt $timeout ]; do
        local registered=$(curl -s "http://localhost:8761/eureka/apps/$service_name" 2>/dev/null | grep -o "<instance>" | wc -l)
        
        if [ "$registered" -ge "$expected_instances" ]; then
            echo "✅ All $expected_instances instance(s) of $service_name registered with Eureka!"
            return 0
        fi
        
        # Show progress every 10 seconds
        if [ $((count % 10)) -eq 0 ]; then
            echo "📊 Progress: $registered/$expected_instances instances registered for $service_name (${count}s elapsed)"
        fi
        
        sleep 5  # Check every 5 seconds
        count=$((count + 5))
    done
    
    echo "⚠️  Only $registered out of $expected_instances instance(s) of $service_name registered within ${timeout}s"
    echo "   Check individual instance logs for detailed error information"
    return 1
}

# Function to verify instance health and port allocation
verify_instances_health() {
    local service_name=$1
    local service_dir=$2
    local replicas=$3
    
    echo "🔍 Verifying health of $service_name instances..."
    
    local healthy_instances=0
    
    for i in $(seq 1 $replicas); do
        local instance_name="${service_name}-${i}"
        local log_file="${service_dir}/${instance_name}.log"
        local pid_file="${service_dir}/${instance_name}.pid"
        
        if [ -f "$pid_file" ]; then
            local pid=$(cat "$pid_file")
            
            # Check if process is still running
            if kill -0 "$pid" 2>/dev/null; then
                echo "   ✅ Instance $i (PID: $pid) is running"
                
                if [ -f "$log_file" ]; then
                    # Check if instance got a port (for random port services)
                    local port_info=$(grep "Tomcat started on port(s):" "$log_file" 2>/dev/null | tail -1)
                    if [ -n "$port_info" ]; then
                        local port=$(echo "$port_info" | grep -o "[0-9]\+" | head -1)
                        echo "      🔌 Port: $port"
                        healthy_instances=$((healthy_instances + 1))
                    else
                        echo "      ⚠️  Port information not found in logs yet"
                    fi
                    
                    # Check for Eureka registration attempts
                    local eureka_registration=$(grep -c "DiscoveryClient_.*: registering service" "$log_file" 2>/dev/null || echo "0")
                    if [ "$eureka_registration" -gt 0 ]; then
                        echo "      📝 Eureka registration attempts: $eureka_registration"
                    fi
                    
                    # Check for errors
                    local errors=$(grep -c "ERROR\|Exception\|Failed" "$log_file" 2>/dev/null || echo "0")
                    if [ "$errors" -gt 0 ]; then
                        echo "      ❌ Errors found in logs: $errors"
                        echo "      💡 Check $log_file for details"
                    fi
                fi
            else
                echo "   ❌ Instance $i (PID: $pid) is not running"
                
                # Show last few lines of log if process died
                if [ -f "$log_file" ]; then
                    echo "      📝 Last log entries:"
                    tail -3 "$log_file" 2>/dev/null | sed 's/^/         /'
                fi
            fi
        else
            echo "   ❌ Instance $i: PID file not found"
        fi
    done
    
    echo "   📊 Summary: $healthy_instances/$replicas instances appear healthy"
    
    if [ "$healthy_instances" -lt "$replicas" ]; then
        echo "   ⚠️  Some instances may have issues. Check logs for details."
        return 1
    fi
    
    return 0
}

# Function to start a service with multiple replicas in background
start_service() {
    local service_name=$1
    local service_dir=$2
    local fixed_port=$3  # Optional: use only for services that need fixed ports (eureka, config, gateway)
    local replicas=${4:-1}
    
    echo "🚀 Starting $service_name with $replicas replica(s)..."
    
    for i in $(seq 1 $replicas); do
        local instance_name="${service_name}-${i}"
        
        cd "$service_dir"
        
        if [[ "$service_name" == "deck-service" || "$service_name" == "card-service" ]]; then
            # For deck and card services, let Spring Boot choose random port (server.port: 0)
            # Add progressive delay to prevent concurrency issues
            if [ $i -gt 1 ]; then
                local delay=$((10 + (i - 1) * 5))  # 10s, 15s, 20s, 25s... delay between instances
                echo "   ⏳ Waiting ${delay}s before starting instance $i (prevents Eureka registration conflicts)..."
                sleep $delay
            fi
            
            echo "   Starting instance $i (random port)..."
            ./mvnw spring-boot:run > "${instance_name}.log" 2>&1 &
        else
            # For infrastructure services (eureka, config, gateway), use fixed ports
            # Smaller delay for fixed port services
            if [ $i -gt 1 ]; then
                echo "   ⏳ Waiting 5s before starting instance $i..."
                sleep 5
            fi
            
            local port=$((fixed_port + i - 1))
            echo "   Starting instance $i on port $port..."
            SERVER_PORT=$port ./mvnw spring-boot:run > "${instance_name}.log" 2>&1 &
        fi
        
        local pid=$!
        echo "$pid" > "${instance_name}.pid"
        echo "   ✅ $instance_name - PID: $pid (logs: ${instance_name}.log)"
        cd - > /dev/null
        
        # Add PID to cleanup array
        PIDS+=($pid)
        
        # Wait for the instance to at least start before proceeding to next
        echo "   ⏳ Allowing instance $i time to initialize..."
        sleep 8
    done
    
    echo "   ✅ All $replicas instance(s) of $service_name have been started"
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

# Ask for number of replicas for each service (or use environment variables)
echo "📊 Configuration - How many replicas do you want for each service?"
echo ""

if [[ -n "$EUREKA_REPLICAS" && -n "$CONFIG_REPLICAS" && -n "$GATEWAY_REPLICAS" && -n "$DECK_REPLICAS" && -n "$CARD_REPLICAS" ]]; then
    echo "Using environment variables for configuration..."
else
    read -p "Eureka Server (Default: 1): " EUREKA_REPLICAS
    EUREKA_REPLICAS=${EUREKA_REPLICAS:-1}

    read -p "Config Server (Default: 1): " CONFIG_REPLICAS
    CONFIG_REPLICAS=${CONFIG_REPLICAS:-1}

    read -p "API Gateway (Default: 1): " GATEWAY_REPLICAS
    GATEWAY_REPLICAS=${GATEWAY_REPLICAS:-1}

    read -p "Deck Service (Default: 2): " DECK_REPLICAS
    DECK_REPLICAS=${DECK_REPLICAS:-2}

    read -p "Card Service (Default: 2): " CARD_REPLICAS
    CARD_REPLICAS=${CARD_REPLICAS:-2}
fi

echo ""
echo "📋 Configuration Summary:"
echo "   - Eureka Server: $EUREKA_REPLICAS replica(s)"
echo "   - Config Server: $CONFIG_REPLICAS replica(s)"
echo "   - API Gateway: $GATEWAY_REPLICAS replica(s)"
echo "   - Deck Service: $DECK_REPLICAS replica(s)"
echo "   - Card Service: $CARD_REPLICAS replica(s)"
echo ""

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
start_service "eureka-server" "eureka-server" 8761 $EUREKA_REPLICAS

# Wait for Eureka to be ready (check first instance)
check_service "http://localhost:8761/actuator/health" 60

# Start Config Server
echo "Starting Config Server..."
start_service "config-server" "config-server" 8888 $CONFIG_REPLICAS

# Wait for Config Server to be ready (check first instance)
check_service "http://localhost:8888/actuator/health" 30

# Start API Gateway
echo "Starting API Gateway..."
start_service "api-gateway" "api-gateway" 8080 $GATEWAY_REPLICAS

# Wait for Gateway to be ready (check first instance)
check_service "http://localhost:8080/actuator/health" 30

# Start Deck Service
echo "Starting Deck Service..."
start_service "deck-service" "deck-service" "" $DECK_REPLICAS

# Verify Deck Service instances health
verify_instances_health "deck-service" "deck-service" $DECK_REPLICAS

# Start Card Service
echo "Starting Card Service..."
start_service "card-service" "card-service" "" $CARD_REPLICAS

# Verify Card Service instances health
verify_instances_health "card-service" "card-service" $CARD_REPLICAS

# Wait for services to register with Eureka
echo "⏳ Waiting for services to register with Eureka..."
check_eureka_registration "DECK-SERVICE" $DECK_REPLICAS
check_eureka_registration "CARD-SERVICE" $CARD_REPLICAS

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
display_service_status "eureka-server" $EUREKA_REPLICAS
display_service_status "config-server" $CONFIG_REPLICAS
display_service_status "api-gateway" $GATEWAY_REPLICAS
display_service_status "deck-service" $DECK_REPLICAS
display_service_status "card-service" $CARD_REPLICAS
if [ -f "web-client/web-client.pid" ]; then
    echo "   - web-client: PID $(cat web-client/web-client.pid)"
fi
echo ""
echo "🔌 Service Ports:"
echo "   - Eureka Server: 8761-$((8761 + EUREKA_REPLICAS - 1))"
echo "   - Config Server: 8888-$((8888 + CONFIG_REPLICAS - 1))"
echo "   - API Gateway: 8080-$((8080 + GATEWAY_REPLICAS - 1))"
echo "   - Deck Service: Random ports (check Eureka dashboard)"
echo "   - Card Service: Random ports (check Eureka dashboard)"
echo ""
echo "💡 Tip: Visit the Eureka Dashboard at http://localhost:8761 to see all service instances and their random ports"
echo ""
echo "📝 Logs are available in each service directory (*.log files)"
echo "🛑 Press Ctrl+C to stop all services"
echo ""

# Keep script running
while true; do
    sleep 1
done