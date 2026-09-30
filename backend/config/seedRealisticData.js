const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Customer = require('../models/Customer');
const Technician = require('../models/Technician');
const RepairRequest = require('../models/RepairRequest');

// Ensure upload directory exists
const uploadDir = path.resolve(process.env.UPLOAD_PATH || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper to create authentic appliance SVG mock photos with realistic icons
const createApplianceImage = (filename, title, brand, color) => {
  const filePath = path.join(uploadDir, filename);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="100%" height="100%" fill="#0c121e"/>
    <rect x="20" y="20" width="560" height="360" rx="12" fill="#111726" stroke="#1e293d" stroke-width="2"/>
    <circle cx="300" cy="155" r="55" fill="${color}" opacity="0.15"/>
    <rect x="265" y="120" width="70" height="70" rx="10" fill="none" stroke="${color}" stroke-width="3.5"/>
    <text x="300" y="245" text-anchor="middle" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="22" font-weight="700">${brand}</text>
    <text x="300" y="280" text-anchor="middle" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="16">${title}</text>
    <text x="300" y="325" text-anchor="middle" fill="#60a5fa" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" font-weight="600">Verified Inspection Photo • FixIt Pro Mumbai Service Center</text>
  </svg>`;
  fs.writeFileSync(filePath, svg);
  return `uploads/${filename}`;
};

const seedRealisticData = async () => {
  try {
    console.log('🔄 Seeding comprehensive Indian sample dataset (Mumbai, Thane, Navi Mumbai)...');

    // Create realistic photos
    const voltasAcPhoto = createApplianceImage('voltas_split_ac.svg', '1.5 Ton Inverter Split AC', 'Voltas', '#2563eb');
    const daikinAcPhoto = createApplianceImage('daikin_inverter_ac.svg', '2 Ton 5-Star Split AC', 'Daikin Japan', '#0284c7');
    const panasonicAcPhoto = createApplianceImage('panasonic_ac.svg', '1 Ton Smart Split AC', 'Panasonic Nanoe-X', '#6366f1');
    const lgWmPhoto = createApplianceImage('lg_frontload_wm.svg', '8kg Smart Inverter Front Load', 'LG Electronics', '#7c3aed');
    const boschWmPhoto = createApplianceImage('bosch_series6_wm.svg', '7kg Front Load EcoSilence', 'Bosch Serie 6', '#059669');
    const samsungFridgePhoto = createApplianceImage('samsung_double_door.svg', '345L Frost Free Refrigerator', 'Samsung Digital Inverter', '#0d9488');
    const whirlpoolFridgePhoto = createApplianceImage('whirlpool_protton.svg', '300L Triple Door Refrigerator', 'Whirlpool Protton', '#0891b2');
    const ifbMicroPhoto = createApplianceImage('ifb_convection_micro.svg', '30L Convection Microwave Oven', 'IFB Appliances', '#d97706');
    const kentRoPhoto = createApplianceImage('kent_grand_ro.svg', 'Grand Plus RO+UV Water Purifier', 'Kent RO Systems', '#2563eb');
    const sonyTvPhoto = createApplianceImage('sony_bravia_tv.svg', '55 inch 4K HDR Google TV', 'Sony Bravia', '#9333ea');

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

    // 2. Create Indian Technicians in Mumbai
    const rajesh = await Technician.create({
      name: 'Rajesh Sharma',
      email: 'rajesh.sharma@fixitpro.in',
      password: 'password123',
      phone: '+91 98201 44521',
      specialization: 'Air Conditioner (AC)',
      role: 'technician',
    });

    const amit = await Technician.create({
      name: 'Amit Patel',
      email: 'amit.patel@fixitpro.in',
      password: 'password123',
      phone: '+91 98334 11202',
      specialization: 'Refrigerator & Freezer',
      role: 'technician',
    });

    const vikram = await Technician.create({
      name: 'Vikram Sawant',
      email: 'vikram.sawant@fixitpro.in',
      password: 'password123',
      phone: '+91 98192 88471',
      specialization: 'Washing Machine & Dryer',
      role: 'technician',
    });

    const sanjay = await Technician.create({
      name: 'Sanjay Deshmukh',
      email: 'sanjay.deshmukh@fixitpro.in',
      password: 'password123',
      phone: '+91 98210 55930',
      specialization: 'Microwave & Oven',
      role: 'technician',
    });

    // 3. Create Indian Customers with Mumbai addresses
    const kartik = await Customer.create({
      name: 'Kartik Wagh',
      email: 'kartik.wagh@gmail.com',
      password: 'password123',
      phone: '+91 98200 12345',
      address: 'Flat 402, Sea Breeze Apts, Sector 17, Palm Beach Road, Vashi, Navi Mumbai 400703',
      role: 'customer',
    });

    const priya = await Customer.create({
      name: 'Priya Nair',
      email: 'priya.nair@gmail.com',
      password: 'password123',
      phone: '+91 98205 67890',
      address: 'B-1204, Lodha Park, Senapati Bapat Marg, Lower Parel, Mumbai 400013',
      role: 'customer',
    });

    const rohan = await Customer.create({
      name: 'Rohan Kulkarni',
      email: 'rohan.kulkarni@gmail.com',
      password: 'password123',
      phone: '+91 98691 23456',
      address: '302, Gokul Dham CHS, Near Shimpoli Road, Borivali West, Mumbai 400092',
      role: 'customer',
    });

    const ananya = await Customer.create({
      name: 'Ananya Joshi',
      email: 'ananya.joshi@gmail.com',
      password: 'password123',
      phone: '+91 98190 34567',
      address: 'Flat 701, Somerset Building, Hiranandani Gardens, Powai, Mumbai 400076',
      role: 'customer',
    });

    const vikas = await Customer.create({
      name: 'Vikas Mehta',
      email: 'vikas.mehta@gmail.com',
      password: 'password123',
      phone: '+91 98211 99887',
      address: '1502, Runwal Greens, Goregaon-Mulund Link Road, Mulund West, Mumbai 400080',
      role: 'customer',
    });

    // 4. Create Rich Repair Requests Across All Lifecycle States
    await RepairRequest.deleteMany({
      customer: { $in: [kartik._id, priya._id, rohan._id, ananya._id, vikas._id] }
    });

    // ==========================================
    // REPAIR REQUESTS FOR KARTIK WAGH (Demo Customer)
    // ==========================================

    // 1. Kartik: Voltas AC -> IN PROGRESS (Assigned to Rajesh Sharma)
    await RepairRequest.create({
      customer: kartik._id,
      technician: rajesh._id,
      applianceType: 'Air Conditioner (AC)',
      brand: 'Voltas 1.5 Ton Inverter',
      issueDescription: 'Indoor unit cooling is minimal and error code E4 is flashing intermittently on the display. Outdoor condenser unit fan vibrates with rattling noise.',
      photoPath: voltasAcPhoto,
      status: 'In Progress',
      createdAt: new Date(Date.now() - 26 * 3600 * 1000),
      statusHistory: [
        {
          status: 'Assigned',
          changedAt: new Date(Date.now() - 26 * 3600 * 1000),
          changedBy: 'Kartik Wagh (Customer)',
          role: 'customer',
          note: 'Request raised and assigned to AC specialist Rajesh Sharma for Vashi residence.',
        },
        {
          status: 'In Progress',
          changedAt: new Date(Date.now() - 4 * 3600 * 1000),
          changedBy: 'Rajesh Sharma (Technician)',
          role: 'technician',
          note: 'Inspected refrigerant pressure at 40 PSI (low). Commenced nitrogen pressure testing on flare joints.',
        },
      ],
    });

    // 2. Kartik: Bosch Front-Load Washing Machine -> ASSIGNED (Assigned to Vikram Sawant)
    await RepairRequest.create({
      customer: kartik._id,
      technician: vikram._id,
      applianceType: 'Washing Machine',
      brand: 'Bosch Serie 6 Front Load',
      issueDescription: 'Drum produces excessive loud thumping noise during 1200 RPM high-speed spin cycle. Machine vibrates and moves across utility room tiles.',
      photoPath: boschWmPhoto,
      status: 'Assigned',
      createdAt: new Date(Date.now() - 8 * 3600 * 1000),
      statusHistory: [
        {
          status: 'Assigned',
          changedAt: new Date(Date.now() - 8 * 3600 * 1000),
          changedBy: 'Kartik Wagh (Customer)',
          role: 'customer',
          note: 'Booked home inspection for Bosch washing machine shock absorber check.',
        },
      ],
    });

    // 3. Kartik: Daikin AC -> COMPLETED (Assigned to Rajesh Sharma)
    await RepairRequest.create({
      customer: kartik._id,
      technician: rajesh._id,
      applianceType: 'Air Conditioner (AC)',
      brand: 'Daikin 2 Ton 5-Star Split AC',
      issueDescription: 'Water leaking continuously from the left side of the indoor blower unit onto the bedroom wooden flooring during monsoon.',
      photoPath: daikinAcPhoto,
      status: 'Completed',
      createdAt: new Date(Date.now() - 72 * 3600 * 1000),
      statusHistory: [
        {
          status: 'Assigned',
          changedAt: new Date(Date.now() - 72 * 3600 * 1000),
          changedBy: 'Kartik Wagh (Customer)',
          role: 'customer',
          note: 'Assigned to Rajesh Sharma for urgent drainage unclogging.',
        },
        {
          status: 'In Progress',
          changedAt: new Date(Date.now() - 48 * 3600 * 1000),
          changedBy: 'Rajesh Sharma (Technician)',
          role: 'technician',
          note: 'Cleared slime and algal blockage in primary drain pipe using high-pressure CO2 pump.',
        },
        {
          status: 'Completed',
          changedAt: new Date(Date.now() - 18 * 3600 * 1000),
          changedBy: 'Rajesh Sharma (Technician)',
          role: 'technician',
          note: 'Drain tray sanitized and slope calibrated. Verified zero water leak over 45 minutes continuous run.',
        },
      ],
    });

    // 4. Kartik: Panasonic AC -> CANCELLED (Assigned to Rajesh Sharma)
    await RepairRequest.create({
      customer: kartik._id,
      technician: rajesh._id,
      applianceType: 'Air Conditioner (AC)',
      brand: 'Panasonic Nanoe-X Smart AC',
      issueDescription: 'Remote control not responding and Wi-Fi pairing fails with Miraie smart home application.',
      photoPath: panasonicAcPhoto,
      status: 'Cancelled',
      createdAt: new Date(Date.now() - 96 * 3600 * 1000),
      statusHistory: [
        {
          status: 'Assigned',
          changedAt: new Date(Date.now() - 96 * 3600 * 1000),
          changedBy: 'Kartik Wagh (Customer)',
          role: 'customer',
          note: 'Assigned to Rajesh Sharma.',
        },
        {
          status: 'Cancelled',
          changedAt: new Date(Date.now() - 90 * 3600 * 1000),
          changedBy: 'Kartik Wagh (Customer)',
          role: 'customer',
          note: 'Issue resolved after replacing remote AAA batteries and resetting home Wi-Fi router. Visit cancelled.',
        },
      ],
    });

    // ==========================================
    // ADDITIONAL REPAIR REQUESTS ACROSS MUMBAI
    // ==========================================

    // 5. Priya: LG Washing Machine -> IN PROGRESS (Assigned to Vikram Sawant)
    await RepairRequest.create({
      customer: priya._id,
      technician: vikram._id,
      applianceType: 'Washing Machine',
      brand: 'LG 8kg Direct Drive Front Load',
      issueDescription: 'Drum does not spin during final rinse cycle. Machine halts and displays door lock error dE.',
      photoPath: lgWmPhoto,
      status: 'In Progress',
      createdAt: new Date(Date.now() - 14 * 3600 * 1000),
      statusHistory: [
        {
          status: 'Assigned',
          changedAt: new Date(Date.now() - 14 * 3600 * 1000),
          changedBy: 'Priya Nair (Customer)',
          role: 'customer',
          note: 'Registered for doorstep service at Lower Parel residence.',
        },
        {
          status: 'In Progress',
          changedAt: new Date(Date.now() - 2 * 3600 * 1000),
          changedBy: 'Vikram Sawant (Technician)',
          role: 'technician',
          note: 'Door interlock switch assembly tested faulty. Installing OEM replacement latch part.',
        },
      ],
    });

    // 6. Rohan: Samsung Refrigerator -> COMPLETED (Assigned to Amit Patel)
    await RepairRequest.create({
      customer: rohan._id,
      technician: amit._id,
      applianceType: 'Refrigerator',
      brand: 'Samsung 345L Twin Cooling',
      issueDescription: 'Freezer is working fine but lower vegetable crisper and milk rack are not getting cool air circulation.',
      photoPath: samsungFridgePhoto,
      status: 'Completed',
      createdAt: new Date(Date.now() - 55 * 3600 * 1000),
      statusHistory: [
        {
          status: 'Assigned',
          changedAt: new Date(Date.now() - 55 * 3600 * 1000),
          changedBy: 'Rohan Kulkarni (Customer)',
          role: 'customer',
          note: 'Assigned to cooling technician Amit Patel.',
        },
        {
          status: 'In Progress',
          changedAt: new Date(Date.now() - 30 * 3600 * 1000),
          changedBy: 'Amit Patel (Technician)',
          role: 'technician',
          note: 'Diagnosed jammed evaporator damper motor preventing cold airflow to lower compartment.',
        },
        {
          status: 'Completed',
          changedAt: new Date(Date.now() - 5 * 3600 * 1000),
          changedBy: 'Amit Patel (Technician)',
          role: 'technician',
          note: 'Replaced motorized air damper flap and defrosted duct. Lower compartment temperature stable at 4°C.',
        },
      ],
    });

    // 7. Ananya: IFB Microwave -> IN PROGRESS (Assigned to Sanjay Deshmukh)
    await RepairRequest.create({
      customer: ananya._id,
      technician: sanjay._id,
      applianceType: 'Microwave Oven',
      brand: 'IFB 30L Convection Microwave',
      issueDescription: 'Microwave sparks with a loud buzzing sound as soon as microwave heating starts. Glass tray rotates normally.',
      photoPath: ifbMicroPhoto,
      status: 'In Progress',
      createdAt: new Date(Date.now() - 20 * 3600 * 1000),
      statusHistory: [
        {
          status: 'Assigned',
          changedAt: new Date(Date.now() - 20 * 3600 * 1000),
          changedBy: 'Ananya Joshi (Customer)',
          role: 'customer',
          note: 'Raised request for microwave repair at Powai residence.',
        },
        {
          status: 'In Progress',
          changedAt: new Date(Date.now() - 3 * 3600 * 1000),
          changedBy: 'Sanjay Deshmukh (Technician)',
          role: 'technician',
          note: 'Burned mica waveguide sheet detected. Replacing mica plate and testing high voltage diode.',
        },
      ],
    });

    // 8. Vikas: Whirlpool Refrigerator -> ASSIGNED (Assigned to Amit Patel)
    await RepairRequest.create({
      customer: vikas._id,
      technician: amit._id,
      applianceType: 'Refrigerator',
      brand: 'Whirlpool Protton 300L Triple Door',
      issueDescription: 'Compressor clicks on for 5 seconds and trips the home circuit breaker. Inverter board LED indicates fault code 3.',
      photoPath: whirlpoolFridgePhoto,
      status: 'Assigned',
      createdAt: new Date(Date.now() - 5 * 3600 * 1000),
      statusHistory: [
        {
          status: 'Assigned',
          changedAt: new Date(Date.now() - 5 * 3600 * 1000),
          changedBy: 'Vikas Mehta (Customer)',
          role: 'customer',
          note: 'Scheduled for technician diagnostic visit in Mulund West.',
        },
      ],
    });

    // 9. Priya: Kent RO Water Purifier -> COMPLETED (Assigned to Rajesh Sharma)
    await RepairRequest.create({
      customer: priya._id,
      technician: rajesh._id,
      applianceType: 'Water Purifier / RO',
      brand: 'Kent Grand Plus RO+UV+UF',
      issueDescription: 'Water output flow rate is very slow (less than 2 litres per hour) and UV fail alarm beeps continuously.',
      photoPath: kentRoPhoto,
      status: 'Completed',
      createdAt: new Date(Date.now() - 60 * 3600 * 1000),
      statusHistory: [
        {
          status: 'Assigned',
          changedAt: new Date(Date.now() - 60 * 3600 * 1000),
          changedBy: 'Priya Nair (Customer)',
          role: 'customer',
          note: 'Assigned to Rajesh Sharma.',
        },
        {
          status: 'In Progress',
          changedAt: new Date(Date.now() - 36 * 3600 * 1000),
          changedBy: 'Rajesh Sharma (Technician)',
          role: 'technician',
          note: 'Sediment and carbon pre-filters clogged. UV chamber lamp loose.',
        },
        {
          status: 'Completed',
          changedAt: new Date(Date.now() - 10 * 3600 * 1000),
          changedBy: 'Rajesh Sharma (Technician)',
          role: 'technician',
          note: 'Replaced sediment filter cartridge, carbon block, and 11W UV lamp. TDS adjusted to 85 ppm.',
        },
      ],
    });

    // 10. Rohan: Sony Bravia 55" TV -> CANCELLED (Assigned to Sanjay Deshmukh)
    await RepairRequest.create({
      customer: rohan._id,
      technician: sanjay._id,
      applianceType: 'Television (Smart TV)',
      brand: 'Sony Bravia 55 inch 4K HDR',
      issueDescription: 'Red LED blinks 6 times on power on. Screen backlight remains dark with sound playing normally.',
      photoPath: sonyTvPhoto,
      status: 'Cancelled',
      createdAt: new Date(Date.now() - 80 * 3600 * 1000),
      statusHistory: [
        {
          status: 'Assigned',
          changedAt: new Date(Date.now() - 80 * 3600 * 1000),
          changedBy: 'Rohan Kulkarni (Customer)',
          role: 'customer',
          note: 'Assigned to Sanjay Deshmukh for home inspection.',
        },
        {
          status: 'Cancelled',
          changedAt: new Date(Date.now() - 75 * 3600 * 1000),
          changedBy: 'Rohan Kulkarni (Customer)',
          role: 'customer',
          note: 'Customer opted for official Sony brand extended warranty panel replacement. Request closed.',
        },
      ],
    });

    console.log('✅ Comprehensive Indian sample dataset (10 requests across Assigned, In Progress, Completed, Cancelled) seeded successfully!');
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
  }
};

module.exports = seedRealisticData;
