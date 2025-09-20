#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test configuration
GATEWAY_URL="http://localhost:8080"
EUREKA_URL="http://localhost:8761"
TOTAL_REQUESTS=100
CONCURRENT_REQUESTS=20

echo -e "${BLUE}🚀 Load Distribution Test for Memorix${NC}"
echo "============================================"
echo ""

# Check if services are running
check_services() {
    echo -e "${YELLOW}🔍 Checking services...${NC}"
    
    if ! curl -s -f "$GATEWAY_URL/actuator/health" > /dev/null; then
        echo -e "${RED}❌ API Gateway not responding${NC}"
        exit 1
    fi
    
    if ! curl -s -f "$EUREKA_URL/actuator/health" > /dev/null; then
        echo -e "${RED}❌ Eureka Server not responding${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Services are running${NC}"
    echo ""
}

# Get service instances from Eureka
get_service_instances() {
    local service_name=$1
    echo -e "${YELLOW}📊 Checking $service_name instances...${NC}"
    
    local response=$(curl -s "$EUREKA_URL/eureka/apps/$service_name" 2>/dev/null)
    local instances=$(echo "$response" | grep -o "<instance>" | wc -l)
    
    if [ "$instances" -eq 0 ]; then
        echo -e "${RED}❌ No instances found for $service_name${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Found $instances instance(s) of $service_name${NC}"
    
    # Extract instance details
    echo "$response" | grep -E "<hostName>|<port>" | while read line; do
        if [[ $line == *"<hostName>"* ]]; then
            local host=$(echo "$line" | sed 's/<[^>]*>//g' | xargs)
            echo -e "${CYAN}   Host: $host${NC}"
        elif [[ $line == *"<port>"* ]]; then
            local port=$(echo "$line" | sed 's/<[^>]*>//g' | xargs)
            echo -e "${CYAN}   Port: $port${NC}"
        fi
    done
    
    echo ""
    return $instances
}

# Create a simple deck for testing
create_test_deck() {
    echo -e "${YELLOW}📦 Creating test deck...${NC}"
    
    local deck_payload='{
        "name": "Load Test Deck",
        "description": "Test deck for load distribution",
        "hexColor": "#2196F3"
    }'
    
    local response=$(curl -s -X POST "$GATEWAY_URL/api/v2/decks" \
        -H "Content-Type: application/json" \
        -d "$deck_payload")
    
    local deck_id=$(echo "$response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$deck_id" ]; then
        echo -e "${GREEN}✅ Test deck created: $deck_id${NC}"
        echo "$deck_id" > /tmp/test_deck_id.txt
    else
        echo -e "${RED}❌ Failed to create test deck${NC}"
        exit 1
    fi
    
    echo ""
}

# Single request function with response tracking
make_request() {
    local url=$1
    local request_id=$2
    local start_time=$(date +%s.%N)
    
    local response=$(curl -s -w "%{http_code}:%{time_total}:%{remote_ip}:%{local_port}" "$url" 2>/dev/null)
    local end_time=$(date +%s.%N)
    
    # Extract curl stats
    local stats="${response##*:}"
    local http_code=$(echo "$stats" | cut -d':' -f1)
    local response_time=$(echo "$stats" | cut -d':' -f2)
    local remote_ip=$(echo "$stats" | cut -d':' -f3)
    local local_port=$(echo "$stats" | cut -d':' -f4)
    
    local total_time=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "0")
    
    echo "$request_id|$http_code|$response_time|$total_time|$remote_ip|$local_port"
}

