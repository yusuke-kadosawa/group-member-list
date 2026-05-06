
import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  migrate: {
    async adapter(env) {
      return new PrismaPg({ connectionString: env.DATABASE_URL })
    },
  },
})
