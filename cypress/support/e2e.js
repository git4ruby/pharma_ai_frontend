// Import commands
import './commands'

// Disable uncaught exception handling for API errors
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false
})
