// __test__/sesionController.test.js

// Paso 1: Crea una función auxiliar para mockear modelos Sequelize de forma robusta
const createMockSequelizeModel = (modelName) => {
  const mockModel = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findByPk: jest.fn(),
    belongsTo: jest.fn(function() { return this; }),
    hasMany: jest.fn(function() { return this; }),
    hasOne: jest.fn(function() { return this; }),
    belongsToMany: jest.fn(function() { return this; }),
    name: modelName,
    prototype: {
      save: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    },
    init: jest.fn(function() { return this; }),
  };
  return mockModel;
};

// ==========================================
// MOCKS GLOBALES - ¡IMPORTANTES!
// Deben estar al principio del archivo, ANTES de cualquier 'require'
// que cargue los módulos que van a ser mockeados.
// ==========================================
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../model/Usuario', () => createMockSequelizeModel('Usuario'));
jest.mock('../model/Anuncio', () => createMockSequelizeModel('Anuncio'));
jest.mock('../model/Favorito', () => createMockSequelizeModel('Favorito'));
jest.mock('../model/Mensaje', () => createMockSequelizeModel('Mensaje'));
jest.mock('../model/Reporte', () => createMockSequelizeModel('Reporte'));
jest.mock('../model/Vehiculo', () => createMockSequelizeModel('Vehiculo'));
// Agrega aquí cualquier otro modelo de tu carpeta `model/` si lo tienes


// ==========================================
// IMPORTACIONES
// Estas importaciones ahora obtendrán las versiones mockeadas
// de los módulos que Jest ha reemplazado.
// ==========================================
const request = require('supertest');
const app = require('../app'); // Tu aplicación Express
const sesionController = require('../controllers/sesionController');
const bcrypt = require('bcrypt'); // Ahora esto es el mock de bcrypt
const jwt = require('jsonwebtoken'); // Ahora esto es el mock de jsonwebtoken
const Usuario = require('../model/Usuario'); // Ahora esto es el mock de Usuario


// ==========================================
// PRUEBAS DE UNIDAD
// ==========================================
describe('sesionController.login (Pruebas de Unidad)', () => {
  let mockReq;
  let mockRes;
  let mockStatus;
  let mockJson;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };

    // Resetea los mocks de las dependencias ANTES de cada prueba
    // `bcrypt` y `jwt` ahora son los objetos mockeados, así que puedes llamar a sus métodos
    bcrypt.compare.mockReset();
    jwt.sign.mockReset();
    Usuario.findOne.mockReset();
    // Si usas otros métodos de modelos en estas pruebas de unidad, resetéalos aquí también
  });

  // Tus pruebas de unidad existentes
  test('debería devolver 400 si faltan correo o password (unidad)', async () => {
    mockReq = { body: { correo: 'test@example.com' } };
    await sesionController.login(mockReq, mockRes);
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Todos los campos son obligatorios' });
  });

  test('debería devolver 401 si el usuario no es encontrado (unidad)', async () => {
    mockReq = { body: { correo: 'noexiste@example.com', password: 'password123' } };
    Usuario.findOne.mockResolvedValue(null);
    await sesionController.login(mockReq, mockRes);
    expect(Usuario.findOne).toHaveBeenCalledWith({ where: { correo: 'noexiste@example.com' } });
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Credenciales inválidas' });
  });

  test('debería devolver 401 si la contraseña es incorrecta (unidad)', async () => {
    mockReq = { body: { correo: 'usuario@example.com', password: 'wrongpassword' } };
    const mockUser = { id: 1, nombre: 'Test User', correo: 'usuario@example.com', password: 'hashedpassword', activo: true, rol: 'usuario' };
    Usuario.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);
    await sesionController.login(mockReq, mockRes);
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Credenciales inválidas' });
  });

  test('debería devolver 200 y un token si el inicio de sesión es exitoso (unidad)', async () => {
    mockReq = { body: { correo: 'usuario@example.com', password: 'correctpassword' } };
    const mockUser = { id: 1, nombre: 'Test User', correo: 'usuario@example.com', password: 'hashedpassword', activo: true, rol: 'usuario' };
    const mockToken = 'mocked_jwt_token';
    Usuario.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue(mockToken);
    await sesionController.login(mockReq, mockRes);
    expect(mockStatus).not.toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({
      mensaje: 'Inicio de sesión exitoso',
      token: mockToken,
      usuario: { id: mockUser.id, nombre: mockUser.nombre, correo: mockUser.correo, rol: mockUser.rol }
    });
  });

  test('debería devolver 403 si la cuenta del usuario está desactivada (unidad)', async () => {
    mockReq = { body: { correo: 'inactivo@example.com', password: 'password123' } };
    const mockUser = { id: 2, nombre: 'Inactive User', correo: 'inactivo@example.com', password: 'hashedpassword', activo: false, rol: 'usuario' };
    Usuario.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    await sesionController.login(mockReq, mockRes);
    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Esta cuenta ha sido desactivada' });
  });

  test('debería devolver 500 si ocurre un error inesperado (unidad)', async () => {
    mockReq = { body: { correo: 'error@example.com', password: 'password123' } };
    Usuario.findOne.mockRejectedValue(new Error('Database connection failed'));
    await sesionController.login(mockReq, mockRes);
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Error en el login' });
  });
});


