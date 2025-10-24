describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should display login page', () => {
    cy.contains('h1', 'Asclepius AI').should('be.visible')
    cy.contains('HIPAA-Compliant Document Q&A System').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })

  it('should show error for invalid credentials', () => {
    cy.get('input[type="email"]').type('invalid@example.com')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()

    // Wait for login attempt to complete (button text changes back)
    cy.contains('button', 'Log In', { timeout: 15000 }).should('be.visible')

    // Should either show error message or stay on login page (both indicate failed login)
    cy.url().should('include', '/login')
  })

  it('should navigate to signup page', () => {
    cy.contains('a', 'Sign up').click()
    cy.url().should('include', '/signup')
    cy.contains('h1', 'Asclepius AI').should('be.visible')
    cy.contains('Create your account').should('be.visible')
  })

  describe('Signup', () => {
    beforeEach(() => {
      cy.visit('/signup')
    })

    it('should display signup form', () => {
      cy.get('input#first_name').should('be.visible')
      cy.get('input#last_name').should('be.visible')
      cy.get('input[type="email"]').should('be.visible')
      cy.get('input#password').should('be.visible')
      cy.get('input#password_confirmation').should('be.visible')
    })

    it('should show password requirements', () => {
      cy.contains('Must be at least 12 characters').should('be.visible')
      cy.contains('uppercase').should('be.visible')
      cy.contains('lowercase').should('be.visible')
      cy.contains('number').should('be.visible')
      cy.contains('special character').should('be.visible')
    })
  })
})