# Test concurrent load distribution
test_load_distribution() {
    local service_name=$1
    local endpoint=$2
    local description=$3
    
    echo -e "${YELLOW}🎯 Testing: $description${NC}"
    echo -e "${CYAN}   Service: $service_name${NC}"
    echo -e "${CYAN}   Endpoint: $endpoint${NC}"
    echo -e "${CYAN}   Total requests: $TOTAL_REQUESTS${NC}"
    echo -e "${CYAN}   Concurrent: $CONCURRENT_REQUESTS${NC}"
    echo ""
    
    local full_url="$GATEWAY_URL$endpoint"
    local results_file="/tmp/load_test_${service_name}_results.txt"
    
    # Clear results file
    > "$results_file"
    
    echo -e "${CYAN}🚀 Sending $TOTAL_REQUESTS concurrent requests...${NC}"
    
    # Export function for parallel execution
    export -f make_request
    export GATEWAY_URL
    
    local start_time=$(date +%s.%N)
    
    # Send concurrent requests
    seq 1 $TOTAL_REQUESTS | xargs -n 1 -P $CONCURRENT_REQUESTS -I {} \
        bash -c "make_request '$full_url' {}" >> "$results_file"
    
    local end_time=$(date +%s.%N)
    local total_duration=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "0")
    
    echo -e "${GREEN}✅ All requests completed in ${total_duration}s${NC}"
    echo ""
    
    # Analyze results
    analyze_distribution "$service_name" "$results_file" "$total_duration"
    
    echo ""
}

# Analyze load distribution results
analyze_distribution() {
    local service_name=$1
    local results_file=$2
    local total_duration=$3
    
    if [ ! -f "$results_file" ]; then
        echo -e "${RED}❌ Results file not found${NC}"
        return
    fi
    
    local total_requests=$(wc -l < "$results_file")
    local successful_requests=$(awk -F'|' '$2 ~ /^2[0-9][0-9]$/ {count++} END {print count+0}' "$results_file")
    local failed_requests=$((total_requests - successful_requests))
    
    echo -e "${YELLOW}📈 Load Distribution Analysis for $service_name:${NC}"
    echo ""
    
    # Basic statistics
    echo -e "${CYAN}📊 Request Statistics:${NC}"
    echo -e "${CYAN}   Total requests sent: $total_requests${NC}"
    echo -e "${CYAN}   Successful (2xx): $successful_requests${NC}"
    echo -e "${CYAN}   Failed: $failed_requests${NC}"
    echo -e "${CYAN}   Success rate: $(( successful_requests * 100 / total_requests ))%${NC}"
    echo -e "${CYAN}   Total time: ${total_duration}s${NC}"
    echo -e "${CYAN}   Throughput: $(echo "scale=2; $successful_requests / $total_duration" | bc -l 2>/dev/null || echo "0") req/s${NC}"
    echo ""
    
    # Response time analysis
    echo -e "${CYAN}⏱️  Response Time Analysis:${NC}"
    local avg_time=$(awk -F'|' '{sum+=$3; count++} END {if(count>0) printf "%.3f", sum/count; else print "0"}' "$results_file")
    local min_time=$(awk -F'|' 'NR==1{min=$3} {if($3<min) min=$3} END {printf "%.3f", min}' "$results_file")
    local max_time=$(awk -F'|' '{if($3>max) max=$3} END {printf "%.3f", max}' "$results_file")
    
    echo -e "${CYAN}   Average: ${avg_time}s${NC}"
    echo -e "${CYAN}   Minimum: ${min_time}s${NC}"
    echo -e "${CYAN}   Maximum: ${max_time}s${NC}"
    echo ""
    
    # Port distribution (indicates load balancing)
    echo -e "${CYAN}🔄 Load Distribution by Port:${NC}"
    awk -F'|' '{print $6}' "$results_file" | sort | uniq -c | sort -nr | while read count port; do
        if [ -n "$port" ] && [ "$port" != "0" ]; then
            local percentage=$(echo "scale=1; $count * 100 / $total_requests" | bc -l 2>/dev/null || echo "0")
            echo -e "${CYAN}   Port $port: $count requests (${percentage}%)${NC}"
        fi
    done
    echo ""
    
    # HTTP status code distribution
    echo -e "${CYAN}📋 HTTP Status Distribution:${NC}"
    awk -F'|' '{print $2}' "$results_file" | sort | uniq -c | sort -nr | while read count status; do
        echo -e "${CYAN}   HTTP $status: $count responses${NC}"
    done
    echo ""
    
    # Request timeline (first 10 and last 10 requests)
    echo -e "${CYAN}📅 Request Timeline (first 10):${NC}"
    head -10 "$results_file" | while IFS='|' read req_id http_code resp_time total_time remote_ip local_port; do
        echo -e "${CYAN}   Request $req_id: HTTP $http_code, ${resp_time}s, port $local_port${NC}"
    done
    echo ""
    
    echo -e "${CYAN}📅 Request Timeline (last 10):${NC}"
    tail -10 "$results_file" | while IFS='|' read req_id http_code resp_time total_time remote_ip local_port; do
        echo -e "${CYAN}   Request $req_id: HTTP $http_code, ${resp_time}s, port $local_port${NC}"
    done
    echo ""
}

