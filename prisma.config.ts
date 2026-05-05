
import 'dotenv/config';
// @ts-ignore
import { defineConfig } from 'prisma';

export default defineConfig({
	datasource: {
		provider: 'postgresql',
		url: process.env.DATABASE_URL,
	},
});
