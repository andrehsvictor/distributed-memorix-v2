#!/bin/bash
# filepath: /home/andrehsvictor/Projects/distributed-memorix-v2/load.sh

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
NUM_REQUESTS=100
CONCURRENT_REQUESTS=20

echo -e "${BLUE}🧪 Distributed Memorix Load Distribution Test${NC}"
echo "=================================================="
echo ""

# Function to check if required tools are available
check_dependencies() {
    local missing_tools=()
    
    if ! command -v curl &> /dev/null; then
        missing_tools+=("curl")
    fi
    
    if ! command -v bc &> /dev/null; then
        echo -e "${YELLOW}⚠️  'bc' calculator not found. Some calculations may be limited.${NC}"
    fi
    
    # Check if GNU parallel is available (preferred for true concurrency)
    if command -v parallel &> /dev/null; then
        echo -e "${GREEN}✅ GNU parallel found - using for optimal concurrency${NC}"
        USE_PARALLEL=true
    else
        echo -e "${YELLOW}⚠️  GNU parallel not found - using xargs for concurrency${NC}"
        echo -e "${CYAN}   Install with: sudo apt-get install parallel (Ubuntu/Debian)${NC}"
        USE_PARALLEL=false
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing required tools: ${missing_tools[*]}${NC}"
        exit 1
    fi
    
    echo ""
}

# Function to check if services are running
check_services() {
    echo -e "${YELLOW}🔍 Checking if services are available...${NC}"
    
    # Check Gateway
    if ! curl -s -f "$GATEWAY_URL/actuator/health" > /dev/null; then
        echo -e "${RED}❌ API Gateway is not responding at $GATEWAY_URL${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ API Gateway is responding${NC}"
    
    # Check Eureka
    if ! curl -s -f "$EUREKA_URL/actuator/health" > /dev/null; then
        echo -e "${RED}❌ Eureka Server is not responding at $EUREKA_URL${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Eureka Server is responding${NC}"
    
    echo ""
}

# Function to get registered instances from Eureka
get_service_instances() {
    local service_name=$1
    echo -e "${YELLOW}📊 Getting $service_name instances from Eureka...${NC}"
    
    local instances=$(curl -s "$EUREKA_URL/eureka/apps/$service_name" 2>/dev/null | grep -o "<instance>" | wc -l)
    echo -e "${CYAN}   Found $instances registered instance(s) of $service_name${NC}"
    
    # Get instance details
    local instance_info=$(curl -s "$EUREKA_URL/eureka/apps/$service_name" 2>/dev/null | grep -E "<hostName>|<port>|<instanceId>" | sed 's/<[^>]*>//g' | sed 's/^[ \t]*//')
    if [ -n "$instance_info" ]; then
        echo -e "${CYAN}   Instance details:${NC}"
        echo "$instance_info" | sed 's/^/      /'
    fi
    
    echo ""
    return $instances
}

# Function to create test data
create_test_data() {
    echo -e "${YELLOW}📦 Creating test data...${NC}"
    
    # Create a test deck
    local deck_payload='{
        "name": "Load Test Deck",
        "description": "Deck created for load distribution testing",
        "hexColor": "#FF5722"
    }'
    
    echo -e "${CYAN}   Creating test deck...${NC}"
    local deck_response=$(curl -s -X POST "$GATEWAY_URL/api/v2/decks" \
        -H "Content-Type: application/json" \
        -d "$deck_payload")
    
    if [ $? -eq 0 ]; then
        local deck_id=$(echo "$deck_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$deck_id" ]; then
            echo -e "${GREEN}   ✅ Test deck created with ID: $deck_id${NC}"
            echo "$deck_id" > /tmp/test_deck_id.txt
        else
            echo -e "${RED}   ❌ Failed to extract deck ID from response${NC}"
            echo "   Response: $deck_response"
        fi
    else
        echo -e "${RED}   ❌ Failed to create test deck${NC}"
    fi
    
    # Create test cards if deck was created successfully
    if [ -f /tmp/test_deck_id.txt ]; then
        local deck_id=$(cat /tmp/test_deck_id.txt)
        echo -e "${CYAN}   Creating test cards...${NC}"
        
        for i in {1..5}; do
            local card_payload="{
                \"question\": \"Load Test Question $i\",
                \"answer\": \"Load Test Answer $i\"
            }"
            
            local card_response=$(curl -s -X POST "$GATEWAY_URL/api/v2/decks/$deck_id/cards" \
                -H "Content-Type: application/json" \
                -d "$card_payload")
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}   ✅ Test card $i created${NC}"
            else
                echo -e "${RED}   ❌ Failed to create test card $i${NC}"
            fi
        done
    fi
    
    echo ""
}

