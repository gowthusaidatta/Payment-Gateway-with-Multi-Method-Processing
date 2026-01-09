#!/bin/bash

# Payment Gateway - Build & Verify Script
# Checks all components before Docker deployment

set -e

echo "========================================="
echo "Payment Gateway - Build Verification"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker
echo -e "${YELLOW}[1/5] Checking Docker...${NC}"
if command -v docker &> /dev/null; then
  echo -e "${GREEN}✓ Docker installed${NC}"
else
  echo -e "${RED}✗ Docker not found${NC}"
  exit 1
fi

# Check Docker Compose
echo -e "${YELLOW}[2/5] Checking Docker Compose...${NC}"
if command -v docker-compose &> /dev/null; then
  echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
  echo -e "${RED}✗ Docker Compose not found${NC}"
  exit 1
fi

# Check Java (optional for local development)
echo -e "${YELLOW}[3/5] Checking Java...${NC}"
if command -v java &> /dev/null; then
  JAVA_VERSION=$(java -version 2>&1 | head -1)
  echo -e "${GREEN}✓ Java installed: $JAVA_VERSION${NC}"
else
  echo -e "${YELLOW}⚠ Java not installed (needed for local dev only)${NC}"
fi

# Check Node (optional for local frontend development)
echo -e "${YELLOW}[4/5] Checking Node.js...${NC}"
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
else
  echo -e "${YELLOW}⚠ Node.js not installed (needed for local frontend dev only)${NC}"
fi

# Check critical files
echo -e "${YELLOW}[5/5] Checking critical files...${NC}"
REQUIRED_FILES=(
  "docker-compose.yml"
  ".env.example"
  "README.md"
  "backend/pom.xml"
  "backend/Dockerfile"
  "frontend/package.json"
  "frontend/Dockerfile"
  "checkout-page/package.json"
  "checkout-page/Dockerfile"
)

MISSING_FILES=()
for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓ $file${NC}"
  else
    echo -e "${RED}✗ $file${NC}"
    MISSING_FILES+=("$file")
  fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
  echo ""
  echo -e "${GREEN}=========================================${NC}"
  echo -e "${GREEN}All checks passed! Ready to deploy.${NC}"
  echo -e "${GREEN}=========================================${NC}"
  echo ""
  echo "Next steps:"
  echo "1. docker-compose up -d"
  echo "2. Wait for all services to be healthy"
  echo "3. Visit http://localhost:3000 for dashboard"
  echo "4. Or http://localhost:3001/checkout?order_id=... for checkout"
  exit 0
else
  echo ""
  echo -e "${RED}=========================================${NC}"
  echo -e "${RED}Build verification FAILED${NC}"
  echo -e "${RED}Missing files: ${#MISSING_FILES[@]}${NC}"
  echo -e "${RED}=========================================${NC}"
  exit 1
fi