# Test with real-time monitoring
test_with_monitoring() {
    echo -e "${YELLOW}📊 Starting real-time monitoring test...${NC}"
    echo ""
    
    # Start background monitoring
    monitor_services &
    local monitor_pid=$!
    
    # Run the actual load test
    test_load_distribution "DECK-SERVICE" "/api/v2/decks" "Deck Service Load Distribution"
    
    if [ -f /tmp/test_deck_id.txt ]; then
        local deck_id=$(cat /tmp/test_deck_id.txt)
        test_load_distribution "CARD-SERVICE" "/api/v2/decks/$deck_id/cards" "Card Service Load Distribution"
    fi
    
    # Stop monitoring
    kill $monitor_pid 2>/dev/null
    wait $monitor_pid 2>/dev/null
}

# Monitor services during test
monitor_services() {
    local counter=0
    while [ $counter -lt 30 ]; do
        echo -e "${PURPLE}📡 Monitoring services... (${counter}s)${NC}"
        
        # Check Eureka status
        local deck_instances=$(curl -s "$EUREKA_URL/eureka/apps/DECK-SERVICE" 2>/dev/null | grep -o "<instance>" | wc -l)
        local card_instances=$(curl -s "$EUREKA_URL/eureka/apps/CARD-SERVICE" 2>/dev/null | grep -o "<instance>" | wc -l)
        
        echo -e "${PURPLE}   Deck Service: $deck_instances instances${NC}"
        echo -e "${PURPLE}   Card Service: $card_instances instances${NC}"
        
        sleep 5
        counter=$((counter + 5))
    done
}

# Cleanup test data
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up...${NC}"
    
    if [ -f /tmp/test_deck_id.txt ]; then
        local deck_id=$(cat /tmp/test_deck_id.txt)
        curl -s -X DELETE "$GATEWAY_URL/api/v2/decks/$deck_id" > /dev/null
        rm -f /tmp/test_deck_id.txt
    fi
    
    rm -f /tmp/load_test_*_results.txt
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Handle script interruption
trap 'echo -e "\n${RED}🛑 Test interrupted. Cleaning up...${NC}"; cleanup; exit 1' INT TERM

# Main execution
main() {
    check_services
    
    # Check service instances
    get_service_instances "DECK-SERVICE"
    local deck_instances=$?
    
    get_service_instances "CARD-SERVICE"  
    local card_instances=$?
    
    if [ $deck_instances -eq 0 ] || [ $card_instances -eq 0 ]; then
        echo -e "${RED}❌ Insufficient service instances for load balancing test${NC}"
        echo -e "${YELLOW}💡 Start multiple instances with: ./start.sh${NC}"
        exit 1
    fi
    
    create_test_deck
    test_with_monitoring
    cleanup
    
    echo -e "${GREEN}🎉 Load distribution test completed!${NC}"
    echo ""
    echo -e "${YELLOW}💡 Analysis Summary:${NC}"
    echo -e "${CYAN}   - Check port distribution to verify load balancing${NC}"
    echo -e "${CYAN}   - Monitor response times for performance impact${NC}"
    echo -e "${CYAN}   - Verify all service instances received requests${NC}"
    echo -e "${CYAN}   - Use Eureka dashboard: http://localhost:8761${NC}"
    echo -e "${CYAN}   - Use Zipkin tracing: http://localhost:9411${NC}"
}

# Run the test
main