# Function to perform a single HTTP request
perform_request() {
    local url=$1
    local method=${2:-GET}
    local request_id=$3
    
    local start_time=$(date +%s.%N)
    local response=$(curl -s -w "%{http_code}|%{time_total}|%{size_download}|%{time_connect}" \
        -X "$method" "$url" 2>/dev/null)
    local end_time=$(date +%s.%N)
    local total_time=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "0")
    
    echo "$request_id|$response|$total_time"
}

# Function to test concurrent load distribution
test_concurrent_load_distribution() {
    local service_name=$1
    local endpoint=$2
    local method=${3:-GET}
    local num_requests=${4:-$NUM_REQUESTS}
    local concurrent_level=${5:-$CONCURRENT_REQUESTS}
    
    echo -e "${YELLOW}🎯 Testing concurrent load distribution for $service_name${NC}"
    echo -e "${CYAN}   Endpoint: $method $endpoint${NC}"
    echo -e "${CYAN}   Total requests: $num_requests${NC}"
    echo -e "${CYAN}   Concurrent requests: $concurrent_level${NC}"
    echo -e "${CYAN}   Concurrency method: $([ "$USE_PARALLEL" = true ] && echo "GNU parallel" || echo "xargs")${NC}"
    
    local full_url="$GATEWAY_URL$endpoint"
    local response_file="/tmp/${service_name}_concurrent_responses.txt"
    local start_time=$(date +%s.%N)
    
    > "$response_file"
    
    echo -e "${CYAN}   🚀 Launching $num_requests concurrent requests...${NC}"
    
    if [ "$USE_PARALLEL" = true ]; then
        # Use GNU parallel for true concurrency
        seq 1 $num_requests | parallel -j $concurrent_level \
            "perform_request '$full_url' '$method' {}" >> "$response_file"
    else
        # Use xargs as fallback
        seq 1 $num_requests | xargs -n 1 -P $concurrent_level -I {} \
            bash -c "perform_request '$full_url' '$method' {}" >> "$response_file"
    fi
    
    local end_time=$(date +%s.%N)
    local total_duration=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "0")
    
    echo -e "${GREEN}   ✅ All requests completed in ${total_duration}s${NC}"
    echo ""
    
    # Analyze results
    analyze_concurrent_results "$service_name" "$response_file" "$num_requests" "$total_duration"
    
    # Cleanup
    rm -f "$response_file"
}

# Function to analyze concurrent test results
analyze_concurrent_results() {
    local service_name=$1
    local response_file=$2
    local expected_requests=$3
    local total_duration=$4
    
    echo -e "${YELLOW}📈 Concurrent Results for $service_name:${NC}"
    
    local actual_responses=$(wc -l < "$response_file" 2>/dev/null || echo "0")
    local success_count=$(awk -F'|' '$3 ~ /^2[0-9][0-9]$/ {count++} END {print count+0}' "$response_file")
    local error_count=$((actual_responses - success_count))
    local success_rate=$((success_count * 100 / expected_requests))
    
    echo -e "${CYAN}   📊 Summary:${NC}"
    echo -e "${CYAN}     Expected requests: $expected_requests${NC}"
    echo -e "${CYAN}     Actual responses: $actual_responses${NC}"
    echo -e "${CYAN}     Successful (2xx): $success_count${NC}"
    echo -e "${CYAN}     Errors: $error_count${NC}"
    echo -e "${CYAN}     Success rate: $success_rate%${NC}"
    echo -e "${CYAN}     Total duration: ${total_duration}s${NC}"
    
    if [ "$actual_responses" -gt 0 ]; then
        # Calculate throughput
        local throughput=$(echo "scale=2; $success_count / $total_duration" | bc -l 2>/dev/null || echo "0")
        echo -e "${CYAN}     Throughput: ${throughput} req/s${NC}"
        
        # Response time statistics
        local avg_response_time=$(awk -F'|' '{sum+=$4; count++} END {if(count>0) printf "%.3f", sum/count; else print "0"}' "$response_file")
        local min_response_time=$(awk -F'|' 'NR==1{min=$4} {if($4<min) min=$4} END {printf "%.3f", min}' "$response_file")
        local max_response_time=$(awk -F'|' '{if($4>max) max=$4} END {printf "%.3f", max}' "$response_file")
        
        echo -e "${CYAN}   ⏱️  Response Times:${NC}"
        echo -e "${CYAN}     Average: ${avg_response_time}s${NC}"
        echo -e "${CYAN}     Minimum: ${min_response_time}s${NC}"
        echo -e "${CYAN}     Maximum: ${max_response_time}s${NC}"
        
        # HTTP status code distribution
        echo -e "${CYAN}   📋 HTTP Status Codes:${NC}"
        awk -F'|' '{print $3}' "$response_file" | sort | uniq -c | sort -nr | while read count code; do
            echo -e "${CYAN}     $code: $count responses${NC}"
        done
        
        # Response size statistics
        local avg_size=$(awk -F'|' '{sum+=$5; count++} END {if(count>0) printf "%.0f", sum/count; else print "0"}' "$response_file")
        echo -e "${CYAN}   📦 Average response size: ${avg_size} bytes${NC}"
        
        # Connection time statistics
        local avg_connect_time=$(awk -F'|' '{sum+=$6; count++} END {if(count>0) printf "%.3f", sum/count; else print "0"}' "$response_file")
        echo -e "${CYAN}   🔌 Average connection time: ${avg_connect_time}s${NC}"
    fi
    
    echo ""
}

