module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: [
		"<rootDir>/test",
		"<rootDir>/src/backend"
	],
	moduleDirectories: ['node_modules', 'src'],
	moduleNameMapper: {
		"src/(.*)" : "<rootDir>/src/$1"
	}
};