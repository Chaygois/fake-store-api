import supertest from 'supertest';
import { describe, beforeAll, test, expect } from '@jest/globals';

const api = supertest('https://fakestoreapi.com');

let createdProductId

describe('Product API', () => {
  beforeAll(() => {
    console.log('Iniciando testes de API de produtos...');
  });

  // POSITIVOS

  test('Lista todos os produtos (GET /products)', async () => {
    const response = await api.get('/products');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('Listar produto específico por ID (GET /products/:id)', async () => {
    // Primeiro busca lista de produtos para pegar um id real.
    const productsList = await api.get('/products');
    expect(productsList.status).toBe(200);
    const id = productsList.body[0]?.id;
    expect(typeof id).toBe('number');

    const response = await api.get(`/products/${id}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', id);
  });

  test('Listar produtos por categoria (GET /products/category/:category)', async () => {
    const categoriesRes = await api.get('/products/categories');
    expect(categoriesRes.status).toBe(200);
    const categories = categoriesRes.body;
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);

    const category = categories[0];
    const response = await api.get(`/products/category/${category}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
response.body.forEach((p) => {
      expect(p.category).toBe(category);
    });
  });

  test('Criar um novo produto (POST /products)', async () => {
    const productData = {
      title: 'Novo Produto Teste',
      price: 123.45,
      description: 'Produto criado para teste automatizado',
      image: 'https://i.pravatar.cc/150?img=1',
      category: 'electronics',
    };

    const response = await api.post('/products')
      .send(productData)
      .set('Content-Type', 'application/json');

    expect([200, 201]).toContain(response.status);
    expect(response.body).toHaveProperty('id');
    createdProductId = response.body.id;
    expect(typeof createdProductId).toBe('number');
  });

  test('Atualizar produto existente (PUT /products/:id)', async () => {
    if (!createdProductId) {
      console.log('Skipping update test as product was not created');
      return;
    }
    const updatedData = {
      title: 'Produto Teste Atualizado',
      price: 222.22,
      description: 'Descrição Atualizada',
      image: 'https://i.pravatar.cc/150?img=2',
      category: 'jewelery',
    };

    const response = await api.put(`/products/${createdProductId}`)
      .send(updatedData)
      .set('Content-Type', 'application/json');

    expect([200, 201]).toContain(response.status);
    expect(response.body).toHaveProperty('id', createdProductId);
    expect(response.body.title).toBe(updatedData.title);
  });

  test('Deletar produto existente (DELETE /products/:id)', async () => {
    if (!createdProductId) {
      console.log('Skipping delete test as product was not created');
      return;
    }
    const response = await api.delete(`/products/${createdProductId}`);
    expect([200, 201]).toContain(response.status);
    expect(response.body).toBeDefined();
  });

  // NEGATIVOS

  test('Tentar acessar um produto inexistente (GET /products/:id)', async () => {
    const response = await api.get('/products/99999999');
    expect([404, 200]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body).toBeDefined();
    }
  });

  test('Tentar criar produto com dados inválidos', async () => {
    const productData = {
      title: 123,
      description: null,
      image: 789,
      category: false,
    };
    const response = await api.post('/products')
      .send(productData)
      .set('Content-Type', 'application/json');
    expect([200, 400, 422]).toContain(response.status);
  });

  test('Tentar atualizar produto inexistente', async () => {
    const invalidId = 99999999;
    const updateData = {
      title: 'Fake Update',
      price: 10,
      description: 'desc',
      image: 'fake.jpg',
      category: 'electronics',
    };
    const response = await api.put(`/products/${invalidId}`)
      .send(updateData)
      .set('Content-Type', 'application/json');
    expect([404, 200]).toContain(response.status);
  });

  test('Tentar deletar produto com id inválido', async () => {
    const response = await api.delete('/products/99999999');
    expect([404, 200]).toContain(response.status);
  });

  test('Tentar listar produtos por categoria inexistente ou filtro inválido', async () => {
    const response = await api.get('/products/category/nao-existe-categoria');
    expect([200, 404]).toContain(response.status);
    if (response.status === 200) {
      expect(Array.isArray(response.body)).toBe(true);
    }
})});