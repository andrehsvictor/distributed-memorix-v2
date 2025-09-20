#!/bin/bash

# Quick start script with predefined configurations
# This script sets environment variables and calls the main start.sh script

echo "🚀 Quick Start - Distributed Memorix"
echo "====================================="
echo "Configuration:"
echo "   - Eureka Server: 1 replica"
echo "   - Config Server: 1 replica" 
echo "   - API Gateway: 1 replica"
echo "   - Deck Service: 3 replicas (random ports)"
echo "   - Card Service: 3 replicas (random ports)"
echo ""

export EUREKA_REPLICAS=1
export CONFIG_REPLICAS=1  
export GATEWAY_REPLICAS=1
export DECK_REPLICAS=3
export CARD_REPLICAS=3

# Call the main start script
./start.sh