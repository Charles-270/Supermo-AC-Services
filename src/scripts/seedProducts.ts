/**
 * Product Seeding Script
 * Populates Firestore with sample AC units, spare parts, and accessories
 * Based on Ghana market research (2025)
 */

import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import type { ProductFormData } from '@/types/product';

// Sample supplier IDs (replace with real supplier IDs after supplier registration)
const SAMPLE_SUPPLIERS = [
  { id: 'supplier_melcom', name: 'Melcom Ghana Ltd' },
  { id: 'supplier_electromart', name: 'Electromart Ghana' },
  { id: 'supplier_goodluck', name: 'Goodluck Africa' },
  { id: 'supplier_franko', name: 'Franko Trading' },
];

const SAMPLE_PRODUCTS: Omit<ProductFormData, 'supplierId' | 'supplierName'>[] = [
  // ===== SPLIT AC UNITS =====
  {
    name: 'Samsung 1.0HP Split Air Conditioner',
    description: 'Energy-efficient split AC unit perfect for small rooms. Features auto-restart, sleep mode, and quiet operation. Includes remote control and installation kit.',
    category: 'split-ac',
    price: 1299,
    images: [],
    specifications: {
      brand: 'Samsung',
      model: 'AR12TYHYCWK',
      capacity: '1.0HP / 9000 BTU',
      energyRating: 'A++',
      warranty: '2 years comprehensive',
      features: ['Auto Restart', 'Sleep Mode', 'Turbo Cooling', 'Anti-Corrosion'],
    },
    stockQuantity: 15,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'LG 1.5HP Dual Inverter Split AC',
    description: 'Advanced dual inverter technology for 70% energy savings. Ultra-quiet operation with Gold Fin anti-corrosion coating. Ideal for medium-sized rooms.',
    category: 'split-ac',
    price: 2150,
    images: [],
    specifications: {
      brand: 'LG',
      model: 'S4-Q12JA3QD',
      capacity: '1.5HP / 12000 BTU',
      energyRating: 'A+++',
      warranty: '2 years parts & labor, 10 years compressor',
      features: ['Dual Inverter', 'Gold Fin', 'Smart ThinQ', 'Low Noise', '4-Way Swing'],
    },
    stockQuantity: 12,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Hisense 2.0HP Split Air Conditioner',
    description: 'Powerful 2HP cooling capacity with fast cooling technology. Perfect for large living rooms or master bedrooms. Energy-efficient with R410A refrigerant.',
    category: 'split-ac',
    price: 3799,
    images: [
      'https://hisense.hgecdn.net/medias/MABAGOR-1200Wx1200H-mabagor-imagelib-full-trim-9-c-9c7af228b943987a69615ceafa53da4f-230159-5.jpg',
    ],
    specifications: {
      brand: 'Hisense',
      model: 'AS-18CR4SVETG6',
      capacity: '2.0HP / 18000 BTU',
      energyRating: 'A+',
      warranty: '1 year comprehensive',
      features: ['Turbo Mode', 'Auto Clean', 'Sleep Function', 'LED Display'],
    },
    stockQuantity: 8,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Midea 1.5HP Inverter Split AC',
    description: 'Smart inverter technology with WiFi control. Control your AC from anywhere using the mobile app. Energy-saving and eco-friendly.',
    category: 'split-ac',
    price: 2499,
    images: [
      'https://web-res.midea.com/content/dam/midea-aem/us/air-conditioners/split-system/midea-9000-btu-mini-split-ac/WechatIMG292.jpg/jcr:content/renditions/cq5dam.web.5000.5000.jpeg',
    ],
    specifications: {
      brand: 'Midea',
      model: 'MSMA-12CRDN1',
      capacity: '1.5HP / 12000 BTU',
      energyRating: 'A++',
      warranty: '2 years parts & labor',
      features: ['WiFi Control', 'Inverter Tech', 'Smart Diagnosis', 'Eco Mode'],
    },
    stockQuantity: 10,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Nasco 1.0HP Split Air Conditioner',
    description: 'Affordable and reliable cooling solution for Ghanaian homes. Features fast cooling, energy-saving mode, and durable construction.',
    category: 'split-ac',
    price: 1150,
    images: [
      'https://www.hascor.org/3331-home_default/split-air-conditioner-3-hp-brand-nasco.jpg',
    ],
    specifications: {
      brand: 'Nasco',
      model: 'NAS-09C',
      capacity: '1.0HP / 9000 BTU',
      energyRating: 'A',
      warranty: '1 year warranty',
      features: ['Fast Cooling', 'Energy Saving', 'Auto Restart', 'Remote Control'],
    },
    stockQuantity: 20,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Bruhm 2.5HP Split AC - Heavy Duty',
    description: 'Heavy-duty cooling for large spaces. Powerful compressor with anti-rust cabinet. Perfect for commercial spaces and large rooms.',
    category: 'split-ac',
    price: 4200,
    images: [
      'https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/21/8692631/1.jpg',
    ],
    specifications: {
      brand: 'Bruhm',
      model: 'BAS-24CGW',
      capacity: '2.5HP / 24000 BTU',
      energyRating: 'A',
      warranty: '1 year comprehensive',
      features: ['Heavy Duty', 'Anti-Rust', 'Turbo Mode', 'LED Display'],
    },
    stockQuantity: 5,
    stockStatus: 'low-stock',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'TCL 1.5HP Inverter Split AC',
    description: 'Modern inverter AC with titanium gold fin protection. Ultra-quiet operation and smart temperature control for optimal comfort.',
    category: 'split-ac',
    price: 2350,
    images: [
      'https://www.tcl.com/content/dam/tcl-middle-east/en/products/home-appliances/air-conditioner/tac-12csd-ki/TAC-12CSD-KI-v2.png',
    ],
    specifications: {
      brand: 'TCL',
      model: 'TAC-12CHSA/KI',
      capacity: '1.5HP / 12000 BTU',
      energyRating: 'A++',
      warranty: '2 years warranty',
      features: ['Titanium Gold Fin', 'Ultra Quiet', 'Smart Control', 'Inverter'],
    },
    stockQuantity: 7,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Gree 3.0HP Floor Standing AC',
    description: 'Premium floor-standing air conditioner for large commercial spaces. High cooling capacity with advanced air purification system.',
    category: 'split-ac',
    price: 8999,
    images: [
      'https://contentgrid.thdstatic.com/hdus/en_US/DTCCOMNEW/Articles/how-to-choose-the-right-portable-air-conditioner-section-3-step-2.jpg',
    ],
    specifications: {
      brand: 'Gree',
      model: 'GF-30CDH',
      capacity: '3.0HP / 30000 BTU',
      energyRating: 'A+',
      warranty: '2 years parts & labor, 5 years compressor',
      features: ['Floor Standing', 'Air Purification', 'Cold Plasma', 'Smart Control'],
    },
    stockQuantity: 3,
    stockStatus: 'low-stock',
    isActive: true,
    isFeatured: true,
  },

  // ===== CENTRAL AC SYSTEMS =====
  {
    name: 'LG Multi-Split 4-Zone Central AC System',
    description: 'Complete central AC solution for 4 rooms. Independent temperature control for each zone. Ideal for villas and large apartments.',
    category: 'central-ac',
    price: 15999,
    images: [
      'https://www.lg.com/eastafrica/images/multi-split-air-conditioners/md07509804/gallery/1100.jpg',
    ],
    specifications: {
      brand: 'LG',
      model: 'MU4R27',
      capacity: '4 Zones / Total 27000 BTU',
      energyRating: 'A+++',
      warranty: '3 years comprehensive',
      features: ['4-Zone Control', 'Smart Control', 'Energy Efficient', 'Quiet Operation'],
    },
    stockQuantity: 2,
    stockStatus: 'low-stock',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Daikin VRV Central AC - 5 Ton',
    description: 'Professional-grade VRV system for commercial buildings. Variable refrigerant volume technology for maximum efficiency.',
    category: 'central-ac',
    price: 45000,
    images: [
      'https://www.daikin.com/content/dam/daikin/innovation/vrv/images/img_vrv_product.jpg',
    ],
    specifications: {
      brand: 'Daikin',
      model: 'RZQ125C',
      capacity: '5 Ton / 60000 BTU',
      energyRating: 'A+++',
      warranty: '5 years comprehensive',
      features: ['VRV Technology', 'Smart Control', 'Zoning', 'Heat Recovery'],
    },
    stockQuantity: 1,
    stockStatus: 'low-stock',
    isActive: true,
    isFeatured: false,
  },

  // ===== SPARE PARTS =====
  {
    name: 'Universal AC Remote Control',
    description: 'Compatible with most AC brands. Easy setup with code search function. Backlit display for night use.',
    category: 'spare-parts',
    price: 45,
    images: [
      'https://m.media-amazon.com/images/I/51yP5aMb7nL._AC_UF894,1000_QL80_.jpg',
    ],
    specifications: {
      brand: 'Universal',
      model: 'URC-AC01',
      capacity: 'N/A',
      energyRating: 'N/A',
      warranty: '3 months warranty',
      features: ['Universal Compatibility', 'Backlit Display', 'Easy Setup', 'Low Battery Indicator'],
    },
    stockQuantity: 50,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'AC Compressor 1.5HP - Universal',
    description: 'High-quality replacement compressor for 1.5HP split AC units. Compatible with major brands. Professional installation required.',
    category: 'spare-parts',
    price: 850,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2023/9/343637308/KE/DN/NS/9543495/1-5-ton-ac-compressor-500x500.jpg',
    ],
    specifications: {
      brand: 'Universal',
      model: 'COMP-15HP',
      capacity: '1.5HP',
      energyRating: 'N/A',
      warranty: '6 months warranty',
      features: ['Universal Fit', 'R410A Compatible', 'Quiet Operation', 'Durable'],
    },
    stockQuantity: 8,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'AC Fan Motor - Indoor Unit',
    description: 'Replacement fan motor for indoor AC units. Compatible with 1.0HP to 2.0HP systems. Includes mounting hardware.',
    category: 'spare-parts',
    price: 320,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2021/4/RK/CS/WU/40593329/ac-indoor-fan-motor.jpg',
    ],
    specifications: {
      brand: 'Universal',
      model: 'FAN-IN-02',
      capacity: '1.0-2.0HP',
      energyRating: 'N/A',
      warranty: '3 months warranty',
      features: ['Quiet Operation', 'Energy Efficient', 'Easy Installation', 'Durable'],
    },
    stockQuantity: 15,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'AC Capacitor - 35uF',
    description: 'High-quality replacement capacitor for AC compressors. 35uF rating suitable for most 1.5HP units.',
    category: 'spare-parts',
    price: 55,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2022/11/QK/YD/KZ/69677925/35-uf-capacitor-500x500.jpg',
    ],
    specifications: {
      brand: 'Universal',
      model: 'CAP-35UF',
      capacity: '35uF',
      energyRating: 'N/A',
      warranty: '1 month warranty',
      features: ['High Quality', 'Long Lasting', 'Heat Resistant', 'Standard Size'],
    },
    stockQuantity: 30,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'AC Refrigerant Gas - R410A (5kg)',
    description: 'Eco-friendly R410A refrigerant gas. Professional use only. Includes safety certification and handling guide.',
    category: 'spare-parts',
    price: 650,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2023/3/291862095/VY/QU/CT/70234644/r410a-gas-500x500.jpg',
    ],
    specifications: {
      brand: 'Honeywell',
      model: 'R410A-5KG',
      capacity: '5kg',
      energyRating: 'N/A',
      warranty: 'N/A',
      features: ['Eco-Friendly', 'High Purity', 'Safety Certified', 'Professional Grade'],
    },
    stockQuantity: 12,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'AC Circuit Board - Universal PCB',
    description: 'Replacement control board for split AC units. Compatible with multiple brands. Pre-programmed and ready to install.',
    category: 'spare-parts',
    price: 450,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2022/3/SI/TO/YN/42876642/air-conditioner-pcb-board-500x500.jpg',
    ],
    specifications: {
      brand: 'Universal',
      model: 'PCB-UNI-01',
      capacity: 'N/A',
      energyRating: 'N/A',
      warranty: '3 months warranty',
      features: ['Pre-Programmed', 'Multi-Brand Compatible', 'Easy Installation', 'Quality Tested'],
    },
    stockQuantity: 6,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'AC Drain Pump - Condensate Removal',
    description: 'Automatic condensate drain pump for split AC units. Silent operation with overflow protection.',
    category: 'spare-parts',
    price: 180,
    images: [
      'https://m.media-amazon.com/images/I/71OzWl7YQAL.jpg',
    ],
    specifications: {
      brand: 'Universal',
      model: 'PUMP-DR-01',
      capacity: 'N/A',
      energyRating: 'N/A',
      warranty: '6 months warranty',
      features: ['Silent Operation', 'Auto Shutoff', 'Overflow Protection', 'Easy Install'],
    },
    stockQuantity: 10,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: false,
  },

  // ===== ACCESSORIES =====
  {
    name: 'AC Installation Kit - Complete Set',
    description: 'Everything needed for standard split AC installation. Includes copper pipes, cables, brackets, and insulation.',
    category: 'accessories',
    price: 250,
    images: [
      'https://m.media-amazon.com/images/I/81XCi8dB8HL._AC_UF894,1000_QL80_.jpg',
    ],
    specifications: {
      brand: 'Universal',
      model: 'INST-KIT-01',
      capacity: 'N/A',
      energyRating: 'N/A',
      warranty: 'N/A',
      features: ['Complete Set', '3m Copper Pipes', 'Wall Brackets', 'Insulation', 'Cables'],
    },
    stockQuantity: 25,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'AC Wall Mounting Bracket - Heavy Duty',
    description: 'Extra-strong mounting bracket for outdoor AC units. Rust-resistant coating. Supports up to 3.0HP units.',
    category: 'accessories',
    price: 85,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2022/8/GH/YS/VJ/157780823/air-conditioner-wall-mounting-bracket-500x500.jpg',
    ],
    specifications: {
      brand: 'Universal',
      model: 'BRKT-HD-01',
      capacity: 'Up to 3.0HP',
      energyRating: 'N/A',
      warranty: '1 year rust warranty',
      features: ['Heavy Duty', 'Rust Resistant', 'Easy Installation', 'Adjustable'],
    },
    stockQuantity: 40,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'AC Filter - HEPA Air Purification',
    description: 'Premium HEPA filter for improved air quality. Removes 99.97% of dust, pollen, and allergens. Universal fit.',
    category: 'accessories',
    price: 120,
    images: [
      'https://m.media-amazon.com/images/I/71RQVc3HKZL._AC_UF894,1000_QL80_.jpg',
    ],
    specifications: {
      brand: 'Universal',
      model: 'FILTER-HEPA-01',
      capacity: 'N/A',
      energyRating: 'N/A',
      warranty: 'N/A',
      features: ['HEPA Filtration', '99.97% Efficiency', 'Universal Fit', 'Washable'],
    },
    stockQuantity: 35,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'AC Cover - Outdoor Unit Protection',
    description: 'Weatherproof cover for outdoor AC units. UV-resistant material protects against sun, rain, and dust.',
    category: 'accessories',
    price: 65,
    images: [
      'https://m.media-amazon.com/images/I/81UhYmQyenL._AC_UF894,1000_QL80_.jpg',
    ],
    specifications: {
      brand: 'Universal',
      model: 'COVER-OUT-01',
      capacity: 'N/A',
      energyRating: 'N/A',
      warranty: '6 months warranty',
      features: ['Weatherproof', 'UV Resistant', 'Breathable Fabric', 'Easy Install'],
    },
    stockQuantity: 45,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'AC Stabilizer - Voltage Protector 2000W',
    description: 'Automatic voltage stabilizer protects your AC from power surges. Essential for areas with unstable electricity.',
    category: 'accessories',
    price: 280,
    images: [
      'https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/67/4178151/1.jpg',
    ],
    specifications: {
      brand: 'Sollatek',
      model: 'AVS-2000',
      capacity: '2000W',
      energyRating: 'N/A',
      warranty: '1 year warranty',
      features: ['Surge Protection', 'Auto Cutoff', 'LED Display', 'Delay Timer'],
    },
    stockQuantity: 18,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'AC Cleaning Kit - Professional Grade',
    description: 'Complete cleaning kit for AC maintenance. Includes coil cleaner, brush, spray bottle, and microfiber cloths.',
    category: 'accessories',
    price: 95,
    images: [
      'https://m.media-amazon.com/images/I/71hBQvYP7TL._AC_UF894,1000_QL80_.jpg',
    ],
    specifications: {
      brand: 'Universal',
      model: 'CLEAN-KIT-01',
      capacity: 'N/A',
      energyRating: 'N/A',
      warranty: 'N/A',
      features: ['Complete Set', 'Eco-Friendly Cleaner', 'Soft Brush', 'Microfiber Cloths'],
    },
    stockQuantity: 22,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Smart AC Controller - WiFi Enabled',
    description: 'Convert any AC to smart AC. Control via smartphone app. Works with Google Home and Alexa.',
    category: 'accessories',
    price: 350,
    images: [
      'https://m.media-amazon.com/images/I/51SQZgW7XsL._AC_UF894,1000_QL80_.jpg',
    ],
    specifications: {
      brand: 'Broadlink',
      model: 'RM4-PRO',
      capacity: 'N/A',
      energyRating: 'N/A',
      warranty: '1 year warranty',
      features: ['WiFi Control', 'Voice Assistant', 'Scheduling', 'Temperature Sensor'],
    },
    stockQuantity: 12,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'AC Copper Pipe Set - 5 Meters',
    description: 'High-quality copper pipe set for AC installations. Includes insulation. Available in various sizes.',
    category: 'accessories',
    price: 180,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2023/3/293765094/BT/PG/SP/23193870/copper-pipe-for-ac-500x500.jpg',
    ],
    specifications: {
      brand: 'Universal',
      model: 'COPPER-5M',
      capacity: '5 Meters',
      energyRating: 'N/A',
      warranty: 'N/A',
      features: ['High Purity Copper', 'Pre-Insulated', 'Durable', 'Easy to Install'],
    },
    stockQuantity: 28,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'AC Thermostat - Digital Programmable',
    description: 'Advanced digital thermostat with 7-day programming. Energy-saving mode reduces electricity bills by up to 30%.',
    category: 'accessories',
    price: 220,
    images: [
      'https://m.media-amazon.com/images/I/61r1ie4lQLL._AC_UF894,1000_QL80_.jpg',
    ],
    specifications: {
      brand: 'Honeywell',
      model: 'TH-PRO-01',
      capacity: 'N/A',
      energyRating: 'N/A',
      warranty: '2 years warranty',
      features: ['7-Day Programming', 'Touchscreen', 'Energy Saving', 'Auto Schedule'],
    },
    stockQuantity: 14,
    stockStatus: 'in-stock',
    isActive: true,
    isFeatured: false,
  },
];

