// inventario.cy.ts

describe('Pruebas de la página de Gestión de Productos', () => {
    beforeEach(() => {
        cy.visit('http://localhost:8100/inventario');
    });

    it('Debe mostrar el título correcto de la página', () => {
        cy.get('ion-title.titulo').should('contain', 'Gestión de Productos');
    });

    it('Debe mostrar el formulario para añadir productos', () => {
        cy.get('ion-card-title.titulo-prod').should('contain', 'Añadir Nuevo Producto');
    });
    });