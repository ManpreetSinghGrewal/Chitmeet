require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');
const connectDB = require('./config/db');

connectDB();

const seedRooms = async () => {
  try {
    await Room.deleteMany();

    await Room.insertMany([
      { roomId: 'general', name: 'General Chat', type: 'both' },
      { roomId: 'study-group', name: 'Late Night Study', type: 'video' },
      { roomId: 'gaming', name: 'Hostel Gaming', type: 'text' },
      { roomId: 'boys-hostel-a', name: 'Boys Hostel Block A', type: 'both' },
      { roomId: 'girls-hostel-b', name: 'Girls Hostel Block B', type: 'both' }
    ]);

    console.log('Rooms Seeded Successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding rooms', error);
    process.exit(1);
  }
};

seedRooms();
