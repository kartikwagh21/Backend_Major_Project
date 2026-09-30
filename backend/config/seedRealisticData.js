const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const Customer = require('../models/Customer');
const Technician = require('../models/Technician');
const RepairRequest = require('../models/RepairRequest');

// Ensure upload directory exists
const uploadDir = path.resolve(process.env.UPLOAD_PATH || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Generate valid binary PNG file
function generatePngBuffer(width, height, r, g, b) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 2; // RGB
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdrChunk = createChunk('IHDR', ihdrData);

  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      // create subtle gradient/border pattern
      const isBorder = x < 4 || x >= width - 4 || y < 4 || y >= height - 4;
      rawData[pxOffset] = isBorder ? Math.min(255, r + 40) : r;
      rawData[pxOffset + 1] = isBorder ? Math.min(255, g + 40) : g;
      rawData[pxOffset + 2] = isBorder ? Math.min(255, b + 40) : b;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(12 + length);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = calculateCrc(Buffer.concat([Buffer.from(type, 'ascii'), data]));
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

function calculateCrc(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Helper to create appliance PNG photo
const createAppliancePng = (filename, r, g, b) => {
  const filePath = path.join(uploadDir, filename);
  const png = generatePngBuffer(400, 300, r, g, b);
  fs.writeFileSync(filePath, png);
  return `uploads/${filename}`;
};

const seedRealisticData = async () => {
  try {
    console.log('🔄 Seeding comprehensive Indian sample dataset (PNG images)...');

    // Create realistic PNG photos
    const voltasAcPhoto = createAppliancePng('voltas_split_ac.png', 37, 99, 235);
    const daikinAcPhoto = createAppliancePng('daikin_inverter_ac.png', 2, 132, 199);
    const panasonicAcPhoto = createAppliancePng('panasonic_ac.png', 99, 102, 241);
    const lgWmPhoto = createAppliancePng('lg_frontload_wm.png', 124, 58, 237);
    const boschWmPhoto = createAppliancePng('bosch_series6_wm.png', 5, 150, 105);
    const samsungFridgePhoto = createAppliancePng('samsung_double_door.png', 13, 148, 136);
    const whirlpoolFridgePhoto = createAppliancePng('whirlpool_protton.png', 8, 145, 178);
    const ifbMicroPhoto = createAppliancePng('ifb_convection_micro.png', 217, 119, 6);
    const kentRoPhoto = createAppliancePng('kent_grand_ro.png', 37, 99, 235);
    const sonyTvPhoto = createAppliancePng('sony_bravia_tv.png', 147, 51, 234);
    createAppliancePng('default_appliance.png', 75, 85, 99);

    // 1. Clear existing seed data to prevent duplicates
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
      isActive: true,
    });

    const techAmit = await Technician.create({
      name: 'Amit Patel',
      email: 'amit.patel@fixitpro.in',
      password: 'password123',
      phone: '+91 98334 11209',
      specialization: 'Refrigerator & Freezer',
      isActive: true,
    });

    const techVikram = await Technician.create({
      name: 'Vikram Sawant',
      email: 'vikram.sawant@fixitpro.in',
      password: 'password123',
      phone: '+91 98192 88471',
      specialization: 'Washing Machine & Dryer',
      isActive: true,
    });

    const techSanjay = await Technician.create({
      name: 'Sanjay Deshmukh',
      email: 'sanjay.deshmukh@fixitpro.in',
      password: 'password123',
      phone: '+91 98210 66320',
      specialization: 'General Home Appliances',
      isActive: true,
    });

    // 3. Create Customers
    const custKartik = await Customer.create({
      name: 'Kartik Wagh',
      email: 'kartik.wagh@gmail.com',
      password: 'password123',
      phone: '+91 98200 12345',
      address: 'Flat 402, Sea Breeze Apts, Sector 17, Palm Beach Road, Vashi, Navi Mumbai 400703',
    });

    const custPriya = await Customer.create({
      name: 'Priya Nair',
      email: 'priya.nair@gmail.com',
      password: 'password123',
      phone: '+91 98190 23456',
      address: 'B-1204, Lodha Eternis, Mahakali Caves Road, Andheri East, Mumbai 400093',
    });

    const custRohan = await Customer.create({
      name: 'Rohan Kulkarni',
      email: 'rohan.kulkarni@gmail.com',
      password: 'password123',
      phone: '+91 98205 34567',
      address: '702, Hiranandani Estate, Ghodbunder Road, Thane West 400607',
    });

    const custAnanya = await Customer.create({
      name: 'Ananya Joshi',
      email: 'ananya.joshi@gmail.com',
      password: 'password123',
      phone: '+91 98330 45678',
      address: 'Flat 301, Silver Sands, Shivaji Park, Dadar West, Mumbai 400028',
    });

    const custVikas = await Customer.create({
      name: 'Vikas Mehta',
      email: 'vikas.mehta@gmail.com',
      password: 'password123',
      phone: '+91 98211 56789',
      address: 'A-503, Raheja Tipco Heights, Rani Sati Marg, Malad East, Mumbai 400097',
    });

    // 4. Create Requests
    await RepairRequest.deleteMany({ customer: { $in: [custKartik._id, custPriya._id, custRohan._id, custAnanya._id, custVikas._id] } });

    await RepairRequest.create([
      {
        customer: custKartik._id,
        technician: techRajesh._id,
        applianceType: 'Air Conditioner (AC)',
        brand: 'Voltas',
        issueDescription: 'Indoor unit cooling is minimal and error code E4 is flashing on LED display.',
        photoPath: voltasAcPhoto,
        status: 'Assigned',
        statusHistory: [
          { status: 'Assigned', changedAt: new Date(Date.now() - 3600000 * 5), changedBy: `${custKartik.name} (Customer)`, role: 'customer', note: 'Repair request raised.' },
        ],
      },
      {
        customer: custKartik._id,
        technician: techRajesh._id,
        applianceType: 'Air Conditioner (AC)',
        brand: 'Daikin',
        issueDescription: 'AC outdoor unit makes loud vibrations and trips MCB breaker after 15 minutes of continuous running.',
        photoPath: daikinAcPhoto,
        status: 'In Progress',
        statusHistory: [
          { status: 'Assigned', changedAt: new Date(Date.now() - 3600000 * 24), changedBy: `${custKartik.name} (Customer)`, role: 'customer', note: 'Request assigned.' },
          { status: 'In Progress', changedAt: new Date(Date.now() - 3600000 * 2), changedBy: `${techRajesh.name} (Technician)`, role: 'technician', note: 'Diagnosing compressor electrical short.' },
        ],
      },
      {
        customer: custKartik._id,
        technician: techVikram._id,
        applianceType: 'Washing Machine',
        brand: 'Bosch',
        issueDescription: 'Front load washing machine door lock mechanism is jammed with error code E13.',
        photoPath: boschWmPhoto,
        status: 'Completed',
        statusHistory: [
          { status: 'Assigned', changedAt: new Date(Date.now() - 3600000 * 48), changedBy: `${custKartik.name} (Customer)`, role: 'customer', note: 'Request created.' },
          { status: 'In Progress', changedAt: new Date(Date.now() - 3600000 * 24), changedBy: `${techVikram.name} (Technician)`, role: 'technician', note: 'Door latch replacement in progress.' },
          { status: 'Completed', changedAt: new Date(Date.now() - 3600000 * 1), changedBy: `${techVikram.name} (Technician)`, role: 'technician', note: 'Thermal door lock replaced and test cycle passed.' },
        ],
      },
      {
        customer: custKartik._id,
        technician: techAmit._id,
        applianceType: 'Refrigerator / Fridge',
        brand: 'Samsung',
        issueDescription: 'Water leaking continuously from the bottom defrost drain tray onto the kitchen floor.',
        photoPath: samsungFridgePhoto,
        status: 'Assigned',
        statusHistory: [
          { status: 'Assigned', changedAt: new Date(Date.now() - 3600000 * 3), changedBy: `${custKartik.name} (Customer)`, role: 'customer', note: 'Inspection request raised.' },
        ],
      },
    ]);

    console.log('✅ Comprehensive Indian sample dataset (PNG images) seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error.message);
  }
};

module.exports = seedRealisticData;
