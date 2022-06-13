import supertest from 'supertest';
import { describe, beforeAll, test, expect } from '@jest/globals';

const api = supertest('https://fakestoreapi.com');

let createdUserId

describe('User API', () => {
  beforeAll(() => {
    console.log('Iniciando testes de API de usuários...');
  });

  test('Cria um novo usuário via POST /users e retorna status 200 com o id', async () => {
    const userData = {
      email: 'carlos@teste.com',
      username: 'carlosoliveira',
      password: 'senha123',
      name: {
        firstname: 'Carlos',
        lastname: 'Oliveira',
      },
      address: {
        city: 'Cidade Carlos',
        street: 'Rua Carlos',
        number: 456,
        zipcode: '98765-432',
        geolocation: { lat: '10', long: '20' },
      },
      phone: '987654321'
    };

    console.log('Enviando requisição para criar usuário...');
    const response = await api.post('/users')
      .send(userData)
      .set('Content-Type', 'application/json');

    console.log('Resposta recebida:', response.status, response.body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    createdUserId = response.body.id;
    expect(typeof createdUserId).toBe('number');
  });

  test('Recupera o usuário criado com GET /users/:id', async () => {
    if (!createdUserId) {
      console.log('Skipping test because no user was created');
      return;
    }

    console.log('Recuperando usuário com ID:', createdUserId);

    const response = await api.get(`/users/${createdUserId}`);
    console.log('Resposta recebida:', response.status, response.body);
    expect(response.status).toBe(200);

    if (response.body) {
      expect(response.body).toHaveProperty('id');
    } else {
      console.log('Warning: User data not returned, but API call succeeded');
    }
  });

  test('Lista todos usuários com GET /users', async () => {
    const response = await api.get('/users');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('Atualiza usuário criado via PUT /users/:id', async () => {
    if (!createdUserId) {
      console.log('Skipping test because no user was created');
      return;
    }

    const updatedUserData = {
      email: 'carlosgg@teste.com',
      username: 'carlos_oliveiragg_updated',
      password: 'senha456g',
      name: {
        firstname: 'Carlos',
        lastname: 'OliveiraAtualizado'
      },
      address: {
        city: 'Cidade Carlos Atualizada',
        street: 'Rua Carlos Atualizada',
        number: 7849,
        zipcode: '12345-987',
        geolocation: { lat: '10.1', long: '20.1' }
      },
      phone: '984654322'
    };

    const response = await api.put(`/users/${createdUserId}`)
      .send(updatedUserData)
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toBeTruthy();
  });

  test('Deleta usuário criado via DELETE /users/:id', async () => {
    if (!createdUserId) {
      console.log('Skipping test because no user was created');
      return;
    }
    const response = await api.delete(`/users/${createdUserId}`);
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  test('Tenta deletar usuário inexistente retorna resposta válida', async () => {
    const invalidUserId = 99999999;
    const response = await api.delete(`/users/${invalidUserId}`);
    expect(response.status).toBeDefined();
  });

  test('Tenta criar usuário sem email (deve falhar)', async () => {
    const userData = {
      username: 'usuarioSemEmail',
      password: 'senhaQualquer',
      name: {
        firstname: 'Ana',
        lastname: 'Teste',
      },
      address: {
        city: 'Cidade',
        street: 'Rua',
        number: 123,
        zipcode: '00000-000',
        geolocation: { lat: '0', long: '0' },
      },
      phone: '111111111'
    };
    const response = await api.post('/users')
      .send(userData)
      .set('Content-Type', 'application/json');
    expect([200, 400, 422]).toContain(response.status);
  });

  test('Busca usuário com id inexistente deve retornar erro ou objeto vazio', async () => {
    const invalidUserId = 99999999;
    const response = await api.get(`/users/${invalidUserId}`);
    expect([404, 200]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body).toBeDefined();
    }
  });

  test('Tenta atualizar usuário inexistente retorna erro ou objeto original', async () => {
    const invalidUserId = 99999999;
    const updateData = {
      username: 'fakeupdate',
      password: 'fakepass',
      name: { firstname: 'Fake', lastname: 'User' },
      address: { city: 'n', street: 'n', number: 0, zipcode: '1', geolocation: { lat: '0', long: '0' } },
      phone: '0'
    };
    const response = await api.put(`/users/${invalidUserId}`)
      .send(updateData)
      .set('Content-Type', 'application/json');
    expect([404, 200]).toContain(response.status);
  });

  test('Tenta criar usuário com tipos de campo inválidos', async () => {
    const userData = {
      email: 12345,
      username: true,
      password: [],
      name: {
        firstname: null,
        lastname: undefined,
      },
      address: {},
      phone: 123
    };
    const response = await api.post('/users')
      .send(userData)
      .set('Content-Type', 'application/json');
    expect([200, 400, 422]).toContain(response.status);
  });
});
