# Seed Command Examples

## Quick Reference

| Command | Description |
|---------|-------------|
| `/seed add user @handle` | Add single user by X handle |
| `/seed add users @h1 @h2` | Add multiple users |
| `/seed add N <role>` | Add N random users of role |
| `/seed create squad "Name" with:` | Create squad with members |
| `/seed clear all` | Delete all seeded data |
| `/seed clear category ROLE` | Delete users by role |
| `/seed clear users @h1 @h2` | Delete specific users |
| `/seed clear squads` | Delete squads only |
| `/seed list users` | List seeded users |
| `/seed list squads` | List all squads |
| `/seed help` | Show help |

## Add Users by Handle

### Add single user
```
/seed add user @vitalikbuterin
```

### Add single user with role
```
/seed add user @vitalikbuterin as DEV
```

### Add multiple users
```
/seed add users @vitalikbuterin @caborethos @trustwallet
```

### Add multiple users with roles
```
/seed add users @vitalikbuterin as DEV, @caborethos as KOL
```

## Add Users by Category

### Add degens
```
/seed add 5 degens
```

### Add whales
```
/seed add 10 whales
```

### Add developers
```
/seed add 3 devs
```

### Add traders
```
/seed add 5 traders
```

### Add KOLs
```
/seed add 3 kols
```

### Add researchers
```
/seed add 5 researchers
```

### Add alpha callers
```
/seed add 3 alphas
```

### Add vibe coders
```
/seed add 2 vibes
```

### Add community builders
```
/seed add 4 community
```

### Add sugar daddies
```
/seed add 2 sugar
```

## Create Squad with Members

### Basic squad creation
```
/seed create squad "Alpha Hunters" with: @vitalikbuterin, @caborethos, @trustwallet
```

### Squad with roles
```
/seed create squad "Web3 Builders" with: @etherscan as DEV, @opensea as TRADER, @uniswap as WHALE
```

### Natural language format
```
/seed add a full squad of 5 users: Clemente, Easy, ICOBeast, Serpin, Zac called SlumDoggos
The description: they want to launch a token called $SLUM
```

### With description
```
/seed create squad "DeFi Degens" with: @aaborethos, @dragonfly_cap
The description: Researching and investing in early-stage DeFi protocols
```

## Add Users to Existing Squad

### Add single user
```
/seed add user @newmember to squad SlumDoggos as TRADER
```

### Add multiple users
```
/seed add users @user1, @user2, @user3 to squad "Alpha Hunters"
```

## User Resolution

### By X handle
```
/seed add user @vitalikbuterin
```

### By wallet address
```
/seed add user 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

### By Ethos profile ID
```
/seed add user profileId:12345
```

## Clear Commands

### Clear all seeded data
```
/seed clear all
```

### Clear users by category
```
/seed clear category DEGEN
/seed clear category WHALE
/seed clear category DEV
```

### Clear specific users
```
/seed clear users @user1 @user2
```

### Clear squads only (keep users)
```
/seed clear squads
```

## List Commands

### List all squads
```
/seed list squads
```

### List seeded users
```
/seed list users
```

## Help

### Show available commands
```
/seed help
```

## Role Reference

| Role | Aliases | Description |
|------|---------|-------------|
| DEGEN | degen, degens | Risk-taker and high-stakes player |
| WHALE | whale, whales | Big staker with significant holdings |
| DEV | dev, devs, developer | Technical builder and developer |
| TRADER | trader, traders | Executes trades and manages positions |
| KOL | kol, kols | Key Opinion Leader with influence |
| RESEARCHER | researcher, researchers | Deep analysis and due diligence provider |
| ALPHA_CALLER | alpha, alphas | Finds and shares alpha opportunities |
| VIBE_CODER | vibe, vibes | Creative developer with style |
| COMMUNITY_BUILDER | community | Connects people and builds networks |
| SUGAR_DADDY | sugar, sugardaddy | Financial backer and supporter |
