    describe('Pruebas E2E de la página de Inventario', () => {
    const productosDePrueba = [
        { id: 1, name: "Monitor Curvo", price: 250000 },
        { id: 2, name: "Mouse Gamer", price: 25000 }
    ];

    beforeEach(() => {
        // Configurar localStorage
        cy.window().then((win) => {
        win.localStorage.setItem('username', 'testuser');
        win.localStorage.setItem('userId', '1');
        win.localStorage.setItem('access_token', 'fake-token-1234');
        });

        //Interceptar API con delay para simular carga real
        cy.intercept('GET', '**/users/1/products', {
        statusCode: 200,
        body: productosDePrueba,
        delay: 1000 
        }).as('getProductos');

        // Visitar página con opciones mejoradas
        cy.visit('http://localhost:8100/inventario', {
        onBeforeLoad(win) {
        
            win.console.log('Iniciando visita a inventario');
        },
        timeout: 30000
        });

        // Esperar a que la aplicación esté completamente lista
        cy.get('app-inventario', { timeout: 20000 }).should('exist');
        cy.get('ion-content', { timeout: 15000 }).should('be.visible');
    });

    it('Debe mostrar la lista de productos al cargar la página', () => {
        cy.wait('@getProductos').then((interception) => {
        expect(interception.response?.statusCode).to.equal(200);
        });

    // Verificación mejorada de productos
    productosDePrueba.forEach((producto, index) => {
        const formattedPrice = producto.price.toLocaleString('es-CL');
        const priceWithComma = formattedPrice.replace(/\./g, ',');
        const regex = new RegExp(`Costo: \\$${priceWithComma.replace(/,/g, '\\,')}`);

         // 4. Localizar el ítem específico primero
            cy.contains('ion-item', producto.name, { timeout: 10000 })
            .should('exist')
            .within(() => {
            
            cy.get('h2.name-prod')
                .and('have.text', producto.name);
                
                cy.contains('p', regex)
                .should('be.visible');
            });
    });
});
});