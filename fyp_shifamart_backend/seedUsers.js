const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();
const { connectMongoose } = require('./config/mongoConnection');

const User = require('./models/User');

// ---------------------------------------------------------------------------
// Doctor generator
// ---------------------------------------------------------------------------
// For each AI-predicted specialty (see specialist_mapper.py SPECIALISTS),
// we seed 5 doctors across 5 different cities with varied fees. This gives
// the UI meaningful data for:
//   • Fee comparison (Low/High sort on DoctorsPage)
//   • Location filter (city dropdown)
//   • Side-by-side compare mode
//
// `specialization` MUST exactly match the `name` field the AI agent returns
// in `recommended_specialist.name` so that clicking the recommendation in
// AI chat deep-links to a real filter on DoctorsPage.
// ---------------------------------------------------------------------------

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'];
// Multipliers are applied to each specialty's base fee to create a realistic
// spread within a single specialty (budget → premium).
const FEE_MULTIPLIERS = [0.7, 0.85, 1.0, 1.15, 1.3];
const EXPERIENCES = [5, 9, 13, 17, 22];
const RATINGS = [4.5, 4.6, 4.7, 4.8, 4.9];
const REVIEWS = [72, 118, 164, 201, 247];
const AVAILABILITY_SLOTS = [
  'Mon-Fri 9AM-2PM',
  'Tue-Sat 10AM-4PM',
  'Mon-Sat 11AM-7PM',
  'Mon-Thu 2PM-8PM',
  'Mon, Wed, Fri 9AM-1PM',
];

const MALE_FIRST = [
  'Ahmed', 'Bilal', 'Kamran', 'Imran', 'Omar', 'Hassan', 'Tariq', 'Usman',
  'Faisal', 'Waqar', 'Shahid', 'Arif', 'Zubair', 'Nasir', 'Aamir', 'Jamal',
  'Yasir', 'Rashid', 'Hamza', 'Ali',
];
const FEMALE_FIRST = [
  'Ayesha', 'Fatima', 'Sana', 'Rabia', 'Zainab', 'Mehreen', 'Nadia', 'Faryal',
  'Asma', 'Sadia', 'Amna', 'Laila', 'Hira', 'Iqra', 'Saira', 'Tahira',
  'Bushra', 'Maryam', 'Noor', 'Hina',
];
const LAST_NAMES = [
  'Ahmed', 'Khan', 'Malik', 'Raza', 'Siddiqui', 'Qureshi', 'Hussain', 'Shah',
  'Cheema', 'Iqbal', 'Farooq', 'Aslam', 'Anwar', 'Javed', 'Mahmood', 'Rafiq',
  'Sheikh', 'Butt', 'Chaudhry', 'Abbasi',
];

