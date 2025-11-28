
describe('Pruebas de la página de Login', () => {
    beforeEach(() => {
        cy.visit('http://localhost:8100/login'); 
    });

    it('Debe mostrar el título correcto en la barra superior', () => {
        cy.get('ion-title.titulo').should('contain', 'Iniciar Sesión');
    });

    it('Debe mostrar el formulario de inicio de sesión', () => {
        cy.get('div.contenedor-gen > h2.titulo-gen').should('contain', 'INICIAR SESIÓN');
        cy.get('input[placeholder="Ingrese su usuario"]').should('be.visible');
        cy.get('input[placeholder="Ingrese su contraseña"]').should('be.visible');
        cy.get('ion-button.mi-boton-personalizado').should('contain', 'Ingresar');
    });

});