/**
 * Seed products to Firestore
 */
export async function seedProducts(): Promise<void> {
  console.log('🌱 Starting product seeding...');

  const productsCollection = collection(db, 'products');
  let successCount = 0;
  let errorCount = 0;

  for (const productData of SAMPLE_PRODUCTS) {
    try {
      // Randomly assign supplier
      const supplier = SAMPLE_SUPPLIERS[Math.floor(Math.random() * SAMPLE_SUPPLIERS.length)];

      const product = {
        ...productData,
        supplierId: supplier.id,
        supplierName: supplier.name,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(productsCollection, product);
      successCount++;
      console.log(`✓ Added: ${product.name}`);
    } catch (error) {
      errorCount++;
      console.error(`✗ Failed to add product: ${productData.name}`, error);
    }
  }

  console.log(`\n✅ Seeding complete!`);
  console.log(`   Successfully added: ${successCount} products`);
  console.log(`   Failed: ${errorCount} products`);
  console.log(`   Total products in catalog: ${SAMPLE_PRODUCTS.length}`);
}

/**
 * Clear all products from Firestore (use with caution!)
 */
export async function clearProducts(): Promise<void> {
  console.warn('⚠️  This will delete ALL products from Firestore!');
  // Implementation would go here - intentionally left empty for safety
  // Only use in development with explicit confirmation
}
