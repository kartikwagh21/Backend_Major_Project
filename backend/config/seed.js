const Customer = require('../models/Customer');
const Technician = require('../models/Technician');

const seedDemoData = async () => {
  try {
    const techCount = await Technician.countDocuments();
    if (techCount === 0) {
      await Technician.create({
        name: 'Bob Technician',
        email: 'bob.tech@example.com',
        password: 'password123',
        phone: '+1 555-0188',
        specialization: 'Air Conditioner (AC)',
        role: 'technician',
      });
      await Technician.create({
        name: 'Carlos Gomez',
        email: 'carlos.tech@example.com',
        password: 'password123',
        phone: '+1 555-0199',
        specialization: 'Refrigerator & Freezer',
        role: 'technician',
      });
      console.log('✅ Demo technicians seeded into database.');
    }

    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      await Customer.create({
        name: 'Alice Customer',
        email: 'alice@example.com',
        password: 'password123',
        phone: '+1 555-0144',
        address: '742 Evergreen Terrace, Springfield',
        role: 'customer',
      });
      console.log('✅ Demo customer seeded into database.');
    }
  } catch (err) {
    console.error('Demo seed info:', err.message);
  }
};

module.exports = seedDemoData;