// Per-specialty metadata. `hospitals` has 5 entries — one for each city
// above. `baseFee` is the median PKR rate; actual fees fan out via
// FEE_MULTIPLIERS (70% → 130%) for interesting comparison results.
const SPECIALTY_DEFS = [
  {
    name: 'General Physician',
    slug: 'gp',
    qual: 'MBBS, FCPS (Family Medicine)',
    bio: 'Primary care for fever, flu and everyday health concerns',
    baseFee: 1500,
    hospitals: [
      'Ziauddin Hospital', 'Services Hospital', 'PIMS Islamabad',
      'Holy Family Hospital', 'Allied Hospital'
    ],
  },
  {
    name: 'Pediatrician',
    slug: 'pediatrician',
    qual: 'MBBS, FCPS (Pediatrics)',
    bio: 'Child health, growth and development specialist',
    baseFee: 1800,
    hospitals: [
      'Aga Khan University Hospital', "Children's Hospital Lahore",
      'PIMS Children Hospital', 'Holy Family Children Ward', 'DHQ Hospital'
    ],
  },
  {
    name: 'Cardiologist',
    slug: 'cardiologist',
    qual: 'MBBS, FCPS (Cardiology)',
    bio: 'Heart and cardiovascular system specialist',
    baseFee: 3000,
    hospitals: [
      'Tabba Heart Institute', 'Punjab Institute of Cardiology',
      'AFIC Rawalpindi', 'Shifa International Hospital', 'Faisalabad Institute of Cardiology'
    ],
  },
  {
    name: 'Dermatologist',
    slug: 'dermatologist',
    qual: 'MBBS, FCPS (Dermatology)',
    bio: 'Skin, hair, acne and cosmetic dermatology expert',
    baseFee: 2500,
    hospitals: [
      'South City Hospital', 'Jinnah Hospital Lahore',
      'Shifa International', 'CMH Rawalpindi', 'DHQ Hospital'
    ],
  },
  {
    name: 'Gastroenterologist',
    slug: 'gastro',
    qual: 'MBBS, FCPS (Gastroenterology)',
    bio: 'Digestive disorders, IBS, acid reflux and endoscopy specialist',
    baseFee: 2800,
    hospitals: [
      'Liaquat National Hospital', 'Doctors Hospital Lahore',
      'Shifa International', 'Maroof International', 'Allied Hospital'
    ],
  },
  {
    name: 'Neurologist',
    slug: 'neurologist',
    qual: 'MBBS, FCPS (Neurology)',
    bio: 'Stroke, migraine, epilepsy and brain disorder specialist',
    baseFee: 3200,
    hospitals: [
      'Liaquat National Hospital', 'Services Institute of Medical Sciences',
      'Shifa International', 'AFIC Rawalpindi', 'Allied Hospital'
    ],
  },
  {
    name: 'Orthopedic Surgeon',
    slug: 'orthopedic',
    qual: 'MBBS, FCPS (Orthopedics)',
    bio: 'Bone, joint, fracture and sports injury specialist',
    baseFee: 2500,
    hospitals: [
      'Aga Khan University Hospital', 'National Hospital Lahore',
      'PIMS Islamabad', 'CMH Rawalpindi', 'Allied Hospital'
    ],
  },
  {
    name: 'Pulmonologist',
    slug: 'pulmonologist',
    qual: 'MBBS, FCPS (Pulmonology)',
    bio: 'Asthma, COPD, pneumonia and tuberculosis specialist',
    baseFee: 2600,
    hospitals: [
      'Indus Hospital', 'Gulab Devi Chest Hospital',
      'National Institute of Chest Diseases', 'AFIC Rawalpindi', 'Allied Hospital'
    ],
  },
  {
    name: 'Endocrinologist',
    slug: 'endocrinologist',
    qual: 'MBBS, FCPS (Endocrinology)',
    bio: 'Diabetes, thyroid and hormonal imbalance specialist',
    baseFee: 2500,
    hospitals: [
      'Baqai Institute of Diabetology', 'Services Hospital',
      'Shifa International', 'Holy Family Hospital', 'Allied Hospital'
    ],
  },
  {
    name: 'Gynecologist',
    slug: 'gynecologist',
    qual: 'MBBS, FCPS (Gynecology)',
    bio: 'Pregnancy, menstrual and reproductive health specialist',
    baseFee: 2500,
    hospitals: [
      'Aga Khan University Hospital', 'Fatima Memorial Hospital',
      'Shifa International', 'Holy Family Hospital', 'Faisalabad Medical Centre'
    ],
  },
  {
    name: 'Urologist',
    slug: 'urologist',
    qual: 'MBBS, FCPS (Urology)',
    bio: 'Kidney stones, UTI, prostate and urinary tract specialist',
    baseFee: 2600,
    hospitals: [
      'Sindh Institute of Urology', 'Shaikh Zayed Hospital',
      'PIMS Islamabad', 'AFIC Rawalpindi', 'Allied Hospital'
    ],
  },
  {
    name: 'Ophthalmologist',
    slug: 'ophthalmologist',
    qual: 'MBBS, FCPS (Ophthalmology)',
    bio: 'Cataract, glaucoma, LASIK and retinal disease specialist',
    baseFee: 2300,
    hospitals: [
      'LRBT Eye Hospital', 'Al-Shifa Trust Eye Hospital',
      'Al-Shifa Rawalpindi', 'Shifa International', 'Allied Hospital Eye Unit'
    ],
  },
  {
    name: 'ENT Specialist',
    slug: 'ent',
    qual: 'MBBS, FCPS (ENT)',
    bio: 'Sinusitis, hearing loss, tonsils and vertigo specialist',
    baseFee: 2200,
    hospitals: [
      'Liaquat National Hospital', 'Jinnah Hospital Lahore',
      'Shifa International', 'Holy Family Hospital', 'Allied Hospital'
    ],
  },
  {
    name: 'Psychiatrist',
    slug: 'psychiatrist',
    qual: 'MBBS, MRCPsych',
    bio: 'Anxiety, depression and addiction therapy specialist',
    baseFee: 2700,
    hospitals: [
      'Jinnah Postgraduate Medical Centre', 'Mayo Hospital',
      'Capital Hospital', 'Fauji Foundation Hospital', 'Allied Hospital'
    ],
  },
  {
    name: 'Hepatologist',
    slug: 'hepatologist',
    qual: 'MBBS, FCPS (Hepatology)',
    bio: 'Hepatitis, cirrhosis and liver disease specialist',
    baseFee: 3000,
    hospitals: [
      'Dow University Hospital', 'Pakistan Kidney & Liver Institute',
      'Shifa International', 'Holy Family Hospital', 'Allied Hospital'
    ],
  },
  {
    name: 'Nephrologist',
    slug: 'nephrologist',
    qual: 'MBBS, FCPS (Nephrology)',
    bio: 'Kidney disease, dialysis and transplant specialist',
    baseFee: 3000,
    hospitals: [
      'Sindh Institute of Urology & Transplantation', 'Shaikh Zayed Hospital',
      'Shifa International', 'AFIC Rawalpindi', 'Allied Hospital'
    ],
  },
  {
    name: 'Oncologist',
    slug: 'oncologist',
    qual: 'MBBS, FCPS (Medical Oncology)',
    bio: 'Cancer diagnosis, chemotherapy and radiation therapy specialist',
    baseFee: 3500,
    hospitals: [
      'Jinnah Medical Centre', 'Shaukat Khanum Cancer Hospital',
      'Nuclear Medicine Oncology & Radiotherapy Institute', 'CMH Rawalpindi',
      'Allied Cancer Hospital'
    ],
  },
  {
    name: 'Rheumatologist',
    slug: 'rheumatologist',
    qual: 'MBBS, FCPS (Rheumatology)',
    bio: 'Rheumatoid arthritis, lupus and autoimmune disease specialist',
    baseFee: 2500,
    hospitals: [
      'Dow Hospital', 'Mayo Hospital Rheumatology',
      'PIMS Islamabad', 'CMH Rawalpindi', 'Allied Hospital'
    ],
  },
  {
    name: 'Infectious Disease Specialist',
    slug: 'infectious',
    qual: 'MBBS, FCPS (Infectious Diseases)',
    bio: 'Tropical diseases, typhoid, dengue and malaria specialist',
    baseFee: 2400,
    hospitals: [
      'Indus Hospital', 'Mayo Hospital',
      'Shifa International', 'Benazir Bhutto Hospital', 'Allied Hospital'
    ],
  },
  {
    name: 'Allergist/Immunologist',
    slug: 'allergist',
    qual: 'MBBS, MSc (Clinical Immunology)',
    bio: 'Allergic rhinitis, drug reactions, food allergies and immune disorders',
    baseFee: 2200,
    hospitals: [
      'National Institute of Allergy', 'Services Hospital',
      'Allergy & Asthma Centre', 'Fauji Foundation Hospital', 'Allied Hospital'
    ],
  },
  {
    name: 'Hematologist',
    slug: 'hematologist',
    qual: 'MBBS, FCPS (Hematology)',
    bio: 'Anemia, thalassemia, leukemia and blood disorder specialist',
    baseFee: 2800,
    hospitals: [
      'National Institute of Blood Diseases', 'Children Hospital Hematology',
      'PIMS Blood Disorders Unit', 'AFIC Rawalpindi', 'Allied Hospital'
    ],
  },
];

