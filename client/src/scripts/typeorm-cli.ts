import { initializeDataSource, AppDataSource } from '../data-source.js';

async function run() {
	const cmd = process.argv[2];
	await initializeDataSource();
	switch (cmd) {
		case 'migrate': {
			await AppDataSource.runMigrations();
			console.log('Migrations run');
			break;
		}
		case 'revert': {
			await AppDataSource.undoLastMigration();
			console.log('Migration reverted');
			break;
		}
		default:
			console.log('Usage: npm run typeorm -- migrate | revert');
	}
	await AppDataSource.destroy();
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});


