// Custom Cypress commands for PharmaAI

Cypress.Commands.add('login', (email = 'admin@example.com', password = 'Password123!') => {
  cy.visit('/login')
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/')
})

Cypress.Commands.add('logout', () => {
  cy.contains('button', 'Logout').click()
  cy.url().should('include', '/login')
})
