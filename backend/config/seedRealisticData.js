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

// Helper to create rich appliance inspection cards
const createApplianceCard = (filename, icon, brandHeader, title, model, color) => {
  const filePath = path.join(uploadDir, filename);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520">
    <defs>
      <linearGradient id="grad_${filename.replace(/[^a-zA-Z0-9]/g, '_')}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#111726"/>
        <stop offset="100%" stop-color="#090d16"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="#070a10"/>
    <rect x="24" y="24" width="752" height="472" rx="16" fill="url(#grad_${filename.replace(/[^a-zA-Z0-9]/g, '_')})" stroke="#1e293d" stroke-width="2"/>
    
    <!-- Header banner -->
    <rect x="24" y="24" width="752" height="56" rx="16" fill="#0c121e"/>
    <rect x="44" y="42" width="12" height="12" rx="3" fill="${color}"/>
    <text x="66" y="52" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700">ServiceDesk Appliance Diagnostic System • Mumbai Service Hub</text>
    <line x1="24" y1="80" x2="776" y2="80" stroke="#1e293d" stroke-width="1"/>

    <!-- Appliance Badge Frame -->
    <circle cx="400" cy="200" r="70" fill="${color}" opacity="0.15"/>
    <rect x="350" y="150" width="100" height="100" rx="14" fill="#182032" stroke="${color}" stroke-width="3.5"/>
    <text x="400" y="215" text-anchor="middle" font-size="46">${icon}</text>

    <!-- Details -->
    <text x="400" y="300" text-anchor="middle" fill="${color}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" letter-spacing="2">${brandHeader}</text>
    <text x="400" y="340" text-anchor="middle" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="bold">${title}</text>
    <text x="400" y="375" text-anchor="middle" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15">${model}</text>

    <!-- Verification Footer -->
    <rect x="180" y="415" width="440" height="36" rx="8" fill="#0c121e" stroke="#1e293d" stroke-width="1"/>
    <circle cx="205" cy="433" r="6" fill="#22c55e"/>
    <text x="222" y="438" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600">Verified Inspection Photo • Ready for Technician Assignment</text>
  </svg>`;

  fs.writeFileSync(filePath, svg);
  return `uploads/${filename}`;
};

const seedRealisticData = async () => {
  try {
    console.log('🔄 Seeding comprehensive Indian sample dataset with rich diagnostic cards...');

    // Generate rich diagnostic inspection cards
    const voltasAcPhoto = createApplianceCard(
      'voltas_split_ac.svg',
      '❄️',
      'VOLTAS INDIA',
      'Voltas 1.5 Ton Inverter Split AC',
      'Model: 185V Vectra • R32 Refrigerant • Copper Condenser',
      '#3b82f6'
    );

    const daikinAcPhoto = createApplianceCard(
      'daikin_inverter_ac.svg',
      '❄️',
      'DAIKIN JAPAN',
      'Daikin 2 Ton 5-Star Inverter AC',
      'Model: FTKM71TV • Triple Display • PM 2.5 Filter',
      '#0284c7'
    );

    const panasonicAcPhoto = createApplianceCard(
      'panasonic_ac.svg',
      '❄️',
      'PANASONIC',
      'Panasonic 1 Ton Smart Split AC',
      'Model: CS-XU12YKYF • Miraie AI Enabled • Nanoe-X',
      '#6366f1'
    );

    const lgWmPhoto = createApplianceCard(
      'lg_frontload_wm.svg',
      '🧺',
      'LG ELECTRONICS',
      'LG 8kg Smart Inverter Front Load',
      'Model: FHM1408BDW • AI Direct Drive • 6 Motion DD',
      '#a855f7'
    );

    const boschWmPhoto = createApplianceCard(
      'bosch_series6_wm.svg',
      '🧺',
      'BOSCH SERIE 6',
      'Bosch 7kg Front Load Washing Machine',
      'Model: WAJ24266IN • EcoSilence Drive • Anti-Vibration',
      '#10b981'
    );

    const samsungFridgePhoto = createApplianceCard(
      'samsung_double_door.svg',
      '🧊',
      'SAMSUNG ELECTRONICS',
      'Samsung 345L Frost Free Refrigerator',
      'Model: RT37T4513S8 • Convertible 5in1 • Digital Inverter',
      '#06b6d4'
    );

    const whirlpoolFridgePhoto = createApplianceCard(
      'whirlpool_protton.svg',
      '🧊',
      'WHIRLPOOL INDIA',
      'Whirlpool 300L Triple Door Refrigerator',
      'Model: FP 343D PROTTON • 6th Sense ActiveFresh Technology',
      '#0ea5e9'
    );

    const ifbMicroPhoto = createApplianceCard(
      'ifb_convection_micro.svg',
      '🍲',
      'IFB APPLIANCES',
      'IFB 30L Convection Microwave Oven',
      'Model: 30BRC2 • Rotisserie & Multi-Stage Cooking',
      '#f59e0b'
    );

    const kentRoPhoto = createApplianceCard(
      'kent_grand_ro.svg',
      '💧',
      'KENT RO SYSTEMS',
      'Kent Grand Plus RO+UV+UF Purifier',
      'Model: Kent 11099 • TDS Controller & In-tank UV Disinfection',
      '#2563eb'
    );

    const sonyTvPhoto = createApplianceCard(
      'sony_bravia_tv.svg',
      '📺',
      'SONY BRAVIA',
      'Sony Bravia 55-inch 4K Ultra HD TV',
      'Model: KD-55X74K • 4K HDR Processor X1 • Google TV',
      '#8b5cf6'
    );

    createApplianceCard(
      'default_appliance.svg',
      '🔧',
      'SERVICEDESK MUMBAI',
      'General Appliance Inspection',
      'Verified Field Inspection Report',
      '#64748b'
    );

    // 1. Clear existing seed users to prevent duplicates
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
        issueDescription: 'Indoor unit cooling is minimal and error code E4 is flashing intermittently on the LED display.',
        photoPath: voltasAcPhoto,
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
        photoPath: boschWmPhoto,
        status: 'Completed',
        statusHistory: [
          { status: 'Assigned', changedAt: new Date(Date.now() - 3600000 * 48), changedBy: `${custKartik.name} (Customer)`, role: 'customer', note: 'Repair request raised.' },
          { status: 'In Progress', changedAt: new Date(Date.now() - 3600000 * 24), changedBy: `${techVikram.name} (Technician)`, role: 'technician', note: 'Door latch mechanism replacement in progress.' },
          { status: 'Completed', changedAt: new Date(Date.now() - 3600000 * 2), changedBy: `${techVikram.name} (Technician)`, role: 'technician', note: 'Thermal door lock replaced and full 15-minute test spin cycle completed successfully.' },
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
        photoPath: samsungFridgePhoto,
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
        photoPath: ifbMicroPhoto,
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
        photoPath: kentRoPhoto,
        status: 'Completed',
        statusHistory: [
          { status: 'Assigned', changedAt: new Date(Date.now() - 3600000 * 72), changedBy: `${custKartik.name} (Customer)`, role: 'customer', note: 'Service request raised.' },
          { status: 'In Progress', changedAt: new Date(Date.now() - 3600000 * 48), changedBy: `${techSanjay.name} (Technician)`, role: 'technician', note: 'Sediment and carbon filter replacement underway.' },
          { status: 'Completed', changedAt: new Date(Date.now() - 3600000 * 20), changedBy: `${techSanjay.name} (Technician)`, role: 'technician', note: 'RO membrane replaced, TDS calibrated to 85 ppm.' },
        ],
      },
    ]);

    console.log('✅ Comprehensive Indian sample dataset with rich diagnostic cards seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error.message);
  }
};

module.exports = seedRealisticData;