# Function to test burst load (maximum concurrency)
test_burst_load() {
    echo -e "${YELLOW}💥 Testing burst load (maximum concurrency)...${NC}"
    
    local burst_requests=50
    local max_concurrent=50
    
    # Test deck service burst
    test_concurrent_load_distribution "DECK-SERVICE-BURST" "/api/v2/decks" "GET" $burst_requests $max_concurrent
    
    # Test card service burst if deck exists
    if [ -f /tmp/test_deck_id.txt ]; then
        local deck_id=$(cat /tmp/test_deck_id.txt)
        test_concurrent_load_distribution "CARD-SERVICE-BURST" "/api/v2/decks/$deck_id/cards" "GET" $burst_requests $max_concurrent
    fi
}

# Function to test mixed workload
test_mixed_workload() {
    echo -e "${YELLOW}🔀 Testing mixed workload (reads + writes)...${NC}"
    
    if [ ! -f /tmp/test_deck_id.txt ]; then
        echo -e "${RED}   ❌ No test deck available for mixed workload${NC}"
        return
    fi
    
    local deck_id=$(cat /tmp/test_deck_id.txt)
    local mixed_file="/tmp/mixed_workload_results.txt"
    
    > "$mixed_file"
    
    echo -e "${CYAN}   🚀 Launching mixed concurrent requests...${NC}"
    
    # Create a function for mixed requests
    export -f perform_request
    export GATEWAY_URL
    export deck_id
    
    # Function for mixed request pattern
    perform_mixed_request() {
        local request_id=$1
        local request_type=$((request_id % 10))
        
        if [ $request_type -lt 8 ]; then
            # 80% reads
            if [ $((request_id % 2)) -eq 0 ]; then
                perform_request "$GATEWAY_URL/api/v2/decks" "GET" "$request_id"
            else
                perform_request "$GATEWAY_URL/api/v2/decks/$deck_id/cards" "GET" "$request_id"
            fi
        else
            # 20% writes (create cards)
            local card_data="{\"question\":\"Concurrent Question $request_id\",\"answer\":\"Concurrent Answer $request_id\"}"
            local start_time=$(date +%s.%N)
            local response=$(curl -s -w "%{http_code}|%{time_total}|%{size_download}|%{time_connect}" \
                -X POST "$GATEWAY_URL/api/v2/decks/$deck_id/cards" \
                -H "Content-Type: application/json" \
                -d "$card_data" 2>/dev/null)
            local end_time=$(date +%s.%N)
            local total_time=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "0")
            echo "$request_id|$response|$total_time"
        fi
    }
    
    export -f perform_mixed_request
    
    local start_time=$(date +%s.%N)
    
    if [ "$USE_PARALLEL" = true ]; then
        seq 1 30 | parallel -j 15 "perform_mixed_request {}" >> "$mixed_file"
    else
        seq 1 30 | xargs -n 1 -P 15 -I {} bash -c "perform_mixed_request {}" >> "$mixed_file"
    fi
    
    local end_time=$(date +%s.%N)
    local total_duration=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "0")
    
    echo -e "${GREEN}   ✅ Mixed workload completed in ${total_duration}s${NC}"
    
    analyze_concurrent_results "MIXED-WORKLOAD" "$mixed_file" 30 "$total_duration"
    
    rm -f "$mixed_file"
}

