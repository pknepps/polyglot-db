import { sanitize, connectMongo, connectRedis, start } from '../src/index';

describe('connectMongo function', () => {
    test('should return a Db object', async () => {
        const address = 'localhost:27017';
        const db = await connectMongo(address);
        expect(db).toBeDefined();
        expect(db.databaseName).toBe('polyglots-db');
    });
    test('should throw an error if connection fails', async () => {
        const address = 'invalid-address';
        await expect(connectMongo(address)).toThrow();
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
});

