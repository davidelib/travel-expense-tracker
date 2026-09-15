#!/bin/bash

# Build script for deployment
echo "Building Travel Expense Tracker..."
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"

echo "Installing dependencies..."
npm ci

echo "Running type check..."
npm run type-check

echo "Building application..."
npm run build

echo "Build complete! Ready for deployment."
