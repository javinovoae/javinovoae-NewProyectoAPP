describe('Pruebas del API de autenticación', () => {

it('debe hacer login exitosamente con credenciales válidas', () => {
        const credentials = {
            username: 'bodoque', 
            password: '1111' 
        };
    
        // Realiza la petición POST 
        cy.request('POST', `${Cypress.env('apiUrl')}/login/`, credentials)
        .then((response) => {
            // Verifica que la respuesta 
            expect(response.status).to.eq(200);
            
            // Verifica que el cuerpo de la respuesta contenga los datos esperados
            expect(response.body).to.have.property('message', 'Login exitoso');
            expect(response.body).to.have.property('user_id');
            expect(response.body).to.have.property('username', credentials.username);
        });
    });

it('debe fallar el login con credenciales incorrectas', () => {
    // credenciales incorrectas
    const invalidCredentials = {
        username: 'usuario_invalido', 
        password: 'contraseña_incorrecta' 
    };

    // petición POST
    cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/login/`,
        body: invalidCredentials,
        failOnStatusCode: false 
        }).then((response) => {
        // estado : 401 (Unauthorized)
        expect(response.status).to.eq(401);

        //mensaje de error esperado
        expect(response.body).to.have.property('detail', 'Credenciales incorrectas');
        });
    });
    });


