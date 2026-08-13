import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

/**
 * Seed data for local development.
 *
 * Replace the zitadelOrgId placeholders below with the real org IDs from
 * your Zitadel Console (Console -> switch org -> Organization -> copy the
 * ID from the URL or the org details page) so that logging in as a user
 * from either org resolves to the matching seeded row instead of falling
 * through to JIT-creation with a null bolnaApiKey.
 */
const organizations = [
    {
        name: 'AI Calling Platform',
        zitadelOrgId: 'REPLACE_WITH_AI_CALLING_PLATFORM_ORG_ID',
        bolnaApiKey: null,
    },
    {
        name: 'Org Alpha',
        zitadelOrgId: 'REPLACE_WITH_ORG_ALPHA_ORG_ID',
        bolnaApiKey: null,
    },
];

const main = async () => {
    for (const org of organizations) {
        const result = await prisma.organization.upsert({
            where: { zitadelOrgId: org.zitadelOrgId },
            update: {
                name: org.name,
                bolnaApiKey: org.bolnaApiKey,
            },
            create: org,
        });

        console.log(`Seeded organization: ${result.name} (${result.id})`);
    }
};

main()
    .catch((error) => {
        console.error('Seed failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });