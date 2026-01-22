---
name: seed
description: Seed squads and users in Squadron using natural language commands. Use for "seed", "add squad", "create squad", "add users" requests. Resolves users from database or Ethos API and generates squad images with Gemini.
allowed-tools: Bash, Read, Write, AskUserQuestion
---

# Squadron Seed Skill

Seed squads and users using natural language commands. This skill parses commands, resolves users, generates squad images, and creates data in the database.

## Trigger Phrases

- "seed..."
- "add squad..."
- "create squad..."
- "add user..."
- "clear..."

## Command Reference

| Command | Description | Example |
|---------|-------------|---------|
| `add user @handle` | Add user by X handle | `/seed add user @vitalikbuterin` |
| `add users @h1 @h2` | Add multiple users | `/seed add users @user1 @user2` |
| `add user @handle as ROLE` | Add user with role | `/seed add user @vitalikbuterin as DEV` |
| `add N <role>` | Add N random users of role | `/seed add 5 degens` |
| `create squad` | Create squad with members | `/seed create squad "Name" with: @user1` |
| `clear all` | Delete all seeded data | `/seed clear all` |
| `clear category ROLE` | Delete users by role | `/seed clear category WHALE` |
| `clear users @h1 @h2` | Delete specific users | `/seed clear users @user1` |
| `clear squads` | Delete squads only | `/seed clear squads` |
| `list users` | List seeded users | `/seed list users` |
| `list squads` | List all squads | `/seed list squads` |
| `help` | Show help | `/seed help` |

**Roles:** DEGEN, WHALE, DEV, TRADER, KOL, RESEARCHER, ALPHA_CALLER, VIBE_CODER, COMMUNITY_BUILDER, SUGAR_DADDY

**Role Aliases:** `degens`, `whales`, `devs`, `traders`, `kols`, `researchers`, `alphas`, `vibes`, `community`, `sugar`

## Command Examples

```
/seed add a full squad of 5 users: Clemente, Easy, ICOBeast, Serpin, Zac called SlumDoggos
The description: they want to launch a token called $SLUM

/seed create squad "Alpha Hunters" with: @vitalikbuterin as DEV, @caborethos as KOL

/seed add user @somehandle

/seed add users @vitalikbuterin @caborethos @trustwallet

/seed add 5 degens

/seed add 10 whales

/seed add user @newmember to squad SlumDoggos as TRADER

/seed clear all

/seed clear category DEGEN

/seed help
```

## Workflow

### 1. Parse Command

Extract from the command:
- **Squad name**: Look for "called <name>" or "create squad <name>"
- **Description**: Look for "The description: ..." or "description: ..."
- **Members**: Names after "users:", "with:", or comma-separated list
- **Roles**: Optional "as ROLE" suffix per member (e.g., "@user as DEV")

**Valid roles:** DEGEN, SUGAR_DADDY, ALPHA_CALLER, TRADER, DEV, VIBE_CODER, KOL, WHALE, RESEARCHER, COMMUNITY_BUILDER

### 2. Resolve Users

For each member name, resolve to a database User record:

**Resolution order:**
1. **Database lookup** - Match by `ethosUsername`, `ethosDisplayName`, or `ethosXHandle`
2. **Ethos API lookup** - Query by X handle if name starts with `@` or has no spaces
3. **Interactive prompt** - Ask user for handle if not found

**Using the resolver:**
```bash
cd /Users/chosta/Developer/projects/squadron && npx tsx scripts/seed/user-resolver.ts
```

### 3. Handle Unresolved Users

If a user cannot be found, prompt interactively:

```
Could not find "Clemente" in database or by X handle.

Please provide one of:
- X handle (e.g., @ClementeEth)
- Ethereum wallet address (0x...)
- Ethos profile ID (numeric)
- Type "skip" to continue without this user
```

Use the `/ethos` skill to look up users by handle:
```
/ethos lookup @ClementeEth
```

