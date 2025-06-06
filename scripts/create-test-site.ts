import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestSite() {
  try {
    // First, create a test user
    const user = await prisma.user.upsert({
      where: { email: 'test@fastinsight.dev' },
      update: {},
      create: {
        email: 'test@fastinsight.dev',
        name: 'Test User',
        role: 'ADMIN'
      }
    })

    console.log('✅ Test user created:', user.email)

    // Create a test site
    const site = await prisma.site.upsert({
      where: { websiteId: 'fi_684301d51cba1db8fd23052a' },
      update: {},
      create: {
        websiteId: 'fi_684301d51cba1db8fd23052a',
        name: 'Test Site',
        domain: 'localhost:3001',
        userId: user.id,
        timezone: 'UTC',
        public: false
      }
    })

    console.log('✅ Test site created:', site.name, 'with ID:', site.websiteId)
    console.log('🔗 Use this in your tracking script: data-website-id="' + site.websiteId + '"')
    
  } catch (error) {
    console.error('❌ Error creating test site:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestSite() 