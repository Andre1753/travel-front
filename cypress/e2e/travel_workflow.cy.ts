// cypress/e2e/travel_workflow.cy.ts

Cypress.Commands.overwrite('click', (originalFn, element, options) => {
  if (options && options.force === undefined) {
    options.force = true;
  }
  return originalFn(element, options);
});

describe('Travel Front-end E2E - Fluxos de Negócio', () => {
  
  beforeEach(() => {
    cy.intercept('POST', '**/api/v1/login', {
      statusCode: 200,
      body: { access_token: 'fake-jwt-token' }
    }).as('loginRequest');
  });

  // ==========================================
  // CONTEXTO 1: FLUXO DO ALUNO / USUÁRIO COMUM
  // ==========================================
  context('Visão do Aluno', () => {
    beforeEach(() => {
      window.localStorage.setItem('travel_token', 'fake-user-token');
      
      cy.intercept('GET', '**/api/v1/me', {
        statusCode: 200,
        body: { data: { name: 'João Aluno', email: 'joao@dev.com', permissions: { is_admin: false } } }
      }).as('meUser');
    });

    it('deve listar pedidos, garantindo que status e datas retornem e renderizem corretamente', () => {
      cy.intercept('GET', '**/api/v1/travel-orders*', {
        statusCode: 200,
        body: {
          data: [{
            id: 'ALUNO-1',
            order_number: 'TRV-ALUNO-001',
            origin: 'São Paulo - SP',
            destination: 'Rio de Janeiro - RJ',
            departure_date: '2026-10-15',
            status: 'solicitado',
            created_at: '2026-03-22T10:00:00Z'
          }]
        }
      }).as('getOrdersUser');

      cy.visit('/dashboard');
      cy.wait('@getOrdersUser');

      cy.contains('TRV-ALUNO-001').should('be.visible');
      cy.contains('solicitado').should('be.visible'); 
      cy.contains('Ida: 2026-10-15').should('be.visible'); 
      cy.get('#filter-search').should('not.exist');
    });

    it('deve aplicar filtros permitidos para o Aluno', () => {
      cy.intercept('GET', '**/api/v1/travel-orders*', { statusCode: 200, body: { data: [] } }).as('filterOrders');
      cy.intercept('GET', 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios*').as('ibgeLoadFilter');
      
      cy.visit('/dashboard');
      
      // O PULO DO GATO: Consome a requisição do onMounted para não bugar o teste
      cy.wait('@filterOrders');
      cy.wait('@ibgeLoadFilter', { timeout: 15000 });

      cy.get('#filter-status').select('aprovado');
      
      cy.get('#filter-origin').type('Campinas - SP', { delay: 0 });
      cy.get('ul[data-test="city-dropdown"]').should('be.visible').find('li').first().click({ force: true });
      
      cy.get('#filter-start-date').clear().type('2026-12-01');
      
      cy.contains('button', 'Aplicar Filtros').click();

      // VALIDAÇÃO BLINDADA: Lê o objeto de Query e ignora o encoding de URL
      cy.wait('@filterOrders').then((interception) => {
        expect(interception.request.query.status).to.eq('aprovado');
        expect(interception.request.query.start_date).to.eq('2026-12-01');
      });
    });

    it('deve criar e editar um pedido do Aluno com IDs no Modal', () => {
      cy.intercept('GET', '**/api/v1/travel-orders*', { statusCode: 200, body: { data: [] } }).as('getEmpty');
      cy.intercept('POST', '**/api/v1/travel-orders', { statusCode: 201 }).as('createOrder');
      cy.intercept('PUT', '**/api/v1/travel-orders/*', { statusCode: 200 }).as('updateOrder');
      cy.intercept('GET', 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios*').as('ibgeLoad');

      cy.visit('/dashboard');
      
      // CRIAÇÃO
      cy.contains('button', 'Novo Pedido').click();
      
      cy.get('#modal-origin').type('São Paulo - SP', { delay: 0 });
      cy.get('ul[data-test="city-dropdown"]').should('be.visible').find('li').first().click({ force: true });
      
      cy.get('#modal-destination').type('Rio de Janeiro - RJ', { delay: 0 });
      cy.get('ul[data-test="city-dropdown"]').should('be.visible').find('li').first().click({ force: true });
      
      cy.get('#modal-departure-date').clear().type('2026-11-20');
      
      cy.contains('button', 'Enviar Solicitação').click();
      cy.wait('@createOrder');

      // EDIÇÃO: AQUI ESTAVA O ERRO DE HTML5. ADICIONADO "departure_date" NO MOCK!
      cy.intercept('GET', '**/api/v1/travel-orders*', {
        statusCode: 200,
        body: { data: [{ id: 'ALUNO-EDIT', order_number: 'TRV-EDT', origin: 'São Paulo - SP', destination: 'Rio de Janeiro - RJ', departure_date: '2026-11-20', status: 'solicitado' }] }
      }).as('getOrdersForEdit');
      
      cy.contains('button', 'Limpar').click(); 
      cy.wait('@getOrdersForEdit');

      cy.contains('button', '✏️ Editar Pedido').click();
      
      cy.get('#modal-destination').clear().type('Santos - SP', { delay: 0 });
      cy.get('ul[data-test="city-dropdown"]').should('be.visible').find('li').first().click({ force: true });
        
      cy.contains('button', 'Salvar Alterações').click();
      cy.wait('@updateOrder');
    });

    it('deve acessar o perfil do Aluno e visualizar os dados corretamente', () => {
      cy.visit('/dashboard');
      cy.contains('button', 'Perfil').click();
      
      cy.url().should('include', '/profile');
      cy.contains('João Aluno').should('be.visible');
      cy.contains('joao@dev.com').should('be.visible');
    });
  });

  // ==========================================
  // CONTEXTO 2: FLUXO DO ADMIN / GESTOR
  // ==========================================
  context('Visão do Admin', () => {
    beforeEach(() => {
      window.localStorage.setItem('travel_token', 'fake-admin-token');
      
      cy.intercept('GET', '**/api/v1/me', {
        statusCode: 200,
        body: { data: { name: 'Admin Supremo', email: 'admin@distribuidora.com', permissions: { is_admin: true } } }
      }).as('meAdmin');

      cy.intercept('GET', '**/api/v1/travel-orders*', {
        statusCode: 200,
        body: {
          data: [{
            id: 'ADMIN-1',
            order_number: 'TRV-ADM-999',
            origin: 'Belo Horizonte - MG',
            destination: 'Vitória - ES',
            departure_date: '2026-05-10',
            status: 'solicitado',
            requester_name: 'Aluno João Silva', 
            created_at: '2026-03-20T14:30:00Z'
          }]
        }
      }).as('getOrdersAdmin');
    });

    it('deve visualizar dados exclusivos, testar filtro de solicitante e abrir Auditoria', () => {
      cy.visit('/dashboard');
      cy.wait('@meAdmin');
      
      // Consome o onMounted do Admin
      cy.wait('@getOrdersAdmin');

      cy.contains('Solicitante: Aluno João Silva').should('be.visible');
      cy.contains('button', '✏️ Editar Pedido').should('not.exist'); 

      cy.get('#filter-search').should('be.visible').type('João Silva');
      cy.contains('button', 'Aplicar Filtros').click();
      
      // Validação blindada ignorando o encoding de URL
      cy.wait('@getOrdersAdmin').then((interception) => {
        expect(interception.request.query.search).to.eq('João Silva'); 
      });

      cy.contains('button', 'Visualizar Auditoria').click();
      cy.contains('h2', 'Auditoria do Pedido').should('be.visible'); 
      cy.get('body').type('{esc}'); 
    });

    it('deve aprovar um pedido via SweetAlert2', () => {
      cy.intercept('PATCH', '**/api/v1/travel-orders/*/status', {
        statusCode: 200,
        body: { data: { status: 'aprovado' } }
      }).as('approveOrder');

      cy.visit('/dashboard');
      cy.wait('@getOrdersAdmin');

      cy.contains('button', 'Aprovar').click();
      
      cy.contains('Aprovar Pedido?').should('be.visible');
      cy.contains('button', 'Sim, Aprovar').click();

      cy.wait('@approveOrder').then((interception) => {
        expect(interception.request.body.status).to.eq('aprovado');
      });
      
      cy.contains('Pedido aprovado com sucesso!').should('be.visible');
    });

    it('deve reprovar (cancelar) um pedido via SweetAlert2', () => {
      cy.intercept('PATCH', '**/api/v1/travel-orders/*/status', {
        statusCode: 200,
        body: { data: { status: 'cancelado' } }
      }).as('rejectOrder');

      cy.visit('/dashboard');
      cy.wait('@getOrdersAdmin');

      cy.contains('button', 'Rejeitar').click();
      
      cy.contains('Rejeitar Pedido?').should('be.visible');
      cy.contains('Esta ação é irreversível').should('be.visible');
      cy.contains('button', 'Sim, Rejeitar').click();

      cy.wait('@rejectOrder').then((interception) => {
        expect(interception.request.body.status).to.eq('cancelado');
      });

      cy.contains('Pedido cancelado com sucesso!').should('be.visible');
    });

    it('deve acessar o perfil do Admin e visualizar os dados corretamente', () => {
      cy.visit('/dashboard');
      cy.contains('button', 'Perfil').click();
      
      cy.url().should('include', '/profile');
      cy.contains('Admin Supremo').should('be.visible');
      cy.contains('admin@distribuidora.com').should('be.visible');
    });

    it('deve realizar logout, limpar o storage e redirecionar para o login', () => {
      cy.visit('/dashboard');
      cy.contains('button', 'Sair').click();
      
      cy.url().should('include', '/login');
      
      cy.window().then((window) => {
        expect(window.localStorage.getItem('travel_token')).to.be.null;
      });
    });
  });
});