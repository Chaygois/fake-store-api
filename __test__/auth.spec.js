import supertest from 'supertest';
import { describe, test, expect, beforeAll } from '@jest/globals';

const api = supertest('https://fakestoreapi.com');

describe('/auth/login API', () => {
  // According to FakeStore API documentation, these are the valid credentials
  const validUsername = "mor_2314";
  const validPassword = "83r5^_";

  test('Login com credenciais válidas retorna token', async () => {
    const loginData = { username: validUsername, password: validPassword };
    const response = await api
      .post('/auth/login')
      .send(loginData)
      .set('Content-Type', 'application/json');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe('string');
  });

  test('Login com usuário inválido retorna erro ou não retorna token', async () => {
    const loginData = { username: "usuario_inexistente", password: validPassword };
    const response = await api
      .post('/auth/login')
      .send(loginData)
      .set('Content-Type', 'application/json');
    // FakeStore may return 401 or 404 (or 400), or just not return token
    expect([400, 401, 404, 200]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body).not.toHaveProperty('token');
    }
  });

  test('Login com senha inválida retorna erro ou não retorna token', async () => {
    const loginData = { username: validUsername, password: "wrongpassword" };
    const response = await api
      .post('/auth/login')
      .send(loginData)
      .set('Content-Type', 'application/json');
    expect([400, 401, 404, 200]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body).not.toHaveProperty('token');
    }
  });

  test('Login sem usuário retorna erro', async () => {
    const loginData = { password: validPassword };
    const response = await api
      .post('/auth/login')
      .send(loginData)
      .set('Content-Type', 'application/json');
    expect([400, 401, 422]).toContain(response.status);
  });

  test('Login sem senha retorna erro', async () => {
    const loginData = { username: validUsername };
    const response = await api
      .post('/auth/login')
      .send(loginData)
      .set('Content-Type', 'application/json');
    expect([400, 401, 422]).toContain(response.status);
  });
});
