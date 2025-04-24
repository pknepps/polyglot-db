import { getUser, getProduct } from '../src/get';
import { getMongoAddress, mongoConnections } from '../src/shard';
import { Db } from 'mongodb';

jest.mock('../src/shard', () => ({
    getMongoAddress: jest.fn(),
    mongoConnections: new Map(),
}));

/**
 * Test for getUser function.
 */
describe('getUser function', () => {
    let mockMongoDb: Db;

    beforeEach(() => {
        mockMongoDb = {
            collection: jest.fn().mockReturnValue({
                findOne: jest.fn(),
            }),
        } as unknown as Db;

        (getMongoAddress as jest.Mock).mockResolvedValue('mockAddress');
        (mongoConnections as Map<string, Db>).set('mockAddress', mockMongoDb);
    });

    afterEach(() => {
        jest.clearAllMocks();
        (mongoConnections as Map<string, Db>).clear();
    });

    test('should return user data when the user exists', async () => {
        const mockUser = { username: 'testUser', firstName: 'Test', lastName: 'User', middleName: "",  addresses: [], payments: [], transactions: [], ratings: [], reviews: []};
        (mockMongoDb.collection('users').findOne as jest.Mock).mockResolvedValue(mockUser);

        const result = await getUser('testUser');

        expect(getMongoAddress).toHaveBeenCalledWith('utestUser');
        expect(mockMongoDb.collection('users').findOne).toHaveBeenCalledWith({ username: 'testUser' });
        expect(result).toEqual(mockUser);
    });

    test('should reject when the user does not exist', async () => {
        (mockMongoDb.collection('users').findOne as jest.Mock).mockResolvedValue(null);

        await expect(getUser('nonExistentUser')).rejects.toBeUndefined();

        expect(getMongoAddress).toHaveBeenCalledWith('unonExistentUser');
        expect(mockMongoDb.collection('users').findOne).toHaveBeenCalledWith({ username: 'nonExistentUser' });
    });

    test('should reject when an error occurs', async () => {
        (getMongoAddress as jest.Mock).mockRejectedValue(new Error('Connection error'));

        await expect(getUser('errorUser')).rejects.toBeUndefined();

        expect(getMongoAddress).toHaveBeenCalledWith('uerrorUser');
        expect(mockMongoDb.collection('users').findOne).not.toHaveBeenCalled();
    });
});
