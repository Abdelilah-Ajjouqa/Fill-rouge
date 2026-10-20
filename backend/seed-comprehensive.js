const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27019/fitmanager';

const hashPassword = async (pass) => bcrypt.hash(pass, 10);

async function seedDatabase(targetUri) {
  console.log(`\n========================================`);
  console.log(`Connecting to: ${targetUri}`);
  console.log(`========================================`);

  const connection = await mongoose.createConnection(targetUri).asPromise();
  const db = connection.db;

  const gymsCol = db.collection('gyms');
  const usersCol = db.collection('users');
  const membersCol = db.collection('members');
  const activitiesCol = db.collection('activities');
  const subscriptionsCol = db.collection('subscriptions');
  const paymentsCol = db.collection('payments');
  const attendanceCol = db.collection('attendances');

  // 1. Gyms
  console.log('Seeding Gyms...');
  const gym1Halls = [
    { _id: new mongoose.Types.ObjectId(), name: 'Main Arena (Strength & Cardio)', type: 'Strength', capacity: 45 },
    { _id: new mongoose.Types.ObjectId(), name: 'Zen Studio (Yoga & Pilates)', type: 'Yoga', capacity: 20 },
    { _id: new mongoose.Types.ObjectId(), name: 'Combat Octagon (Boxing & MMA)', type: 'Combat', capacity: 25 },
  ];

  const gym1 = await gymsCol.findOneAndUpdate(
    { name: 'IronPulse Fitness Club' },
    {
      $set: {
        name: 'IronPulse Fitness Club',
        address: "142 Boulevard d'Anfa, Casablanca",
        phone: '0522102345',
        logo: '/uploads/logos/gym-banner-1.jpg',
        isActive: true,
        halls: gym1Halls,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true, returnDocument: 'after' }
  );

  const gym2Halls = [
    { _id: new mongoose.Types.ObjectId(), name: 'CrossFit Box Alpha', type: 'CrossFit', capacity: 35 },
    { _id: new mongoose.Types.ObjectId(), name: 'Spin & Endurance Hall', type: 'Spinning', capacity: 25 },
  ];

  const gym2 = await gymsCol.findOneAndUpdate(
    { name: 'Titan Athletics Club' },
    {
      $set: {
        name: 'Titan Athletics Club',
        address: '78 Avenue Mohammed VI, Marrakech',
        phone: '0524987654',
        logo: '/uploads/logos/gym-banner-2.jpg',
        isActive: true,
        halls: gym2Halls,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true, returnDocument: 'after' }
  );

  const gym1Id = gym1._id || (await gymsCol.findOne({ name: 'IronPulse Fitness Club' }))._id;
  const gym2Id = gym2._id || (await gymsCol.findOne({ name: 'Titan Athletics Club' }))._id;

  // 2. Users (SuperAdmin, Admins, Coaches)
  console.log('Seeding Staff Users...');
  const defaultPasswordHash = await hashPassword('password123');
  const superAdminPasswordHash = await hashPassword('superadmin123');
  const adminPasswordHash = await hashPassword('admin1234');
  const coachPasswordHash = await hashPassword('coach1234');

  const usersData = [
    {
      email: 'admin@fitmanager.com',
      passwordHash: superAdminPasswordHash,
      firstName: 'Alex',
      lastName: 'Morgan',
      role: 'SUPER_ADMIN',
      gymId: null,
      photo: '/uploads/avatars/avatar-1.jpg',
      phone: '0600000000',
    },
    {
      email: 'admin@ironpulse.com',
      passwordHash: adminPasswordHash,
      firstName: 'Tariq',
      lastName: 'Mansouri',
      role: 'ADMIN',
      gymId: gym1Id,
      photo: '/uploads/avatars/avatar-2.jpg',
      phone: '0661112233',
    },
    {
      email: 'admin@titan.com',
      passwordHash: adminPasswordHash,
      firstName: 'Samira',
      lastName: 'Alami',
      role: 'ADMIN',
      gymId: gym2Id,
      photo: '/uploads/avatars/avatar-3.jpg',
      phone: '0662223344',
    },
    {
      email: 'coach.mehdi@ironpulse.com',
      passwordHash: coachPasswordHash,
      firstName: 'Mehdi',
      lastName: 'Benali',
      role: 'COACH',
      gymId: gym1Id,
      photo: '/uploads/avatars/avatar-4.jpg',
      phone: '0663334455',
    },
    {
      email: 'coach.yasmine@ironpulse.com',
      passwordHash: coachPasswordHash,
      firstName: 'Yasmine',
      lastName: 'Idrissi',
      role: 'COACH',
      gymId: gym1Id,
      photo: '/uploads/avatars/avatar-5.jpg',
      phone: '0664445566',
    },
    {
      email: 'coach.khalid@titan.com',
      passwordHash: coachPasswordHash,
      firstName: 'Khalid',
      lastName: 'Berrada',
      role: 'COACH',
      gymId: gym2Id,
      photo: '/uploads/avatars/avatar-6.jpg',
      phone: '0665556677',
    },
  ];

  const userMap = {};
  for (const u of usersData) {
    const res = await usersCol.findOneAndUpdate(
      { email: u.email },
      {
        $set: {
          firstName: u.firstName,
          lastName: u.lastName,
          passwordHash: u.passwordHash,
          role: u.role,
          gymId: u.gymId,
          photo: u.photo,
          phone: u.phone,
          isActive: true,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: 'after' }
    );
    userMap[u.email] = res._id || (await usersCol.findOne({ email: u.email }))._id;
  }

  // 3. Activities
  console.log('Seeding Activities...');
  const gym1Record = await gymsCol.findOne({ _id: gym1Id });
  const arenaHallId = gym1Record.halls.find((h) => h.type === 'Strength')._id;
  const yogaHallId = gym1Record.halls.find((h) => h.type === 'Yoga')._id;
  const combatHallId = gym1Record.halls.find((h) => h.type === 'Combat')._id;

  const activitiesData = [
    {
      name: 'Power & HIIT Conditioning',
      gymId: gym1Id,
      hallId: arenaHallId,
      coach: userMap['coach.mehdi@ironpulse.com'],
      monthlyPrice: 400,
      maxCapacity: 25,
      schedule: [
        { day: 'Monday', startTime: '09:00', endTime: '10:30' },
        { day: 'Wednesday', startTime: '09:00', endTime: '10:30' },
        { day: 'Friday', startTime: '09:00', endTime: '10:30' },
      ],
    },
    {
      name: 'Vinyasa Flow Yoga',
      gymId: gym1Id,
      hallId: yogaHallId,
      coach: userMap['coach.yasmine@ironpulse.com'],
      monthlyPrice: 350,
      maxCapacity: 15,
      schedule: [
        { day: 'Tuesday', startTime: '17:00', endTime: '18:30' },
        { day: 'Thursday', startTime: '17:00', endTime: '18:30' },
        { day: 'Saturday', startTime: '10:00', endTime: '11:30' },
      ],
    },
    {
      name: 'Boxing & Kickboxing',
      gymId: gym1Id,
      hallId: combatHallId,
      coach: userMap['coach.mehdi@ironpulse.com'],
      monthlyPrice: 450,
      maxCapacity: 20,
      schedule: [
        { day: 'Monday', startTime: '18:00', endTime: '19:30' },
        { day: 'Wednesday', startTime: '18:00', endTime: '19:30' },
      ],
    },
  ];

  const activityMap = {};
  for (const act of activitiesData) {
    const res = await activitiesCol.findOneAndUpdate(
      { gymId: act.gymId, name: act.name },
      {
        $set: {
          hallId: act.hallId,
          coach: act.coach,
          monthlyPrice: act.monthlyPrice,
          maxCapacity: act.maxCapacity,
          schedule: act.schedule,
          isActive: true,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: 'after' }
    );
    activityMap[act.name] = res._id || (await activitiesCol.findOne({ gymId: act.gymId, name: act.name }))._id;
  }

  // 4. Members
  console.log('Seeding Members...');
  const memberPasswordHash = await hashPassword('member1234');
  const membersData = [
    {
      firstName: 'Karim',
      lastName: 'Alaoui',
      email: 'karim.alaoui@gmail.com',
      phone: '0665111222',
      photo: '/uploads/avatars/avatar-1.jpg',
      gymId: gym1Id,
    },
    {
      firstName: 'Sara',
      lastName: 'Bennani',
      email: 'sara.bennani@gmail.com',
      phone: '0665222333',
      photo: '/uploads/avatars/avatar-2.jpg',
      gymId: gym1Id,
    },
    {
      firstName: 'Omar',
      lastName: 'Chraibi',
      email: 'omar.chraibi@gmail.com',
      phone: '0665333444',
      photo: '/uploads/avatars/avatar-3.jpg',
      gymId: gym1Id,
    },
    {
      firstName: 'Fatima Zahra',
      lastName: 'Tazi',
      email: 'fatima.zahra@gmail.com',
      phone: '0665444555',
      photo: '/uploads/avatars/avatar-4.jpg',
      gymId: gym1Id,
    },
    {
      firstName: 'Amine',
      lastName: 'El Otmani',
      email: 'amine.elotmani@gmail.com',
      phone: '0665556666',
      photo: '/uploads/avatars/avatar-5.jpg',
      gymId: gym1Id,
    },
    {
      firstName: 'Layla',
      lastName: 'Kadiri',
      email: 'layla.kadiri@gmail.com',
      phone: '0665666777',
      photo: '/uploads/avatars/avatar-6.jpg',
      gymId: gym1Id,
    },
  ];

  const memberMap = {};
  for (const m of membersData) {
    const res = await membersCol.findOneAndUpdate(
      { email: m.email },
      {
        $set: {
          gymId: m.gymId,
          firstName: m.firstName,
          lastName: m.lastName,
          passwordHash: memberPasswordHash,
          phone: m.phone,
          photo: m.photo,
          dateOfBirth: new Date('1996-05-15'),
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: 'after' }
    );
    memberMap[m.email] = res._id || (await membersCol.findOne({ email: m.email }))._id;
  }

  // 5. Subscriptions & Payments
  console.log('Seeding Subscriptions & Payments...');
  const now = new Date();

  const makeDates = (startOffsetDays, durationMonths) => {
    const start = new Date(now);
    start.setDate(start.getDate() - startOffsetDays);
    const end = new Date(start);
    end.setMonth(end.getMonth() + durationMonths);
    return { startDate: start, endDate: end };
  };

  const subscriptionsPlan = [
    {
      memberEmail: 'karim.alaoui@gmail.com',
      activityName: 'Power & HIIT Conditioning',
      ...makeDates(10, 1),
      status: 'active',
      amount: 400,
    },
    {
      memberEmail: 'sara.bennani@gmail.com',
      activityName: 'Vinyasa Flow Yoga',
      ...makeDates(5, 1),
      status: 'active',
      amount: 350,
    },
    {
      memberEmail: 'omar.chraibi@gmail.com',
      activityName: 'Boxing & Kickboxing',
      ...makeDates(15, 1),
      status: 'active',
      amount: 450,
    },
    {
      memberEmail: 'fatima.zahra@gmail.com',
      activityName: 'Vinyasa Flow Yoga',
      ...makeDates(45, 1),
      status: 'expired',
      amount: 350,
    },
    {
      memberEmail: 'amine.elotmani@gmail.com',
      activityName: 'Power & HIIT Conditioning',
      ...makeDates(22, 1),
      status: 'active',
      amount: 400,
    },
    {
      memberEmail: 'layla.kadiri@gmail.com',
      activityName: 'Boxing & Kickboxing',
      ...makeDates(60, 1),
      status: 'cancelled',
      amount: 450,
    },
  ];

  for (const plan of subscriptionsPlan) {
    const memberId = memberMap[plan.memberEmail];
    const activityId = activityMap[plan.activityName];

    const sub = await subscriptionsCol.findOneAndUpdate(
      { gymId: gym1Id, member: memberId, activity: activityId },
      {
        $set: {
          startDate: plan.startDate,
          endDate: plan.endDate,
          status: plan.status,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: plan.startDate },
      },
      { upsert: true, returnDocument: 'after' }
    );
    const subId = sub._id || (await subscriptionsCol.findOne({ gymId: gym1Id, member: memberId, activity: activityId }))._id;

    await paymentsCol.findOneAndUpdate(
      { subscription: subId },
      {
        $set: {
          gymId: gym1Id,
          subscription: subId,
          amount: plan.amount,
          amountDue: plan.amount,
          paidAt: plan.startDate,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: plan.startDate },
      },
      { upsert: true }
    );
  }

  // 6. Attendance Logs (Over past 14 days)
  console.log('Seeding Attendance Records...');
  const attendanceSessions = [
    {
      activityName: 'Power & HIIT Conditioning',
      memberEmail: 'karim.alaoui@gmail.com',
      coachEmail: 'coach.mehdi@ironpulse.com',
      daysAgo: [1, 3, 5, 8, 10],
    },
    {
      activityName: 'Power & HIIT Conditioning',
      memberEmail: 'amine.elotmani@gmail.com',
      coachEmail: 'coach.mehdi@ironpulse.com',
      daysAgo: [1, 3, 5, 8],
    },
    {
      activityName: 'Vinyasa Flow Yoga',
      memberEmail: 'sara.bennani@gmail.com',
      coachEmail: 'coach.yasmine@ironpulse.com',
      daysAgo: [2, 4],
    },
    {
      activityName: 'Boxing & Kickboxing',
      memberEmail: 'omar.chraibi@gmail.com',
      coachEmail: 'coach.mehdi@ironpulse.com',
      daysAgo: [2, 4, 7, 9, 11],
    },
  ];

  for (const session of attendanceSessions) {
    const activityId = activityMap[session.activityName];
    const memberId = memberMap[session.memberEmail];
    const markedBy = userMap[session.coachEmail];

    for (const d of session.daysAgo) {
      const attDate = new Date(now);
      attDate.setDate(attDate.getDate() - d);
      attDate.setHours(9, 30, 0, 0);

      try {
        await attendanceCol.updateOne(
          { activityId, memberId, date: attDate },
          {
            $set: {
              gymId: gym1Id,
              activityId,
              memberId,
              date: attDate,
              status: d === 8 ? 'absent' : 'present',
              markedBy,
              updatedAt: new Date(),
            },
            $setOnInsert: { createdAt: attDate },
          },
          { upsert: true }
        );
      } catch (err) {
        // Ignore duplicate index errors if any
      }
    }
  }

  console.log(`Database seeded successfully on: ${targetUri}`);
  await connection.close();
}

async function main() {
  const uris = [
    process.env.MONGODB_URI || 'mongodb://localhost:27019/fitmanager',
    'mongodb://localhost:27019/FitManager',
  ];

  // Unique URIs
  const uniqueUris = [...new Set(uris)];

  for (const uri of uniqueUris) {
    try {
      await seedDatabase(uri);
    } catch (e) {
      console.warn(`Could not seed ${uri}:`, e.message);
    }
  }

  console.log('\n========================================');
  console.log(' ALL SEED DATA READY FOR FITMANAGER!');
  console.log('========================================');
  console.log('Credentials Summary:');
  console.log('Super Admin: admin@fitmanager.com       / superadmin123');
  console.log('Gym 1 Admin: admin@ironpulse.com        / admin1234');
  console.log('Gym 2 Admin: admin@titan.com            / admin1234');
  console.log('Coach Mehdi: coach.mehdi@ironpulse.com  / coach1234');
  console.log('Coach Yasm.: coach.yasmine@ironpulse.com/ coach1234');
  console.log('Member Karim:karim.alaoui@gmail.com     / member1234');
  console.log('Member Sara: sara.bennani@gmail.com     / member1234');
  console.log('========================================\n');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal seed error:', err);
    process.exit(1);
  });