// Preserve the long-standing demo login emails from earlier seeds so anyone
// already using doctor1@shifamart.com / doctor2@shifamart.com can keep
// logging in. These become the "first" doctor for their specialty — all
// other rows for that specialty are generated.
const LEGACY_DOCTOR_EMAILS = {
  'Pediatrician': 'doctor1@shifamart.com',
  'Orthopedic Surgeon': 'doctor2@shifamart.com',
};

// Deterministically pick a name from the pools so the seed is stable
// across runs (idempotent upserts).
const pickName = (specialtyIdx, doctorIdx) => {
  const isFemale = (specialtyIdx + doctorIdx) % 3 === 0;
  const firstPool = isFemale ? FEMALE_FIRST : MALE_FIRST;
  const first = firstPool[(specialtyIdx * 7 + doctorIdx * 3) % firstPool.length];
  const last = LAST_NAMES[(specialtyIdx * 5 + doctorIdx * 2) % LAST_NAMES.length];
  return { fullName: `Dr. ${first} ${last}`, isFemale };
};

const makeDoctor = (d) => ({
  role: 'doctor',
  password: 'Doctor@123',
  isAvailable: true,
  ...d,
  avatar: d.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(d.name)}`,
});

const generateDoctorsForSpecialty = (def, specialtyIdx) => {
  return CITIES.map((city, i) => {
    const { fullName, isFemale } = pickName(specialtyIdx, i);
    // Round fee to nearest 50 for cleaner display.
    const fee = Math.round((def.baseFee * FEE_MULTIPLIERS[i]) / 50) * 50;

    // First doctor for a specialty may reuse a legacy email so existing
    // demo logins keep working without piling up duplicate records.
    const legacyEmail = i === 0 ? LEGACY_DOCTOR_EMAILS[def.name] : null;
    const email = legacyEmail || `${def.slug}${i + 1}@shifamart.com`;

    return makeDoctor({
      name: fullName,
      email,
      gender: isFemale ? 'female' : 'male',
      age: 28 + EXPERIENCES[i],
      bloodGroup: ['O+', 'A+', 'B+', 'AB+', 'O-'][i],
      specialization: def.name,
      experience: EXPERIENCES[i],
      hospital: def.hospitals[i] || def.hospitals[0],
      city,
      qualifications: def.qual,
      bio: def.bio,
      consultationFee: fee,
      rating: RATINGS[i],
      reviews: REVIEWS[i],
      availability: AVAILABILITY_SLOTS[i],
    });
  });
};

// ---------------------------------------------------------------------------
// Seed runner
// ---------------------------------------------------------------------------
const seedUsers = async () => {
  try {
    await connectMongoose();
    console.log('✅ MongoDB Connected');

    // Clear existing users (optional - comment out if you want to keep existing users)
    // await User.deleteMany({});

    const generatedDoctors = SPECIALTY_DEFS.flatMap((def, idx) =>
      generateDoctorsForSpecialty(def, idx)
    );

    const testUsers = [
      // ---------- Admin ----------
      {
        name: 'Syed Muneeb Kazmi',
        email: 'admin@shifamart.com',
        password: 'Admin@123',
        role: 'admin',
        gender: 'male',
        age: 35,
        bloodGroup: 'O+',
      },

      // ---------- Doctors ----------
      // 5 doctors per AI-predicted specialty × 21 specialties = 105 doctors
      ...generatedDoctors,

      // ---------- Patients ----------
      {
        name: 'Muhammad Bilal',
        email: 'patient1@shifamart.com',
        password: 'Patient@123',
        role: 'patient',
        gender: 'male',
        age: 28,
        bloodGroup: 'O+',
      },
      {
        name: 'Fatima Malik',
        email: 'patient2@shifamart.com',
        password: 'Patient@123',
        role: 'patient',
        gender: 'female',
        age: 26,
        bloodGroup: 'AB+',
      },

      // ---------- Pharmacies ----------
      {
        name: 'Nida Pharmacist',
        email: 'pharmacy1@shifamart.com',
        password: 'Pharmacy@123',
        role: 'pharmacy',
        gender: 'female',
        age: 30,
        bloodGroup: 'B+',
      },
      {
        name: 'Rizwan Malik',
        email: 'pharmacy2@shifamart.com',
        password: 'Pharmacy@123',
        role: 'pharmacy',
        gender: 'male',
        age: 40,
        bloodGroup: 'A+',
      },
    ];

    // Hash passwords and create/update users
    let createdCount = 0;
    let updatedCount = 0;
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        // Always overwrite the password with a fresh hash so the documented
        // demo credentials remain valid even if the raw value changed.
        const updateData = { ...userData };
        const hashedPassword = await bcryptjs.hash(userData.password, 10);
        updateData.password = hashedPassword;

        await User.findOneAndUpdate(
          { email: userData.email },
          updateData,
          { new: true }
        );
        updatedCount++;
      } else {
        const hashedPassword = await bcryptjs.hash(userData.password, 10);
        await User.create({
          ...userData,
          password: hashedPassword,
        });
        createdCount++;
      }
    }

    // Summary (per specialty) — easier than logging every doctor
    console.log('\n📊 Doctor seed summary:');
    for (const def of SPECIALTY_DEFS) {
      const count = await User.countDocuments({
        role: 'doctor',
        specialization: def.name,
      });
      console.log(`   ${count.toString().padStart(3)} × ${def.name}`);
    }

    console.log('\n✨ Seed completed successfully!');
    console.log(`   Created: ${createdCount}   Updated: ${updatedCount}`);
    console.log(`   Doctor logins: <slug><1-5>@shifamart.com  (password: Doctor@123)`);
    console.log(`   e.g. cardiologist1@shifamart.com, dermatologist3@shifamart.com ...`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
