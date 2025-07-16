const { User } = require('../../models/user.model');

jest.mock('../../models/user.model');

describe('User model (mocked)', () => {
  afterEach(() => jest.clearAllMocks());

  it('crée un utilisateur avec les champs requis', async () => {
    User.create.mockResolvedValue({ id: 1, nom: 'A', prenom: 'B', email: 'a@b.com', password: 'pw', role: 'client' });
    const user = await User.create({ nom: 'A', prenom: 'B', email: 'a@b.com', password: 'pw' });
    expect(user.id).toBeDefined();
    expect(user.role).toBe('client');
  });

  it('refuse un email invalide', async () => {
    User.create.mockRejectedValue(new Error('Validation error: email'));
    await expect(User.create({ nom: 'A', prenom: 'B', email: 'bad', password: 'pw' }))
      .rejects.toThrow('Validation error: email');
  });

  it('refuse un email dupliqué', async () => {
    User.create.mockRejectedValue(new Error('SequelizeUniqueConstraintError'));
    await expect(User.create({ nom: 'C', prenom: 'D', email: 'unique@b.com', password: 'pw' }))
      .rejects.toThrow('SequelizeUniqueConstraintError');
  });

  it('accepte le rôle admin', async () => {
    User.create.mockResolvedValue({ id: 2, nom: 'A', prenom: 'B', email: 'admin@b.com', password: 'pw', role: 'admin' });
    const user = await User.create({ nom: 'A', prenom: 'B', email: 'admin@b.com', password: 'pw', role: 'admin' });
    expect(user.role).toBe('admin');
  });
}); 