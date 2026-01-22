import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SQUAD_ID = 'cmkp9dit0000061ulqraulu5e';
const USERS = {
  chosta: 'cmknzlzvh0000h7mrvn6jr403',
  eel: 'cmkp97vee000111xjaoso8m75',
  fantardio: 'cmkp97v91000011xjnnpdau9w',
};

// Conversation about football (soccer) and American football
const messages = [
  { sender: 'chosta', content: 'yo did you guys catch the game last night?' },
  { sender: 'eel', content: 'which one? the cowboys game was insane' },
  { sender: 'chosta', content: 'nah I meant the real football, Real Madrid vs Barcelona' },
  { sender: 'eel', content: 'lmao here we go again with the "real football" thing 😂' },
  { sender: 'fantardio', content: 'oh boy this debate again' },
  { sender: 'chosta', content: 'look you kick a ball with your foot, its football. simple.' },
  { sender: 'eel', content: 'okay but have you seen Mahomes throw? the guy is literally magic' },
  { sender: 'chosta', content: 'Mahomes is good but hes no Messi. Messi changed the entire sport' },
  { sender: 'eel', content: 'different sports bro, cant compare. but if were talking GOATs then its Brady hands down' },
  { sender: 'fantardio', content: 'Brady retired like 3 times already lol' },
  { sender: 'eel', content: 'and came back every time because hes built different 🐐' },
  { sender: 'chosta', content: 'Ronaldo is 39 and still playing at the highest level, thats built different' },
  { sender: 'eel', content: 'saudi league is the highest level? 🤔' },
  { sender: 'chosta', content: 'okay fair point but still. 900+ career goals man' },
  { sender: 'eel', content: 'aight thats actually impressive ngl' },
  { sender: 'fantardio', content: 'can we all agree that both sports are entertaining tho?' },
  { sender: 'chosta', content: 'american football has too many breaks. 3 hours for 11 minutes of play' },
  { sender: 'eel', content: 'those breaks are strategic timeouts! and the ads pay for everything' },
  { sender: 'chosta', content: 'in football you get 45 mins of pure action, then halftime, then 45 more' },
  { sender: 'eel', content: '45 mins of watching guys fake injuries you mean' },
  { sender: 'fantardio', content: 'LMAO eel woke up and chose violence' },
  { sender: 'chosta', content: 'okay the diving is bad I admit. but VAR is fixing that slowly' },
  { sender: 'eel', content: 'we got instant replay in the NFL. been doing it for decades' },
  { sender: 'chosta', content: 'who are you backing for the super bowl this year?' },
  { sender: 'eel', content: 'Chiefs easy. Mahomes + Kelce is unstoppable' },
  { sender: 'fantardio', content: 'I dont follow NFL but even I know those names' },
  { sender: 'eel', content: 'see? theyre iconic. whos the Kelce of soccer?' },
  { sender: 'chosta', content: 'probably Busquets in his prime, orchestrating everything from midfield' },
  { sender: 'eel', content: 'never heard of him' },
  { sender: 'chosta', content: 'exactly my point, you dont watch the sport 😤' },
  { sender: 'eel', content: 'because I watch REAL entertainment - grown men tackling each other at full speed' },
  { sender: 'chosta', content: 'they wear full body armor tho... rugby players do that with no pads' },
  { sender: 'eel', content: 'the pads are because the hits are HARDER. physics bro' },
  { sender: 'fantardio', content: 'okay but can we talk about how hype world cup gets? nothing compares globally' },
  { sender: 'chosta', content: 'THANK YOU. 5 billion viewers. the super bowl wishes' },
  { sender: 'eel', content: 'quality over quantity. super bowl halftime shows are legendary' },
  { sender: 'chosta', content: 'bro a halftime show doesnt count as part of the sport 💀' },
  { sender: 'eel', content: 'its part of the EXPERIENCE. americans know how to put on a show' },
  { sender: 'fantardio', content: 'world cup opening ceremonies are pretty lit too tbf' },
  { sender: 'chosta', content: 'remember 2014 brazil? that was peak football atmosphere' },
  { sender: 'eel', content: 'remember 7-1? 🇩🇪' },
  { sender: 'chosta', content: '...why are you like this' },
  { sender: 'fantardio', content: 'LOL that was cold eel' },
  { sender: 'eel', content: 'sorry not sorry 😎 but seriously who you got winning champions league?' },
  { sender: 'chosta', content: 'Real Madrid. always bet on them in europe. 15 titles' },
  { sender: 'eel', content: 'the patriots of soccer basically' },
  { sender: 'chosta', content: 'actually thats a decent comparison. consistent excellence over decades' },
  { sender: 'eel', content: 'see we CAN find common ground' },
  { sender: 'fantardio', content: 'beautiful moment guys 🥲' },
  { sender: 'chosta', content: 'next time you should actually watch a match with me eel' },
  { sender: 'eel', content: 'only if you watch a playoff game with me. deal?' },
  { sender: 'chosta', content: 'deal 🤝' },
];

async function seedChat() {
  console.log('Clearing existing chat messages for this squad...');
  await prisma.chatMessage.deleteMany({
    where: { squadId: SQUAD_ID },
  });

  console.log('Seeding chat messages...');

  // Create messages with timestamps spread over a few hours
  const baseTime = new Date();
  baseTime.setHours(baseTime.getHours() - 2); // Start 2 hours ago

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const createdAt = new Date(baseTime.getTime() + i * 60000 * 2); // 2 min apart

    await prisma.chatMessage.create({
      data: {
        content: msg.content,
        squadId: SQUAD_ID,
        senderId: USERS[msg.sender as keyof typeof USERS],
        createdAt,
        updatedAt: createdAt,
      },
    });
  }

  console.log(`Created ${messages.length} chat messages!`);
}

seedChat()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
