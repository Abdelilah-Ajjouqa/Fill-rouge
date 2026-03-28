const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/FitManager';

const createPasswordHash = async (plain) => bcrypt.hash(plain, 10);

const findOrCreateGym = async (gyms) => {
    const gymName = 'FitClub Casablanca';
    const gymPhone = '0600000001';

    let gym = await gyms.findOne({ name: gymName });
    if (!gym) {
        gym = await gyms.findOne({ phone: gymPhone });
    }
    if (!gym) {
        gym = await gyms.findOne({});
    }

    if (gym) {
        const hasHalls = Array.isArray(gym.halls) && gym.halls.length > 0;
        if (!hasHalls) {
            const defaultHalls = [
                {
                    _id: new mongoose.Types.ObjectId(),
                    name: 'A-1',
                    type: 'Yoga',
                    capacity: 20,
                },
                {
                    _id: new mongoose.Types.ObjectId(),
                    name: 'B-2',
                    type: 'Strength',
                    capacity: 25,
                },
            ];
            await gyms.updateOne(
                { _id: gym._id },
                { $set: { halls: defaultHalls, updatedAt: new Date() } },
            );
            return { ...gym, halls: defaultHalls };
        }
        return gym;
    }

    const newGym = {
        _id: new mongoose.Types.ObjectId(),
        name: gymName,
        address: '123 Main St, Casablanca',
        phone: gymPhone,
        logo: '',
        isActive: true,
        halls: [
            {
                _id: new mongoose.Types.ObjectId(),
                name: 'A-1',
                type: 'Yoga',
                capacity: 20,
            },
            {
                _id: new mongoose.Types.ObjectId(),
                name: 'B-2',
                type: 'Strength',
                capacity: 25,
            },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await gyms.insertOne(newGym);
    return newGym;
};

const findOrCreateUser = async (users, payload) => {
    const existing = await users.findOne({ email: payload.email });
    if (existing) {
        return existing;
    }

    const passwordHash = await createPasswordHash(payload.password);
    const newUser = {
        _id: new mongoose.Types.ObjectId(),
        email: payload.email,
        passwordHash,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: payload.role,
        gymId: payload.gymId || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await users.insertOne(newUser);
    return newUser;
};

const findOrCreateMember = async (members, payload) => {
    const existing = await members.findOne({ email: payload.email });
    if (existing) {
        return existing;
    }

    const passwordHash = await createPasswordHash(payload.password);
    const newMember = {
        _id: new mongoose.Types.ObjectId(),
        gymId: payload.gymId,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        passwordHash,
        phone: payload.phone,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await members.insertOne(newMember);
    return newMember;
};

const findOrCreateActivity = async (activities, payload) => {
    let activity = await activities.findOne({ gymId: payload.gymId, name: payload.name });
    if (activity) {
        if (!activity.hallId && payload.hallId) {
            await activities.updateOne(
                { _id: activity._id },
                { $set: { hallId: payload.hallId, updatedAt: new Date() } },
            );
            return { ...activity, hallId: payload.hallId };
        }
        return activity;
    }

    activity = {
        _id: new mongoose.Types.ObjectId(),
        gymId: payload.gymId,
        hallId: payload.hallId,
        name: payload.name,
        coach: payload.coach,
        monthlyPrice: payload.monthlyPrice,
        maxCapacity: payload.maxCapacity,
        schedule: payload.schedule,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await activities.insertOne(activity);
    return activity;
};

const findOrCreateSubscription = async (subscriptions, payload) => {
    let subscription = await subscriptions.findOne({
        gymId: payload.gymId,
        member: payload.member,
        activity: payload.activity,
        status: payload.status,
    });

    if (subscription) {
        return subscription;
    }

    subscription = {
        _id: new mongoose.Types.ObjectId(),
        gymId: payload.gymId,
        member: payload.member,
        activity: payload.activity,
        startDate: payload.startDate,
        endDate: payload.endDate,
        status: payload.status,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await subscriptions.insertOne(subscription);
    return subscription;
};

const findOrCreatePayment = async (payments, payload) => {
    let payment = await payments.findOne({ subscription: payload.subscription });
    if (payment) {
        return payment;
    }

    payment = {
        _id: new mongoose.Types.ObjectId(),
        gymId: payload.gymId,
        subscription: payload.subscription,
        amount: payload.amount,
        amountDue: payload.amount,
        paidAt: payload.paidAt,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await payments.insertOne(payment);
    return payment;
};

async function seed() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(DB_URI);

        const db = mongoose.connection.db;
        const gyms = db.collection('gyms');
        const users = db.collection('users');
        const members = db.collection('members');
        const activities = db.collection('activities');
        const subscriptions = db.collection('subscriptions');
        const payments = db.collection('payments');

        const gym = await findOrCreateGym(gyms);
        const gymKey = gym._id.toString().slice(-6);

        const admin = await users.findOne({ role: 'ADMIN', gymId: gym._id });
        const adminUser = admin
            ? admin
            : await findOrCreateUser(users, {
                email: `admin.${gymKey}@fitmanager.com`,
                password: 'admin1234',
                firstName: 'Gym',
                lastName: 'Admin',
                role: 'ADMIN',
                gymId: gym._id,
            });

        const coachUser = await findOrCreateUser(users, {
            email: `coach.${gymKey}@fitmanager.com`,
            password: 'coach1234',
            firstName: 'Coach',
            lastName: 'One',
            role: 'COACH',
            gymId: gym._id,
        });

        const hallId = gym.halls?.[0]?._id || new mongoose.Types.ObjectId();
        const activity = await findOrCreateActivity(activities, {
            gymId: gym._id,
            name: 'CrossFit',
            hallId,
            coach: coachUser._id,
            monthlyPrice: 300,
            maxCapacity: 60,
            schedule: [{ day: 'Monday', startTime: '16:00', endTime: '17:00' }],
        });

        const activeMember = await findOrCreateMember(members, {
            gymId: gym._id,
            email: `member.active.${gymKey}@fitmanager.com`,
            password: 'member1234',
            firstName: 'Karim',
            lastName: 'Alaoui',
            phone: '0600000002',
        });

        const expiredMember = await findOrCreateMember(members, {
            gymId: gym._id,
            email: `member.expired.${gymKey}@fitmanager.com`,
            password: 'member1234',
            firstName: 'Sara',
            lastName: 'Bennani',
            phone: '0600000003',
        });

        const activeStart = new Date();
        activeStart.setDate(activeStart.getDate() - 7);
        const activeEnd = new Date(activeStart);
        activeEnd.setMonth(activeEnd.getMonth() + 1);

        const activeSubscription = await findOrCreateSubscription(subscriptions, {
            gymId: gym._id,
            member: activeMember._id,
            activity: activity._id,
            startDate: activeStart,
            endDate: activeEnd,
            status: 'active',
        });

        const expiredStart = new Date();
        expiredStart.setMonth(expiredStart.getMonth() - 2);
        const expiredEnd = new Date(expiredStart);
        expiredEnd.setMonth(expiredEnd.getMonth() + 1);

        await findOrCreateSubscription(subscriptions, {
            gymId: gym._id,
            member: expiredMember._id,
            activity: activity._id,
            startDate: expiredStart,
            endDate: expiredEnd,
            status: 'expired',
        });

        await findOrCreatePayment(payments, {
            gymId: gym._id,
            subscription: activeSubscription._id,
            amount: activity.monthlyPrice,
            paidAt: new Date(),
        });

        console.log('Seed completed.');
        console.log('Admin login:', adminUser.email, '/ admin1234');
        console.log('Coach login:', coachUser.email, '/ coach1234');
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
