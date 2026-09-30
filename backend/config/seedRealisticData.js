const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Customer = require('../models/Customer');
const Technician = require('../models/Technician');
const RepairRequest = require('../models/RepairRequest');

const sampleImagesDir = path.resolve(__dirname, '../../sample_appliance_images');

// Helper to load PNG photo buffer from sample_appliance_images directory
const getImageBuffer = (filename) => {
  const sourcePath = path.join(sampleImagesDir, filename);
  if (fs.existsSync(sourcePath)) {
    return {
      data: fs.readFileSync(sourcePath),
      contentType: 'image/png',
    };
  }

  // 1x1 transparent PNG fallback buffer
  const fallbackPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  return {
    data: fallbackPng,
    contentType: 'image/png',
  };
};

const seedRealisticData = async (force = false) => {
  try {
    // If not forced and data already exists, do not overwrite
    if (!force) {
      const existingCount = await Customer.countDocuments();
      if (existingCount > 0) {
        console.log(`ℹ️ Existing data found (${existingCount} customers). Seeding skipped.`);
        return;
      }
    }

    console.log('🔄 Seeding database with realistic data and PNG photos in MongoDB Atlas...');

    const voltasAcPhoto = getImageBuffer('voltas_1.5ton_split_ac.png');
    const daikinAcPhoto = getImageBuffer('daikin_2ton_inverter_ac.png');
    const panasonicAcPhoto = getImageBuffer('panasonic_1ton_smart_ac.png');
    const boschWmPhoto = getImageBuffer('bosch_serie6_washing_machine.png');
    const samsungFridgePhoto = getImageBuffer('samsung_345L_frost_free_fridge.png');
    const whirlpoolFridgePhoto = getImageBuffer('whirlpool_300L_protton_fridge.png');
    const ifbMicroPhoto = getImageBuffer('ifb_30L_convection_microwave.png');
    const kentRoPhoto = getImageBuffer('kent_grand_plus_ro_purifier.png');
    const sonyTvPhoto = getImageBuffer('sony_bravia_55inch_4k_tv.png');

    // 1. Clear existing seed users when force seeded
    await Customer.deleteMany({ email: { $in: [
      'kartik.wagh@gmail.com',
      'priya.nair@gmail.com',
      'rohan.kulkarni@gmail.com',
      'ananya.joshi@gmail.com',
      'vikas.mehta@gmail.com',
    ] } });

    await Technician.deleteMany({ email: { $in: [
      'rajesh.sharma@fixitpro.in',
      'amit.patel@fixitpro.in',
      'vikram.sawant@fixitpro.in',
      'sanjay.deshmukh@fixitpro.in',
    ] } });

    // 2. Create Technicians
    const techRajesh = await Technician.create({
      name: 'Rajesh Sharma',
      email: 'rajesh.sharma@fixitpro.in',
      password: 'password123',
      phone: '+91 98201 44521',
      specialization: 'Air Conditioner (AC)',
      role: 'technician',
    });

    const techAmit = await Technician.create({
      name: 'Amit Patel',
      email: 'amit.patel@fixitpro.in',
      password: 'password123',
      phone: '+91 98334 11209',
      specialization: 'Refrigerator & Freezer',
      role: 'technician',
    });

    const techVikram = await Technician.create({
      name: 'Vikram Sawant',
      email: 'vikram.sawant@fixitpro.in',
      password: 'password123',
      phone: '+91 98192 88471',
      specialization: 'Washing Machine & Dryer',
      role: 'technician',
    });

    const techSanjay = await Technician.create({
      name: 'Sanjay Deshmukh',
      email: 'sanjay.deshmukh@fixitpro.in',
      password: 'password123',
      phone: '+91 98210 66320',
      specialization: 'General Home Appliances',
      role: 'technician',
    });

    // 3. Create Customers
    const custKartik = await Customer.create({
      name: 'Kartik Wagh',
      email: 'kartik.wagh@gmail.com',
      password: 'password123',
      phone: '+91 98200 12345',
      address: 'Flat 402, Sea Breeze Apts, Sector 17, Palm Beach Road, Vashi, Navi Mumbai 400703',
      role: 'customer',
    });

    const custPriya = await Customer.create({
      name: 'Priya Nair',
      email: 'priya.nair@gmail.com',
      password: 'password123',
      phone: '+91 98190 23456',
      address: 'B-1204, Lodha Eternis, Mahakali Caves Road, Andheri East, Mumbai 400093',
      role: 'customer',
    });

    const custRohan = await Customer.create({
      name: 'Rohan Kulkarni',
      email: 'rohan.kulkarni@gmail.com',
      password: 'password123',
      phone: '+91 98205 34567',
      address: '702, Hiranandani Estate, Ghodbunder Road, Thane West 400607',
      role: 'customer',
    });

    const custAnanya = await Customer.create({
      name: 'Ananya Joshi',
      email: 'ananya.joshi@gmail.com',
      password: 'password123',
      phone: '+91 98330 45678',
      address: 'Flat 301, Silver Sands, Shivaji Park, Dadar West, Mumbai 400028',
      role: 'customer',
    });

    const custVikas = await Customer.create({
      name: 'Vikas Mehta',
      email: 'vikas.mehta@gmail.com',
      password: 'password123',
      phone: '+91 98211 56789',
      address: 'A-503, Raheja Tipco Heights, Rani Sati Marg, Malad East, Mumbai 400097',
      role: 'customer',
    });

    // 4. Create Requests using the sample_appliance_images PNG files
    await RepairRequest.deleteMany({ customer: { $in: [custKartik._id, custPriya._id, custRohan._id, custAnanya._id, custVikas._id] } });

    const requestsToSeed = [
      {
        customer: custKartik._id,
        technician: techRajesh._id,
        applianceType: 'Air Conditioner (AC)',
        brand: 'Voltas',
        issueDescription: 'Indoor unit cooling is minimal and error code E4 is flashing on LED display.',
        photo: {
          data: voltasAcPhoto.data,
          contentType: voltasAcPhoto.contentType,
        },
        status: 'Assigned',
        statusHistory: [
          { status: 'Assigned', changedAt: new Date(Date.now() - 3600000 * 5), changedBy: `${custKartik.name} (Customer)`, role: 'customer', note: 'Repair request raised and assigned to technician Rajesh Sharma.' },
        ],
      },
      {
        customer: custKartik._id,
        technician: techVikram._id,
        applianceType: 'Washing Machine',
        brand: 'Bosch',
        issueDescription: 'Front load washing machine door lock mechanism is jammed with error code E13.',
        photo: {
          data: boschWmPhoto.data,
          contentType: boschWmPhoto.contentType,
        },
        status: 'Completed',
        statusHistory: [
          { status: 'Assigned', changedAt: new Date(Date.now() - 3600000 * 48), changedBy: `${custKartik.name} (Customer)`, role: 'customer', note: 'Repair request raised.' },
          { status: 'In Progress', changedAt: new Date(Date.now() - 3600000 * 24), changedBy: `${techVikram.name} (Technician)`, role: 'technician', note: 'Door latch mechanism replacement in progress.' },
          { status: 'Completed', changedAt: new Date(Date.now() - 3600000 * 2), changedBy: `${techVikram.name} (Technician)`, role: 'technician', note: 'Thermal door lock replaced and test cycle passed.' },
        ],
      },
      {
        customer: custKartik._id,
        technician: techRajesh._id,
        applianceType: 'Air Conditioner (AC)',
        brand: 'Daikin',
        issueDescription: 'AC outdoor unit makes loud vibrations and trips MCB breaker after 15 minutes of continuous running.',
        photo: {
          data: daikinAcPhoto.data,
          contentType: daikinAcPhoto.contentType,
        },
        status: 'In Progress',
        statusHistory: [
          { status: 'Assigned', changedAt: new Date(Date.now() - 3600000 * 24), changedBy: `${custKartik.name} (Customer)`, role: 'customer', note: 'Repair request raised.' },
          { status: 'In Progress', changedAt: new Date(Date.now() - 3600000 * 3), changedBy: `${techRajesh.name} (Technician)`, role: 'technician', note: 'Compressor capacitor replaced; testing current draw.' },
        ],
      },
      {
        customer: custKartik._id,
        technician: techAmit._id,
        applianceType: 'Refrigerator / Fridge',
        brand: 'Samsung',
        issueDescription: 'Water leaking continuously from the bottom defrost drain tray onto the kitchen floor.',
        photo: {
          data: samsungFridgePhoto.data,
          contentType: samsungFridgePhoto.contentType,
        },
        status: 'Assigned',
        statusHistory: [
          { status: 'Assigned', changedAt: new Date(Date.now() - 3600000 * 6), changedBy: `${custKartik.name} (Customer)`, role: 'customer', note: 'Inspection request raised.' },
        ],
      },
      {
        customer: custKartik._id,
        technician: techSanjay._id,
        applianceType: 'Microwave Oven',
        brand: 'IFB',
        issueDescription: 'Turntable rotates normally but microwave emits humming sound and fails to heat any food items.',
        photo: {
          data: ifbMicroPhoto.data,
          contentType: ifbMicroPhoto.contentType,
        },
        status: 'Assigned',
        statusHistory: [
          { status: 'Assigned', changedAt: new Date(Date.now() - 3600000 * 8), changedBy: `${custKartik.name} (Customer)`, role: 'customer', note: 'Repair request created.' },
        ],
      },
      {
        customer: custKartik._id,
        technician: techSanjay._id,
        applianceType: 'Water Purifier / RO',
        brand: 'Kent',
        issueDescription: 'Purifier motor beeps continuously with red filter change indicator light blinking.',
        photo: {
          data: kentRoPhoto.data,
          contentType: kentRoPhoto.contentType,
        },
        status: 'Completed',
        statusHistory: [
          { status: 'Assigned', changedAt: new Date(Date.now() - 3600000 * 72), changedBy: `${custKartik.name} (Customer)`, role: 'customer', note: 'Service request raised.' },
          { status: 'In Progress', changedAt: new Date(Date.now() - 3600000 * 48), changedBy: `${techSanjay.name} (Technician)`, role: 'technician', note: 'Sediment and carbon filter replacement underway.' },
          { status: 'Completed', changedAt: new Date(Date.now() - 3600000 * 20), changedBy: `${techSanjay.name} (Technician)`, role: 'technician', note: 'RO membrane replaced, TDS calibrated to 85 ppm.' },
        ],
      },
      {
        customer: custPriya._id,
        technician: techRajesh._id,
        applianceType: 'Air Conditioner (AC)',
        brand: 'Panasonic',
        issueDescription: 'Smart inverter AC remote connectivity is unresponsive.',
        photo: {
          data: panasonicAcPhoto.data,
          contentType: panasonicAcPhoto.contentType,
        },
        status: 'Assigned',
        statusHistory: [
          { status: 'Assigned', changedAt: new Date(Date.now() - 3600000 * 12), changedBy: `${custPriya.name} (Customer)`, role: 'customer', note: 'Service request booked.' },
        ],
      },
      {
        customer: custRohan._id,
        technician: techAmit._id,
        applianceType: 'Refrigerator / Fridge',
        brand: 'Whirlpool',
        issueDescription: 'Triple door bottom drawer temperature sensor warning alarm is beeping.',
        photo: {
          data: whirlpoolFridgePhoto.data,
          contentType: whirlpoolFridgePhoto.contentType,
        },
        status: 'Assigned',
        statusHistory: [
          { status: 'Assigned', changedAt: new Date(Date.now() - 3600000 * 15), changedBy: `${custRohan.name} (Customer)`, role: 'customer', note: 'Inspection request submitted.' },
        ],
      },
      {
        customer: custAnanya._id,
        technician: techSanjay._id,
        applianceType: 'Television (Smart TV)',
        brand: 'Sony',
        issueDescription: 'TV panel backlight is dark on the left half of the display.',
        photo: {
          data: sonyTvPhoto.data,
          contentType: sonyTvPhoto.contentType,
        },
        status: 'Assigned',
        statusHistory: [
          { status: 'Assigned', changedAt: new Date(Date.now() - 3600000 * 18), changedBy: `${custAnanya.name} (Customer)`, role: 'customer', note: 'Display repair requested.' },
        ],
      },
    ];

    for (const reqData of requestsToSeed) {
      const doc = new RepairRequest(reqData);
      doc.photoPath = `/api/requests/${doc._id}/photo`;
      await doc.save();
    }

    console.log('✅ Seeding completed: 5 Customers, 4 Technicians, and 9 Repair Requests with PNG photos saved in MongoDB Atlas.');
  } catch (error) {
    console.error('Error seeding data:', error.message);
  }
};

module.exports = seedRealisticData;