### 4. Generate Squad Image (Optional)

If `GEMINI_API_KEY` is configured, generate an avatar:

```bash
# Check if Gemini is configured
grep GEMINI_API_KEY /Users/chosta/Developer/projects/squadron/.env
```

The image is stored as a base64 data URL in `Squad.avatarUrl`.

**Prompt template used:**
```
Create a stylized crypto/web3 squad logo for a team called "{squadName}".
The team's mission: {description}.
Style: Modern, cyberpunk aesthetic with neon accents, professional and clean design.
Make it suitable as a profile avatar/icon.
No text, letters, or words in the image.
Abstract geometric shapes, mascot character, or symbolic imagery preferred.
```

### 5. Create Squad

**Option A: Use the seeder orchestrator (if available):**

```typescript
import {
  createSquadWithMembers,
  assignDefaultRoles,
  type SquadMemberInput,
} from './scripts/seed/scenario-seeder';

const members: SquadMemberInput[] = assignDefaultRoles([
  { user: resolvedUser1, role: 'ALPHA_CALLER' },
  { user: resolvedUser2 },  // Gets default role
]);

const result = await createSquadWithMembers({
  name: 'SlumDoggos',
  description: 'They want to launch a token called $SLUM',
  members,
  generateImage: true,
});
```

**Option B: Direct Prisma creation (more reliable):**

```typescript
import { prisma } from './lib/prisma';

const squad = await prisma.squad.create({
  data: {
    name: 'SlumDoggos',
    description: 'They want to launch a token called $SLUM',
    maxSize: 5,  // NOT maxMembers!
    isActive: true,  // NOT status!
    creator: { connect: { id: captainUserId } },
    captain: { connect: { id: captainUserId } },
    members: {
      create: members.map(m => ({
        user: { connect: { id: m.userId } },
        role: m.role
      }))
    }
  }
});
```

**Rules:**
- First resolved user becomes **creator** and **captain** (set on Squad, NOT on member)
- Captain is a Squad-level field, not a SquadMember field
- If no roles specified, assign from default rotation
- Squad `isActive: true` when 2+ members

### 6. Report Results

After creation, report:
- Squad name and ID
- Member count and roles
- Whether image was generated
- Any users that were skipped

```
Created squad "SlumDoggos" (id: clxyz...)

Members (5):
1. Clemente - ALPHA_CALLER (captain)
2. Easy - TRADER
3. ICOBeast - DEV
4. Serpin - KOL
5. Zac - DEGEN

Squad image generated via Gemini.
View in Prisma Studio: yarn db:studio
```

## Batch Add Users by Handle

For adding multiple users at once:

```typescript
import { addUsersByHandles } from './scripts/seed/user-resolver';

const result = await addUsersByHandles(
  ['@vitalikbuterin', '@caborethos', '@trustwallet'],
  'DEV' // optional default role
);

console.log(`Added: ${result.added.length}`);
console.log(`Already existed: ${result.existing.length}`);
console.log(`Failed: ${result.failed.map(f => f.handle).join(', ')}`);
```

**Using the resolver:**
```bash
cd /Users/chosta/Developer/projects/squadron && npx tsx -e "
import { addUsersByHandles } from './scripts/seed/user-resolver';
addUsersByHandles(['@vitalikbuterin', '@caborethos']).then(r => {
  console.log('Added:', r.added.map(a => a.handle));
  console.log('Existing:', r.existing.map(e => e.handle));
  console.log('Failed:', r.failed.map(f => f.handle + ': ' + f.reason));
});
"
```

## Add Users by Category

For adding random users matching a role profile:

```typescript
import { seedUsersForCategory, parseRole } from './scripts/seed/category-seeder';

const role = parseRole('degens'); // Handles aliases like 'degens' -> 'DEGEN'
if (role) {
  const result = await seedUsersForCategory(role, 5);
  console.log(`Added ${result.added.length} ${role} users`);
  console.log(`Skipped ${result.skipped} (already in DB)`);
}
```

