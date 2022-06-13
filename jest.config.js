module.exports = {
  preset: 'ts-jest',  // Isso permite que o Jest saiba que deve usar o ts-jest para transpilar o TypeScript
  transform: {
    '^.+\\.ts$': 'ts-jest',  // Transforma arquivos .ts com ts-jest
    '^.+\\.js$': 'babel-jest', // (Se necessário) Transforma arquivos .js com babel-jest
  },
  testEnvironment: 'node',  // Define que o ambiente de testes é o Node.js
};
