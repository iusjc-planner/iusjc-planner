#!/bin/bash

# IUSJ Planner - EC2 Deployment Script
# This script automates the deployment of the IUSJ Planner application on AWS EC2

set -e

echo "=========================================="
echo "IUSJ Planner - EC2 Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/iusjc-planner/iusjc-planner.git"
REPO_DIR="/home/ubuntu/iusjc-planner"
BRANCH="main"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Update system packages
log_info "Step 1: Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Step 2: Install Docker
log_info "Step 2: Installing Docker..."
if ! command -v docker &> /dev/null; then
    sudo apt install -y docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
    log_info "Docker installed successfully"
else
    log_warn "Docker is already installed"
fi

# Step 3: Install Docker Compose
log_info "Step 3: Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    log_info "Docker Compose installed successfully"
else
    log_warn "Docker Compose is already installed"
fi

# Step 4: Add ubuntu user to docker group
log_info "Step 4: Configuring Docker permissions..."
sudo usermod -aG docker ubuntu
log_warn "Please log out and log back in for group changes to take effect"

# Step 5: Clone or update repository
log_info "Step 5: Cloning/updating repository..."
if [ -d "$REPO_DIR" ]; then
    log_warn "Repository already exists, pulling latest changes..."
    cd "$REPO_DIR"
    git pull origin "$BRANCH"
else
    log_info "Cloning repository..."
    git clone -b "$BRANCH" "$REPO_URL" "$REPO_DIR"
    cd "$REPO_DIR"
fi

# Step 6: Load environment variables
log_info "Step 6: Loading environment variables..."
if [ -f ".env.production" ]; then
    export $(cat .env.production | grep -v '#' | xargs)
    log_info "Production environment variables loaded"
else
    log_error ".env.production file not found!"
    exit 1
fi

# Step 7: Build and start services
log_info "Step 7: Building and starting Docker services..."
log_warn "This may take several minutes on first run..."

# Use production docker-compose file
docker-compose -f docker-compose.prod.yml down || true
docker-compose -f docker-compose.prod.yml up -d --build

# Step 8: Wait for services to be healthy
log_info "Step 8: Waiting for services to be healthy..."
sleep 30

# Check if gateway is responding
if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    log_info "Gateway is healthy"
else
    log_warn "Gateway health check failed, services may still be starting..."
fi

# Step 9: Display service status
log_info "Step 9: Displaying service status..."
docker-compose -f docker-compose.prod.yml ps

# Step 10: Display access information
log_info "=========================================="
log_info "Deployment completed successfully!"
log_info "=========================================="
echo ""
echo "Access your application:"
echo "  Frontend:  http://$(hostname -I | awk '{print $1}')"
echo "  Gateway:   http://$(hostname -I | awk '{print $1}'):8080"
echo "  Eureka:    http://$(hostname -I | awk '{print $1}'):8761"
echo ""
echo "View logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "Stop services:"
echo "  docker-compose -f docker-compose.prod.yml down"
echo ""
