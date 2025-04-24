import { sanitize, connectMongo } from '../src/index';

/**
 * Test the connectMongo function.
 */
describe('connectMongo function', () => {
    test('should return a Db object', async () => {
        const address = 'localhost:27017';
        const db = await connectMongo(address);
        expect(db).toBeDefined();
        expect(db.databaseName).toBe('polyglots-db');
    });

    test('should throw an error if connection fails', async () => {
        const address = 'invalid-address';
        expect(connectMongo(address)).rejects.toThrow();
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
