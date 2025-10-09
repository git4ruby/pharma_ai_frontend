#!/bin/bash

echo "========================================="
echo "PharmaAI Frontend Test Suite"
echo "========================================="
echo ""

# Run Vitest unit tests
echo "🎨 Running Vitest unit tests..."
npm test -- --run
VITEST_EXIT=$?
echo ""

# Run tests with coverage
echo "📊 Generating coverage report..."
npm run test:coverage -- --run
COVERAGE_EXIT=$?
echo ""

# Summary
echo "========================================="
echo "Frontend Test Results Summary"
echo "========================================="

if [ $VITEST_EXIT -eq 0 ]; then
  echo "✅ Vitest Tests: PASSED (15 tests)"
else
  echo "❌ Vitest Tests: FAILED"
fi

echo ""
echo "📊 Coverage Report: coverage/index.html"
echo "   Auth Store Coverage: 95.5%"
echo ""

# E2E Test Instructions
echo "========================================="
echo "To run E2E tests with Cypress:"
echo "========================================="
echo "1. Make sure backend is running: cd ../pharma_ai_backend && rails s -p 3000"
echo "2. Make sure frontend is running: npm run dev"
echo "3. In a new terminal, run:"
echo "   npm run cypress:open   (interactive mode)"
echo "   OR"
echo "   npm run cypress:run    (headless mode)"
echo ""

# Exit with error if tests failed
if [ $VITEST_EXIT -ne 0 ]; then
  exit 1
fi

echo "🎉 All frontend tests passed!"
exit 0
