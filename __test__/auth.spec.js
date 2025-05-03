import supertest from 'supertest';
import { describe, test, expect } from '@jest/globals';

const api = supertest('https://fakestoreapi.com');
const validUsername = "mor_2314";
const validPassword = "83r5^_";

describe('/auth/login API', () => {
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

  const testCases = [
    { username: "usuario_inexistente", password: validPassword },
    { username: validUsername, password: "wrongpassword" },
    { username: "", password: validPassword },
    { username: validUsername, password: "" },
  ];

  const expectedStatuses = [200, 400, 401, 404, 422];

  test.each(testCases)(
    'Login inválido / incompleto (test.parametrizado) => usuário="%s" senha="%s"',
    async ({ username, password }) => {
      const res = await api
        .post('/auth/login')
        .send({ username, password })
        .set('Content-Type', 'application/json');

      expect(expectedStatuses).toContain(res.status);

      // Se vier 200, não deve ter token
      if (res.status === 200) {
        expect(res.body).not.toHaveProperty('token');
      }
    }
  );
});
