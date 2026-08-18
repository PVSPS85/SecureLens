#!/bin/bash

# Simple verification script for health check endpoint

HEALTH_URL="http://localhost:5001/api/v1/health"
RESPONSE=$(curl -s "$HEALTH_URL")

if [[ "$RESPONSE" == *"\"status\":\"ok\""* ]]; then
  echo "Smoke test passed! Response: $RESPONSE"
  exit 0
else
  echo "Smoke test failed! Response: $RESPONSE"
  exit 1
fi