**Using the seeder:**
```bash
cd /Users/chosta/Developer/projects/squadron && npx tsx -e "
import { seedUsersForCategory } from './scripts/seed/category-seeder';
seedUsersForCategory('DEGEN', 5).then(r => {
  console.log('Added:', r.added.map(u => u.ethosDisplayName || u.ethosUsername));
  console.log('Skipped:', r.skipped);
  console.log('Errors:', r.errors);
});
"
```

**Important:** Running the same category seed multiple times will NOT create duplicates - it automatically excludes users already in the database.

## Clear Commands

### Clear all seeded data
```bash
cd /Users/chosta/Developer/projects/squadron && npx tsx -e "
import { deleteAllSeededData } from './scripts/seed/scenario-seeder';
deleteAllSeededData().then(r => console.log(\`Deleted \${r.squadsDeleted} squads, \${r.usersDeleted} users, \${r.membershipsDeleted} memberships\`));
"
```

### Clear users by category
```bash
cd /Users/chosta/Developer/projects/squadron && npx tsx -e "
import { deleteSeededUsersByCategory } from './scripts/seed/scenario-seeder';
deleteSeededUsersByCategory('DEGEN').then(r => console.log(\`Deleted \${r.usersDeleted} DEGEN users\`));
"
```

### Clear specific users by handle
```bash
cd /Users/chosta/Developer/projects/squadron && npx tsx -e "
import { deleteSeededUsersByHandles } from './scripts/seed/scenario-seeder';
deleteSeededUsersByHandles(['@user1', '@user2']).then(r => console.log(\`Deleted \${r.usersDeleted} users\`));
"
```

### Clear squads only (keep users)
```bash
cd /Users/chosta/Developer/projects/squadron && npx tsx -e "
import { deleteAllSeededSquads } from './scripts/seed/scenario-seeder';
deleteAllSeededSquads().then(r => console.log(\`Deleted \${r.squadsDeleted} squads\`));
"
```

## Help Command

When user types `/seed help`, display the command reference table from the top of this file.

## Helper Commands

### List all squads
```bash
cd /Users/chosta/Developer/projects/squadron && npx tsx -e "
import { listAllSquads } from './scripts/seed/scenario-seeder';
listAllSquads().then(squads => {
  squads.forEach(s => console.log(\`\${s.name} (${s._count.members} members)\`));
});
"
```

### List seeded users
```bash
cd /Users/chosta/Developer/projects/squadron && npx tsx -e "
import { listSeededUsers } from './scripts/seed/scenario-seeder';
listSeededUsers().then(users => {
  users.forEach(u => console.log(\`\${u.ethosDisplayName || u.ethosUsername} (@\${u.ethosXHandle})\`));
});
"
```

### Delete all seeded data
```bash
cd /Users/chosta/Developer/projects/squadron && npx tsx -e "
import { deleteAllSeededData } from './scripts/seed/scenario-seeder';
deleteAllSeededData().then(r => console.log(\`Deleted \${r.squadsDeleted} squads, \${r.usersDeleted} users\`));
"
```

### Open Prisma Studio
```bash
cd /Users/chosta/Developer/projects/squadron && yarn db:studio
```

## Error Handling

| Error | Action |
|-------|--------|
| User not found | Prompt for X handle or skip |
| Gemini API error | Continue without image, log warning |
| Squad name exists | Ask user to choose different name |
| No members resolved | Abort and report which users failed |
| Unique constraint on ethosUserId | User already exists - find them in DB instead |

## Squad Schema Reference (CRITICAL)

**ALWAYS check this before creating squads to avoid Prisma errors.**

