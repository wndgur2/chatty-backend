const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({});

async function main() {
  const rooms = await prisma.chatroom.findMany();
  console.log('--- CHATROOMS ---');
  console.log(rooms.map(r => ({ id: Number(r.id), name: r.name })));
  
  const m = await prisma.message.findMany();
  console.log('--- MESSAGES ---');
  console.log(m.map(x => ({ id: Number(x.id), content: x.content, chatroomId: Number(x.chatroomId) })));
}

main()
  .finally(() => prisma.$disconnect());
