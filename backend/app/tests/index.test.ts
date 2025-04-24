import { sanitize, connectMongo } from '../src/index';
import { MongoClient } from 'mongodb';

jest.mock('mongodb');

/**
 * Test the connectMongo function.
 */
describe('connectMongo function', () => {
    test('should return the MongoDB database object', async () => {
        const mockDb = { databaseName: 'polyglots-db' }; 
        const mockClient = {
            connect: jest.fn().mockResolvedValue(undefined), 
            db: jest.fn().mockReturnValue(mockDb), 
        };

        (MongoClient as unknown as jest.Mock).mockImplementation(() => mockClient);

        const address = 'localhost:27017';
        const db = await connectMongo(address);

        expect(mockClient.connect).toHaveBeenCalled();
        expect(mockClient.db).toHaveBeenCalledWith('polyglots-db');
        expect(db).toBe(mockDb);
    });

    test('should throw an error if connection fails', async () => {
        const mockClient = {
            connect: jest.fn().mockRejectedValue(new Error('Connection failed')), // Simulate connection failure
        };

        (MongoClient as unknown as jest.Mock).mockImplementation(() => mockClient);

        const address = 'invalid-address';

        await expect(connectMongo(address)).rejects.toThrow('Connection failed');
        expect(mockClient.connect).toHaveBeenCalled();
    });
});

/**
 * Test the sanitize function.
 */
describe('sanitize function', () => {
    test('should replace dangerous characters with "^"', () => {
        const input = `Hello "world" 'test' \`code\``;
        const expectedOutput = `Hello ^world^ ^test^ ^code^`;
        expect(sanitize(input)).toBe(expectedOutput);
    });

    test('should return an empty string for non-string input', () => {
        const input = null as unknown as string;
        const expectedOutput = '';
        expect(sanitize(input)).toBe(expectedOutput);
    });

    test('should return the same string if no dangerous characters are present', () => {
        const input = 'Hello world';
        const expectedOutput = 'Hello world';
        expect(sanitize(input)).toBe(expectedOutput);
    });

    test('should handle an empty string input', () => {
        const input = '';
        const expectedOutput = '';
        expect(sanitize(input)).toBe(expectedOutput);
    });
});