// ==========================================
// PRUEBAS DE INTEGRACIÓN
// ==========================================
describe('POST /api/sesion/login (Pruebas de Integración)', () => {
  // Resetea los mocks antes de cada prueba de integración
  beforeEach(() => {
    bcrypt.compare.mockReset();
    jwt.sign.mockReset();
    Usuario.findOne.mockReset();
    // Asegúrate de resetear mocks de otros modelos si sus métodos son llamados en estas pruebas
  });

  // Añade un hook para cerrar el servidor de Express después de todas las pruebas
  // Esto ayuda a evitar el warning "Cannot log after tests are done"
  afterAll((done) => {
    // Si tu app.js no exporta el 'server' explícitamente, pero 'app' tiene una referencia
    // al servidor http creado, podemos intentar cerrarlo así.
    // Si tienes acceso al 'server' directamente en app.js, podrías exportarlo también
    // y usarlo aquí para un cierre más explícito (e.g., app.server.close(done);)
    // Por ahora, confiamos en que Supertest limpiará sus conexiones,
    // pero si el warning persiste, investigaremos cómo obtener la instancia de `server`
    // para cerrarla.
    
    // Para simplificar, si la app se exporta, supertest usualmente limpia.
    // Si sigues viendo el warning, el problema podría ser Sequelize o Socket.IO.
    // Una forma de detener la ejecución de cosas en app.js después de las pruebas
    // es forzar la salida. Esto no es ideal, pero para test, a veces es necesario
    // si las promesas de DB o Sockets no se resuelven a tiempo.
    // Por ahora, lo dejamos sin 'server.close()' aquí para ver si los mocks ya lo resuelven.

    // Si el warning de "Cannot log after tests are done" persiste, podemos forzar el cierre
    // o mockear sequelize.sync() y socketIo también.
    // console.log("Cerrando servidor después de todas las pruebas de integración...");
    done(); // Llama a done() para indicar que la limpieza ha terminado
  });


  test('debería devolver 200 y un token en un login exitoso', async () => {
    const mockUser = {
      id: 1,
      nombre: 'Test User',
      correo: 'integracion@example.com',
      password: 'hashedpassword',
      activo: true,
      rol: 'usuario'
    };
    const mockToken = 'mocked_jwt_token_integration';

    Usuario.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue(mockToken);

    const res = await request(app)
      .post('/api/sesion/login')
      .send({ correo: 'integracion@example.com', password: 'correctpassword' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token', mockToken);
    expect(res.body.usuario).toEqual({
      id: mockUser.id,
      nombre: mockUser.nombre,
      correo: mockUser.correo,
      rol: mockUser.rol
    });
    expect(Usuario.findOne).toHaveBeenCalledWith({ where: { correo: 'integracion@example.com' } });
    expect(bcrypt.compare).toHaveBeenCalledWith('correctpassword', 'hashedpassword');
    expect(jwt.sign).toHaveBeenCalledTimes(1);
  });

  test('debería devolver 401 si el usuario no es encontrado', async () => {
    Usuario.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/sesion/login')
      .send({ correo: 'noexiste@example.com', password: 'anypassword' });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ error: 'Credenciales inválidas' });
    expect(Usuario.findOne).toHaveBeenCalledWith({ where: { correo: 'noexiste@example.com' } });
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  test('debería devolver 400 si faltan correo o password', async () => {
    const res = await request(app)
      .post('/api/sesion/login')
      .send({ correo: 'solo_correo@example.com' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: 'Todos los campos son obligatorios' });
    expect(Usuario.findOne).not.toHaveBeenCalled();
  });

  test('debería devolver 401 si la contraseña es incorrecta', async () => {
    const mockUser = {
      id: 1,
      nombre: 'Test User',
      correo: 'incorrect_password@example.com',
      password: 'hashedpassword',
      activo: true,
      rol: 'usuario'
    };

    Usuario.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/sesion/login')
      .send({ correo: 'incorrect_password@example.com', password: 'badpassword' });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ error: 'Credenciales inválidas' });
    expect(Usuario.findOne).toHaveBeenCalledWith({ where: { correo: 'incorrect_password@example.com' } });
    expect(bcrypt.compare).toHaveBeenCalledWith('badpassword', 'hashedpassword');
  });

test('debería devolver 403 si la cuenta está desactivada', async () => {
  const mockUser = {
    id: 2,
    nombre: 'Inactive User',
    correo: 'inactive@example.com',
    password: 'hashedpassword',
    activo: false, // Usuario inactivo
    rol: 'usuario'
  };

  Usuario.findOne.mockResolvedValue(mockUser);

  const res = await request(app)
    .post('/api/sesion/login')
    .send({ correo: 'inactive@example.com', password: 'password123' });

  expect(res.statusCode).toEqual(403);
  expect(res.body).toEqual({ error: 'Esta cuenta ha sido desactivada' });
  expect(Usuario.findOne).toHaveBeenCalledWith({ where: { correo: 'inactive@example.com' } });
});

  test('debería devolver 500 si ocurre un error interno en el servidor', async () => {
    Usuario.findOne.mockRejectedValue(new Error('Database error during findOne'));

    const res = await request(app)
      .post('/api/sesion/login')
      .send({ correo: 'error@example.com', password: 'password123' });

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({ error: 'Error en el login' });
  });

});
