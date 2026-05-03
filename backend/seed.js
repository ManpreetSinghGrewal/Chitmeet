require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');
const connectDB = require('./config/db');

connectDB();

const seedRooms = async () => {
  try {
    await Room.deleteMany();

    await Room.insertMany([
      { roomId: 'gaming', name: 'Gaming Room', type: 'video' },
      { roomId: 'study', name: 'Late Night Study Room', type: 'video' }
    ]);

    console.log('Rooms Seeded Successfully (Only Gaming and Study)');
    process.exit();
  } catch (error) {
    console.error('Error seeding rooms', error);
    process.exit(1);
  }
};

seedRooms();
