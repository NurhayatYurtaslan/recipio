#!/bin/bash

# 🚀 Recipio - Recipe Website Development and Deploy Script
# This script sets up, tests, and deploys the Recipio Next.js project

set -e  # Exit on error

# 🎨 Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 🎯 Logo and header
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    🍳 Recipio Recipe                      ║"
echo "║              💻 Next.js Development Script                ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 📢 Functions
print_step() {
    echo -e "${BLUE}[🔄 STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✅ SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠️  WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[❌ ERROR]${NC} $1"
}

# 📁 Check project directory
check_directory() {
    if [[ ! -f "package.json" ]]; then
        print_error "package.json not found. Make sure you're in the project root."
        exit 1
    fi
    print_success "Recipio project directory verified."
}

# 🟢 Check Node.js and npm versions
check_node() {
    print_step "Checking Node.js version..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $NODE_VERSION -lt 18 ]]; then
        print_error "Node.js 18+ required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js version is compatible: $(node --version)"
}

# 📦 Detect package manager
detect_package_manager() {
    if [[ -f "pnpm-lock.yaml" ]]; then
        PKG_MANAGER="pnpm"
        print_success "Package manager: pnpm"
    elif [[ -f "yarn.lock" ]]; then
        PKG_MANAGER="yarn"
        print_success "Package manager: yarn"
    else
        PKG_MANAGER="npm"
        print_success "Package manager: npm"
    fi
}

# 📥 Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    case $PKG_MANAGER in
        "pnpm")
            if ! command -v pnpm &> /dev/null; then
                print_warning "pnpm not installed. Installing via npm..."
                npm install -g pnpm
            fi
            pnpm install
            ;;
        "yarn")
            if ! command -v yarn &> /dev/null; then
                print_warning "yarn not installed. Installing via npm..."
                npm install -g yarn
            fi
            yarn install
            ;;
        *)
            npm install
            ;;
    esac
    print_success "Dependencies successfully installed."
}


# 🔨 Build project
build_project() {
    print_step "Building Next.js project..."
    case $PKG_MANAGER in
        "pnpm")
            pnpm run build
            ;;
        "yarn")
            yarn build
            ;;
        *)
            npm run build
            ;;
    esac
    print_success "Build completed successfully."
}

# 🧪 Setup test environment
setup_test_environment() {
    print_step "Setting up test environment..."
    # Create .env.test file (if not exists)
    if [[ ! -f ".env.test" ]]; then
        cat > .env.test << EOF
# Test Environment Variables
NODE_ENV=test
NEXT_PUBLIC_BASE_URL=http://localhost:3000
EOF
        print_success ".env.test file created"
    fi
    # Check test dependencies
    print_step "Checking test dependencies..."
    case $PKG_MANAGER in
        "pnpm")
            if ! pnpm list jest &> /dev/null; then
                print_warning "Test framework not found. Installing Jest..."
                pnpm add -D jest @testing-library/react @testing-library/jest-dom
            fi
            ;;
        "yarn")
            if ! yarn list jest &> /dev/null; then
                print_warning "Test framework not found. Installing Jest..."
                yarn add -D jest @testing-library/react @testing-library/jest-dom
            fi
            ;;
        *)
            if ! npm list jest &> /dev/null; then
                print_warning "Test framework not found. Installing Jest..."
                npm install -D jest @testing-library/react @testing-library/jest-dom
            fi
            ;;
    esac
    print_success "Test environment ready."
}

# 🌐 Start localhost server
start_localhost() {
    print_step "Starting Next.js development server..."
    case $PKG_MANAGER in
        "pnpm")
            echo -e "${GREEN}🚀 Starting Next.js dev server... http://localhost:3000${NC}"
            pnpm run dev
            ;;
        "yarn")
            echo -e "${GREEN}🚀 Starting Next.js dev server... http://localhost:3000${NC}"
            yarn dev
            ;;
        *)
            echo -e "${GREEN}🚀 Starting Next.js dev server... http://localhost:3000${NC}"
            npm run dev
            ;;
    esac
}

# 👀 Start preview server
start_preview() {
    print_step "Starting Next.js preview server..."
    build_project
    case $PKG_MANAGER in
        "pnpm")
            echo -e "${GREEN}🔍 Starting Next.js preview server... http://localhost:3000${NC}"
            pnpm run start
            ;;
        "yarn")
            echo -e "${GREEN}🔍 Starting Next.js preview server... http://localhost:3000${NC}"
            yarn start
            ;;
        *)
            echo -e "${GREEN}🔍 Starting Next.js preview server... http://localhost:3000${NC}"
            npm run start
            ;;
    esac
}

# 📚 Help message
show_help() {
    echo -e "${BLUE}Usage:${NC}"
    echo "  ./run.sh [COMMAND] [OPTIONS]"
    echo ""
    echo -e "${BLUE}Setup & Development:${NC}"
    echo "  setup           - 🛠️  Complete setup (dependencies, CLI tools)"
    echo "  dev             - 🌐 Start Next.js development server"
    echo "  build           - 🔨 Build the Next.js project"
    echo "  preview         - 👀 Build and start Next.js preview server"
    echo ""
    echo -e "${BLUE}Testing:${NC}"
    echo "  test            - 🧪 Setup test environment (Jest)"
    echo ""
    echo "  help            - 📚 Show this help message"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  ./run.sh setup                 # Complete setup"
    echo "  ./run.sh dev                   # Start Next.js development"
    echo "  ./run.sh build                 # Build the project"
}

# 🎯 Main function
main() {
    check_directory
    detect_package_manager
    case "${1:-setup}" in
        "setup")
            print_step "Starting comprehensive setup for Recipio..."
            check_node
            install_dependencies
            setup_test_environment
            print_success "Setup completed! You can start with './run.sh dev'."
            ;;
        "dev")
            check_node
            start_localhost
            ;;
        "build")
            check_node
            build_project
            ;;
        "preview")
            check_node
            start_preview
            ;;
        "test")
            check_node
            setup_test_environment
            ;;
        "help")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# 🚀 Execute the script
main "$@"