```prisma
model Squad {
  id          String   @id @default(cuid())
  name        String
  description String?  @db.Text
  avatarUrl   String?

  minSize     Int      @default(2)
  maxSize     Int      @default(5)  // NOT maxMembers!
  isFixedSize Boolean  @default(false)
  isActive    Boolean  @default(false)  // NOT status!

  // REQUIRED relations (both creator AND captain)
  creatorId   String
  creator     User     @relation("SquadCreator", ...)
  captainId   String
  captain     User     @relation("SquadCaptain", ...)

  members     SquadMember[]
}

model SquadMember {
  squadId   String
  userId    String
  role      SquadRole
  // NOTE: No isCaptain field! Captain is set at Squad level via captainId
}
```

**Common mistakes to avoid:**
- ❌ `maxMembers` → ✅ `maxSize`
- ❌ `status: 'ACTIVE'` → ✅ `isActive: true`
- ❌ `seeded: true` → ✅ Field doesn't exist on Squad
- ❌ `creatorId: 'xxx'` → ✅ `creator: { connect: { id: 'xxx' } }`
- ❌ `isCaptain: true` on member → ✅ `captain: { connect: { id: 'xxx' } }` on Squad

## Correct Squad Creation Example

```typescript
const squad = await prisma.squad.create({
  data: {
    name: 'Squad Name',
    description: 'Description here',
    maxSize: 5,
    isActive: true,
    creator: { connect: { id: creatorUserId } },
    captain: { connect: { id: captainUserId } },
    members: {
      create: [
        { user: { connect: { id: member1Id } }, role: 'ALPHA_CALLER' },
        { user: { connect: { id: member2Id } }, role: 'KOL' },
      ]
    }
  },
  include: {
    captain: true,
    members: { include: { user: true } }
  }
});
```

## Continuous Improvement Protocol

**After every seed operation that encounters errors:**

1. **Document the error** - Note the exact Prisma validation message
2. **Identify the root cause** - Schema mismatch, wrong field name, missing relation
3. **Update this skill file** - Add the fix to the "Common mistakes" section
4. **Suggest schema sync** - If helpers are outdated, suggest updating `scenario-seeder.ts`

**Auto-suggest improvements when:**
- A field name doesn't exist (schema changed)
- A relation requires `connect` syntax
- A helper function throws unexpected errors
- The seeder scripts are missing functionality

**Template for suggesting improvements:**
```
🔧 **Improvement Suggestion**
- Problem: [what went wrong]
- Root cause: [why it happened]
- Fix applied: [how it was resolved]
- Recommendation: [update skill/script/schema]
```

## Environment Variables

Required in `squadron/.env`:
```bash
GEMINI_API_KEY=your_gemini_api_key  # Optional, for image generation
```

## References

- User resolver: `scripts/seed/user-resolver.ts`
- Scenario seeder: `scripts/seed/scenario-seeder.ts`
- Gemini client: `lib/services/gemini-client.ts`
- Ethos client: `lib/services/ethos-client.ts`
- Squad service: `lib/services/squad-service.ts`
- **Prisma schema:** `prisma/schema.prisma` (always check this for field names!)

## Improvement Log

Track fixes and learnings to continuously improve this skill.

| Date | Issue | Fix | Suggestion |
|------|-------|-----|------------|
| 2026-01-22 | Used `maxMembers` instead of `maxSize` | Updated to use correct schema field | Added schema reference section |
| 2026-01-22 | Used `status: 'ACTIVE'` instead of `isActive: true` | Fixed field name | Added to common mistakes |
| 2026-01-22 | Used `creatorId` directly instead of `connect` | Use Prisma relation syntax | Added correct creation example |
| 2026-01-22 | Set `isCaptain` on SquadMember | Captain is Squad-level via `captainId` | Documented in schema reference |
| 2026-01-22 | Used non-existent `seeded` field on Squad | Removed - field doesn't exist | Added to common mistakes |

**When adding to this log:** Include date, what went wrong, how it was fixed, and any skill updates made.