# Function to test health endpoints
test_health_endpoints() {
    echo -e "${YELLOW}🏥 Testing health endpoints...${NC}"
    
    local response=$(curl -s -w "%{http_code}" "$GATEWAY_URL/actuator/health" 2>/dev/null)
    local http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}   ✅ Gateway health check passed${NC}"
    else
        echo -e "${RED}   ❌ Gateway health check failed (HTTP $http_code)${NC}"
    fi
    
    echo ""
}

# Function to monitor service metrics during load test
monitor_service_metrics() {
    echo -e "${YELLOW}📊 Monitoring service metrics...${NC}"
    
    # Get Eureka service registry status
    echo -e "${CYAN}   Eureka Service Registry Status:${NC}"
    local eureka_apps=$(curl -s "$EUREKA_URL/eureka/apps" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo "$eureka_apps" | grep -o "<name>[^<]*</name>" | sed 's/<[^>]*>//g' | while read service; do
            if [ -n "$service" ]; then
                local instances=$(echo "$eureka_apps" | grep -A 20 "<name>$service</name>" | grep -o "<instance>" | wc -l)
                echo -e "${CYAN}      $service: $instances instance(s)${NC}"
            fi
        done
    else
        echo -e "${RED}      ❌ Failed to get Eureka status${NC}"
    fi
    
    echo ""
}

# Function to cleanup test data
cleanup_test_data() {
    echo -e "${YELLOW}🧹 Cleaning up test data...${NC}"
    
    if [ -f /tmp/test_deck_id.txt ]; then
        local deck_id=$(cat /tmp/test_deck_id.txt)
        echo -e "${CYAN}   Deleting test deck: $deck_id${NC}"
        
        local response=$(curl -s -w "%{http_code}" -X DELETE "$GATEWAY_URL/api/v2/decks/$deck_id" 2>/dev/null)
        local http_code="${response: -3}"
        
        if [ "$http_code" = "204" ]; then
            echo -e "${GREEN}   ✅ Test deck deleted successfully${NC}"
        else
            echo -e "${RED}   ❌ Failed to delete test deck (HTTP $http_code)${NC}"
        fi
        
        rm -f /tmp/test_deck_id.txt
    fi
    
    # Clean up any remaining temp files
    rm -f /tmp/*_responses.txt /tmp/*_results.txt
    
    echo ""
}

# Main execution
main() {
    check_dependencies
    check_services
    
    get_service_instances "DECK-SERVICE"
    local deck_instances=$?
    
    get_service_instances "CARD-SERVICE"
    local card_instances=$?
    
    if [ $deck_instances -eq 0 ] || [ $card_instances -eq 0 ]; then
        echo -e "${RED}❌ No service instances found. Make sure services are running and registered with Eureka.${NC}"
        exit 1
    fi
    
    create_test_data
    test_health_endpoints
    
    # Test concurrent load distribution for different services
    test_concurrent_load_distribution "DECK-SERVICE" "/api/v2/decks" "GET"
    
    if [ -f /tmp/test_deck_id.txt ]; then
        local deck_id=$(cat /tmp/test_deck_id.txt)
        test_concurrent_load_distribution "CARD-SERVICE" "/api/v2/decks/$deck_id/cards" "GET"
        test_concurrent_load_distribution "DECK-SERVICE-SPECIFIC" "/api/v2/decks/$deck_id" "GET"
    fi
    
    # Test burst load
    test_burst_load
    
    # Test mixed workload
    test_mixed_workload
    
    monitor_service_metrics
    cleanup_test_data
    
    echo -e "${GREEN}🎉 Concurrent load distribution test completed!${NC}"
    echo ""
    echo -e "${YELLOW}💡 Performance Analysis Tips:${NC}"
    echo -e "${CYAN}   - Check Eureka dashboard at http://localhost:8761 for service health${NC}"
    echo -e "${CYAN}   - Monitor service logs for load distribution patterns${NC}"
    echo -e "${CYAN}   - Use Zipkin at http://localhost:9411 for distributed tracing${NC}"
    echo -e "${CYAN}   - Compare response times under different concurrency levels${NC}"
    echo -e "${CYAN}   - Look for patterns in request distribution across replicas${NC}"
    echo ""
}

# Handle script interruption
trap 'echo -e "\n${RED}🛑 Test interrupted. Cleaning up...${NC}"; cleanup_test_data; exit 1' INT TERM

# Export functions for parallel execution
export -f perform_request

# Run main function
main