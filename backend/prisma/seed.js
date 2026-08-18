const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('Clearing database tables...');
  
  await prisma.auditLog.deleteMany({});
  await prisma.userProgress.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.testAttempt.deleteMany({});
  await prisma.mockTestQuestion.deleteMany({});
  await prisma.mockTest.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.topic.deleteMany({});
  await prisma.chapter.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.subscriptionPlan.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.currentAffairs.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding Subscription Plans...');
  const plan = await prisma.subscriptionPlan.create({
    data: {
      name: '3 Months Pro Master',
      price: 1299.00,
      durationDays: 90,
      description: 'Complete syllabus access, PDF downloads, and weak subject performance analytics.'
    }
  });

  console.log('Seeding Users...');
  const now = new Date();
  const trialEndExpired = new Date();
  trialEndExpired.setDate(now.getDate() - 3);

  const premiumStudent = await prisma.user.create({
    data: {
      name: 'Alex',
      email: 'alex@examprep.com',
      phone: '7777777777',
      password: hashPassword('alex123'),
      role: 'STUDENT',
      referralCode: 'ALEXPREP',
      trialEndDate: trialEndExpired,
      xpPoints: 1200,
      streakCount: 12,
      coins: 350,
      lastActiveDate: now
    }
  });

  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@examprep.com',
      phone: '9999999999',
      password: hashPassword('admin123'),
      role: 'ADMIN',
      referralCode: 'ADMINPREP',
      trialEndDate: trialEndExpired,
      xpPoints: 0,
      streakCount: 0,
      coins: 0,
      lastActiveDate: now
    }
  });

  await prisma.subscription.create({
    data: {
      userId: premiumStudent.id,
      planId: plan.id,
      startDate: now,
      endDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE'
    }
  });

  console.log('Seeding Exams (JEE Mains, NEET, 1st PUC, 2nd PUC)...');
  const jee = await prisma.exam.create({ data: { name: 'JEE Mains', description: 'Joint Entrance Examination for Engineering Admissions.', icon: 'Award' } });
  const neet = await prisma.exam.create({ data: { name: 'NEET', description: 'National Eligibility cum Entrance Test for Medical Admissions.', icon: 'Activity' } });
  const puc1 = await prisma.exam.create({ data: { name: '1st PUC', description: 'Karnataka State Pre-University Board Class 11 curriculum.', icon: 'BookOpen' } });
  const puc2 = await prisma.exam.create({ data: { name: '2nd PUC', description: 'Karnataka State Pre-University Board Class 12 board preparation.', icon: 'Briefcase' } });

  // ==================== SEEDING DYNAMIC CHAPTER HELPER ====================
  const seedChapters = async (chaptersList, subjectId, subjectName) => {
    const subjectLower = subjectName.toLowerCase();
    for (const chName of chaptersList) {
      let videoId = 'dQw4w9WgXcQ';
      if (subjectLower.includes('math')) {
        videoId = 'vFvM22t0f7M';
      } else if (subjectLower.includes('phys')) {
        videoId = '831L1zHLOZc';
      } else if (subjectLower.includes('chem')) {
        videoId = '3h3-vR4N43k';
      } else if (subjectLower.includes('bio')) {
        videoId = '39c9Vb7B99Y';
      } else if (subjectLower.includes('comput') || subjectLower.includes('elec')) {
        videoId = 'yAqHzElhK9E';
      }

      const chapter = await prisma.chapter.create({
        data: {
          name: chName,
          description: `Study materials, One-Shot sessions, notes and practice test modules for ${chName}.`,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
          videoDuration: '1h 45m',
          subjectId
        }
      });

      // Add default topic
      const topic = await prisma.topic.create({
        data: {
          name: 'Core Concepts and Formulas',
          description: `Formulas derivation and notes for ${chName}.`,
          chapterId: chapter.id
        }
      });

      // Add Revision Note
      let formulasText = `### Core Formulas for ${chName}\n\n`;
      if (subjectLower.includes('math')) {
        formulasText += `1. **General Expression**: Given a state $S$, the solution space satisfies standard conditions.\n2. **Theorem**: For all values $x \\in \\mathbb{R}$, we evaluate constraints using derivatives.\n3. **Summation**: $\\sum_{i=1}^n x_i = \\frac{n(n+1)}{2}$.`;
      } else if (subjectLower.includes('phys')) {
        formulasText += `1. **Ohm's Law**: $V = I \\cdot R$\n2. **Kinematics**: $v^2 = u^2 + 2as$\n3. **Force**: $F = m \\cdot a$.`;
      } else if (subjectLower.includes('chem')) {
        formulasText += `1. **Ideal Gas Equation**: $P \\cdot V = n \\cdot R \\cdot T$\n2. **Bohr Orbit Radius**: $r_n = 0.529 \\cdot \\frac{n^2}{Z} Å$\n3. **Molarity**: $M = \\frac{\\text{moles of solute}}{\\text{litres of solution}}$.`;
      } else {
        formulasText += `1. **Definition**: Review the primary structure and cellular characteristics.\n2. **Overview**: Understand logical flows, structural inputs, and outputs.`;
      }

      await prisma.note.create({
        data: {
          title: `${chName} Revision Notes`,
          content: `# ${chName} Revision Notes\n\nWelcome to the official revision sheet for **${chName}**.\n\n${formulasText}\n\nUse this guide to revise critical formulas before practicing MCQs.`,
          pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          isPremium: false,
          estimatedReadTime: 6,
          topicId: topic.id
        }
      });

      // Add 3 realistic questions (MCQs & PYQs)
      let questions = [];
      if (subjectLower.includes('math')) {
        questions = [
          {
            text: `For ${chName}, if we compute the values under boundary conditions, what is the value of the function $f(x)$ as $x \\to 0$?`,
            options: ['0', '1', 'Undefined', 'Cannot be determined'],
            correctOption: 1,
            explanation: `Explanation / Solution for ${chName} PYQ:\nWe evaluate the limit using L'Hopital's Rule or standard expansion. Factoring terms yields the limit value of 1.`,
            isPYQ: true,
            pyqYear: 2023
          },
          {
            text: `Consider a set of elements under ${chName}. If $n(A) = 4$ and $n(B) = 3$ and they are completely disjoint, what is the cardinality of $A \\times B$?`,
            options: ['7', '12', '1', '64'],
            correctOption: 1,
            explanation: `Explanation / Solution:\nThe cardinality of Cartesian product is n(A × B) = n(A) * n(B) = 4 * 3 = 12.`,
            isPYQ: false,
            pyqYear: null
          },
          {
            text: `In a standard JEE question for ${chName}, we evaluate the integral of $\\sin(x)\\cos(x)\\,dx$ from $0$ to $\\pi/2$. The value is:`,
            options: ['0', '1/2', '1', '-1'],
            correctOption: 1,
            explanation: `Explanation / Solution for ${chName} PYQ:\nUse the substitution u = sin(x), du = cos(x) dx. The integral becomes the integral of u from 0 to 1, which evaluates to [u^2/2] from 0 to 1 = 1/2.`,
            isPYQ: true,
            pyqYear: 2024
          }
        ];
      } else if (subjectLower.includes('phys')) {
        questions = [
          {
            text: `In ${chName}, a particle starting from rest accelerates uniformly at $2\\,\\text{m/s}^2$ for $5\\,\\text{seconds}$. What is its final velocity?`,
            options: ['5 m/s', '10 m/s', '25 m/s', '50 m/s'],
            correctOption: 1,
            explanation: `Explanation / Solution for ${chName} PYQ:\nUsing the first equation of motion:\nv = u + a * t\nv = 0 + 2 * 5 = 10 m/s.`,
            isPYQ: true,
            pyqYear: 2022
          },
          {
            text: `A constant force of $15\\,\\text{N}$ acts on a body of mass $3\\,\\text{kg}$. What is the acceleration produced in the body?`,
            options: ['45 m/s²', '5 m/s²', '18 m/s²', '0.2 m/s²'],
            correctOption: 1,
            explanation: `Explanation / Solution:\nFrom Newton's second law, F = m * a. Therefore, a = F / m = 15 / 3 = 5 m/s².`,
            isPYQ: false,
            pyqYear: null
          },
          {
            text: `Under ${chName}, a bullet of mass $10\\,\\text{g}$ moving at $100\\,\\text{m/s}$ penetrates a target and stops in $0.1\\,\\text{s}$. The average retarding force is:`,
            options: ['10 N', '5 N', '20 N', '1 N'],
            correctOption: 0,
            explanation: `Explanation / Solution for ${chName} PYQ:\nAcceleration a = (v - u)/t = (0 - 100)/0.1 = -1000 m/s².\nRetarding Force F = m * a = 0.01 kg * 1000 m/s² = 10 N.`,
            isPYQ: true,
            pyqYear: 2024
          }
        ];
      } else if (subjectLower.includes('chem')) {
        questions = [
          {
            text: `For the topic ${chName}, what is the oxidation number of Hydrogen in metal hydrides like $NaH$?`,
            options: ['+1', '-1', '0', '+2'],
            correctOption: 1,
            explanation: `Explanation / Solution for ${chName} PYQ:\nIn metal hydrides, metals are electropositive and hydrogen has a higher electronegativity, thus taking an oxidation state of -1.`,
            isPYQ: true,
            pyqYear: 2023
          },
          {
            text: `Which of the following describes the shape of water ($H_2O$) molecules under ${chName} bonding theory?`,
            options: ['Linear', 'Bent / V-shaped', 'Tetrahedral', 'Trigonal Planar'],
            correctOption: 1,
            explanation: `Explanation / Solution:\nWater has sp3 hybridization with 2 bond pairs and 2 lone pairs. The lone pair repulsion bends the structure into a V-shape.`,
            isPYQ: false,
            pyqYear: null
          },
          {
            text: `In a reaction related to ${chName}, a reactant decomposes following a first-order rate law. If the rate constant is $0.693\\,\\text{s}^{-1}$, what is the half-life of the reaction?`,
            options: ['1 second', '2 seconds', '0.5 seconds', '10 seconds'],
            correctOption: 0,
            explanation: `Explanation / Solution for ${chName} PYQ:\nFor a first-order reaction:\nt_1/2 = 0.693 / k = 0.693 / 0.693 = 1 second.`,
            isPYQ: true,
            pyqYear: 2024
          }
        ];
      } else if (subjectLower.includes('bio')) {
        questions = [
          {
            text: `Under the ${chName} topic, which organelle is known as the "powerhouse of the cell"?`,
            options: ['Ribosome', 'Lysosome', 'Mitochondria', 'Golgi apparatus'],
            correctOption: 2,
            explanation: `Explanation / Solution for ${chName} PYQ:\nMitochondria perform aerobic cellular respiration, producing ATP (the energy currency of the cell).`,
            isPYQ: true,
            pyqYear: 2023
          },
          {
            text: `What is the phenotypic ratio of a Mendelian monohybrid cross in the F2 generation for ${chName}?`,
            options: ['1:2:1', '3:1', '9:3:3:1', '1:1'],
            correctOption: 1,
            explanation: `Explanation / Solution:\nThe monohybrid F2 phenotypic ratio is 3:1 (dominant to recessive), while the genotypic ratio is 1:2:1.`,
            isPYQ: false,
            pyqYear: null
          },
          {
            text: `Which plant hormone is responsible for apical dominance under ${chName}?`,
            options: ['Gibberellin', 'Auxin', 'Cytokinin', 'Abscisic Acid'],
            correctOption: 1,
            explanation: `Explanation / Solution for ${chName} PYQ:\nAuxins produced in the shoot tip promote apical dominance, inhibiting the growth of lateral buds.`,
            isPYQ: true,
            pyqYear: 2024
          }
        ];
      } else {
        questions = [
          {
            text: `In ${chName}, which of the following logic gates output is high (1) only when both inputs are low (0)?`,
            options: ['AND', 'OR', 'NAND', 'NOR'],
            correctOption: 3,
            explanation: `Explanation / Solution for ${chName} PYQ:\nThe NOR gate outputs 1 only when A = 0 and B = 0.`,
            isPYQ: true,
            pyqYear: 2024
          },
          {
            text: `Which data structure follows the Last-In-First-Out (LIFO) model in ${chName}?`,
            options: ['Queue', 'Stack', 'Linked List', 'Tree'],
            correctOption: 1,
            explanation: `Explanation / Solution:\nA Stack operates on the LIFO principle, where elements are pushed and popped from the same end.`,
            isPYQ: false,
            pyqYear: null
          },
          {
            text: `What is the output of the logical expression A'B + AB' if both inputs A and B are set to 1?`,
            options: ['1', '0', '2', 'Undefined'],
            correctOption: 1,
            explanation: `Explanation / Solution for ${chName} PYQ:\nSubstitute A=1, B=1:\n(1' * 1) + (1 * 1') = (0 * 1) + (1 * 0) = 0.`,
            isPYQ: true,
            pyqYear: 2023
          }
        ];
      }

      for (const q of questions) {
        await prisma.question.create({
          data: {
            text: q.text,
            options: JSON.stringify(q.options),
            correctOption: q.correctOption,
            explanation: q.explanation,
            difficulty: 'MEDIUM',
            language: 'English',
            topicId: topic.id,
            isPYQ: q.isPYQ,
            pyqYear: q.pyqYear
          }
        });
      }
    }
  };

  // ==================== 1. JEE MAINS SYLLABUS ====================
  console.log('Seeding JEE Mains subjects and chapters...');
  
  const jeeMath = await prisma.subject.create({ data: { name: 'Mathematics', description: 'JEE Calculus, Algebra', examId: jee.id } });
  const jeeMathChapters = [
    'Sets', 'Relations & Functions', 'Trigonometric Functions', 'Complex Numbers', 
    'Linear Inequalities', 'Permutations & Combinations', 'Binomial Theorem', 
    'Sequences & Series', 'Straight Lines', 'Circles', 'Conic Sections', 
    'Mathematical Induction', 'Statistics', 'Probability', 'Matrices', 'Determinants',
    'Limits', 'Continuity', 'Differentiability', 'Applications of Derivatives', 
    'Indefinite Integrals', 'Definite Integrals', 'Applications of Integrals', 
    'Differential Equations', 'Parabola', 'Ellipse', 'Hyperbola', 
    'Vector Algebra', 'Three Dimensional Geometry', 'Inverse Trigonometric Functions', 
    'Linear Programming'
  ];
  await seedChapters(jeeMathChapters, jeeMath.id, 'Mathematics');

  const jeePhys = await prisma.subject.create({ data: { name: 'Physics', description: 'JEE Mechanics, Electromagnetics', examId: jee.id } });
  const jeePhysChapters = [
    'Units & Measurements', 'Motion in a Straight Line', 'Motion in a Plane', 'Laws of Motion', 
    'Work, Energy & Power', 'System of Particles & Rotational Motion', 'Gravitation', 
    'Mechanical Properties of Solids', 'Mechanical Properties of Fluids', 'Thermal Properties of Matter', 
    'Thermodynamics', 'Kinetic Theory', 'Oscillations', 'Waves', 'Electric Charges & Fields', 
    'Electrostatic Potential & Capacitance', 'Current Electricity', 'Moving Charges & Magnetism', 
    'Magnetism & Matter', 'Electromagnetic Induction', 'Alternating Current', 'Electromagnetic Waves', 
    'Ray Optics & Optical Instruments', 'Wave Optics', 'Dual Nature of Radiation & Matter', 
    'Atoms', 'Nuclei', 'Semiconductor Electronics', 'Communication Systems'
  ];
  await seedChapters(jeePhysChapters, jeePhys.id, 'Physics');

  const jeeChem = await prisma.subject.create({ data: { name: 'Chemistry', description: 'JEE Organic, Physical Chemistry', examId: jee.id } });
  const jeeChemChapters = [
    'Some Basic Concepts of Chemistry', 'Structure of Atom', 'States of Matter', 'Chemical Thermodynamics', 
    'Chemical Equilibrium', 'Ionic Equilibrium', 'Redox Reactions', 'Hydrogen', 'Solid State', 
    'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry', 'Classification of Elements', 
    'Chemical Bonding', 's-Block Elements', 'p-Block Elements', 'd & f Block Elements', 
    'Coordination Compounds', 'Metallurgy', 'Environmental Chemistry', 'Organic Chemistry – Basic Principles', 
    'Hydrocarbons', 'Haloalkanes & Haloarenes', 'Alcohols, Phenols & Ethers', 'Aldehydes, Ketones & Carboxylic Acids', 
    'Amines', 'Biomolecules', 'Polymers', 'Chemistry in Everyday Life'
  ];
  await seedChapters(jeeChemChapters, jeeChem.id, 'Chemistry');


  // ==================== 2. NEET SYLLABUS ====================
  console.log('Seeding NEET subjects and chapters...');
  
  const neetPhys = await prisma.subject.create({ data: { name: 'Physics', description: 'NEET standard mechanics and optics', examId: neet.id } });
  await seedChapters(jeePhysChapters, neetPhys.id, 'Physics'); // Same 29 chapters

  const neetChem = await prisma.subject.create({ data: { name: 'Chemistry', description: 'NEET standard physical and organic chemistry', examId: neet.id } });
  await seedChapters(jeeChemChapters, neetChem.id, 'Chemistry'); // Same 30 chapters

  const neetBio = await prisma.subject.create({ data: { name: 'Biology', description: 'Botany and Zoology NCERT syllabus', examId: neet.id } });
  const neetBioChapters = [
    'The Living World', 'Biological Classification', 'Plant Kingdom', 'Animal Kingdom', 
    'Morphology of Flowering Plants', 'Anatomy of Flowering Plants', 'Structural Organisation in Animals', 
    'Cell: The Unit of Life', 'Biomolecules', 'Cell Cycle & Cell Division', 'Transport in Plants', 
    'Mineral Nutrition', 'Photosynthesis', 'Respiration in Plants', 'Plant Growth & Development', 
    'Reproduction in Organisms', 'Sexual Reproduction in Flowering Plants', 'Principles of Inheritance & Variation', 
    'Molecular Basis of Inheritance', 'Evolution', 'Biotechnology: Principles & Processes', 
    'Biotechnology & Its Applications', 'Organisms & Populations', 'Ecosystem', 'Biodiversity & Conservation', 
    'Environmental Issues', 'Breathing & Exchange of Gases', 'Body Fluids & Circulation', 
    'Excretory Products & Elimination', 'Locomotion & Movement', 'Neural Control & Coordination', 
    'Chemical Coordination & Integration', 'Human Reproduction', 'Reproductive Health', 
    'Human Health & Disease', 'Strategies for Enhancement in Food Production', 'Microbes in Human Welfare'
  ];
  await seedChapters(neetBioChapters, neetBio.id, 'Biology');


  // ==================== 3. 1st PUC SYLLABUS ====================
  console.log('Seeding 1st PUC subjects and chapters...');
  
  const puc1Phys = await prisma.subject.create({ data: { name: 'Physics', description: 'Class 11 Physics Board preparation', examId: puc1.id } });
  const puc1PhysChapters = [
    'Units and Measurements', 'Motion in a Straight Line', 'Motion in a Plane', 'Laws of Motion', 
    'Work, Energy, and Power', 'System of Particles and Rotational Motion', 'Gravitation', 
    'Mechanical Properties of Solids', 'Mechanical Properties of Fluids', 'Thermal Properties of Matter', 
    'Thermodynamics', 'Kinetic Theory', 'Oscillations', 'Waves'
  ];
  await seedChapters(puc1PhysChapters, puc1Phys.id, 'Physics');

  const puc1Math = await prisma.subject.create({ data: { name: 'Mathematics', description: 'Class 11 Mathematics Board preparation', examId: puc1.id } });
  const puc1MathChapters = [
    'Sets', 'Relations and Functions', 'Trigonometric Functions', 'Complex Numbers and Quadratic Equations', 
    'Linear Inequalities', 'Permutations and Combinations', 'Binomial Theorem', 'Sequences and Series', 
    'Straight Lines', 'Conic Sections', 'Introduction to Three Dimensional Geometry', 'Limits and Derivatives', 
    'Statistics', 'Probability'
  ];
  await seedChapters(puc1MathChapters, puc1Math.id, 'Mathematics');

  const puc1Chem = await prisma.subject.create({ data: { name: 'Chemistry', description: 'Class 11 Chemistry Board preparation', examId: puc1.id } });
  const puc1ChemChapters = [
    'Some Basic Concepts of Chemistry', 'Structure of Atom', 'Classification of Elements and Periodicity in Properties', 
    'Chemical Bonding and Molecular Structure', 'Chemical Thermodynamics', 'Equilibrium', 
    'Redox Reactions', 'Organic Chemistry – Some Basic Principles and Techniques', 'Hydrocarbons'
  ];
  await seedChapters(puc1ChemChapters, puc1Chem.id, 'Chemistry');

  const puc1Bio = await prisma.subject.create({ data: { name: 'Biology', description: 'Class 11 Biology Board preparation', examId: puc1.id } });
  const puc1BioChapters = [
    'The Living World', 'Biological Classification', 'Plant Kingdom', 'Animal Kingdom', 
    'Morphology of Flowering Plants', 'Anatomy of Flowering Plants', 'Structural Organisation in Animals', 
    'Cell: The Unit of Life', 'Biomolecules', 'Cell Cycle and Cell Division', 'Photosynthesis in Higher Plants', 
    'Respiration in Plants', 'Plant Growth and Development', 'Breathing and Exchange of Gases', 
    'Body Fluids and Circulation', 'Excretory Products and Their Elimination', 'Locomotion and Movement', 
    'Neural Control and Coordination', 'Chemical Coordination and Integration'
  ];
  await seedChapters(puc1BioChapters, puc1Bio.id, 'Biology');

  const puc1CS = await prisma.subject.create({ data: { name: 'Computer Science', description: 'Class 11 Python Computer Science preparation', examId: puc1.id } });
  const puc1CSChapters = [
    'Computer System', 'Encoding Schemes & Number System', 'Emerging Trends', 'Introduction to Problem Solving', 
    'Python Fundamentals', 'Flow of Control', 'Functions', 'Strings', 'Lists', 'Tuples & Dictionaries', 
    'Society, Law & Ethics'
  ];
  await seedChapters(puc1CSChapters, puc1CS.id, 'Computer Science');

  const puc1Elec = await prisma.subject.create({ data: { name: 'Electronics', description: 'Class 11 Electronics Board preparation', examId: puc1.id } });
  const puc1ElecChapters = [
    'Introduction to Electronics', 'Passive Components', 'Semiconductor Physics', 'Diodes', 'Transistors', 
    'Power Supply', 'Digital Electronics', 'Logic Gates', 'Number Systems', 'Electronic Instruments', 
    'Electronic Communication', 'Basic Electronic Circuits'
  ];
  await seedChapters(puc1ElecChapters, puc1Elec.id, 'Electronics');


  // ==================== 4. 2nd PUC SYLLABUS ====================
  console.log('Seeding 2nd PUC subjects and chapters...');
  
  const puc2Math = await prisma.subject.create({ data: { name: 'Mathematics', description: 'Class 12 Math Board preparation', examId: puc2.id } });
  const puc2MathChapters = [
    'Relations and Functions', 'Inverse Trigonometric Functions', 'Matrices', 'Determinants', 
    'Continuity and Differentiability', 'Application of Derivatives', 'Integrals', 'Application of Integrals', 
    'Differential Equations', 'Vector Algebra', 'Three Dimensional Geometry', 'Linear Programming', 'Probability'
  ];
  await seedChapters(puc2MathChapters, puc2Math.id, 'Mathematics');

  const puc2Phys = await prisma.subject.create({ data: { name: 'Physics', description: 'Class 12 Physics Board preparation', examId: puc2.id } });
  const puc2PhysChapters = [
    'Electric Charges and Fields', 'Electrostatic Potential and Capacitance', 'Current Electricity', 
    'Moving Charges and Magnetism', 'Magnetism and Matter', 'Electromagnetic Induction', 
    'Alternating Current', 'Electromagnetic Waves', 'Ray Optics and Optical Instruments', 'Wave Optics', 
    'Dual Nature of Radiation and Matter', 'Atoms', 'Nuclei', 'Semiconductor Electronics', 'Communication Systems'
  ];
  await seedChapters(puc2PhysChapters, puc2Phys.id, 'Physics');

  const puc2Chem = await prisma.subject.create({ data: { name: 'Chemistry', description: 'Class 12 Chemistry Board preparation', examId: puc2.id } });
  const puc2ChemChapters = [
    'Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry', 
    'Metallurgy', 'p-Block Elements', 'd & f Block Elements', 'Coordination Compounds', 
    'Haloalkanes & Haloarenes', 'Alcohols, Phenols & Ethers', 'Aldehydes, Ketones & Carboxylic Acids', 
    'Amines', 'Biomolecules', 'Polymers', 'Chemistry in Everyday Life'
  ];
  await seedChapters(puc2ChemChapters, puc2Chem.id, 'Chemistry');

  const puc2Bio = await prisma.subject.create({ data: { name: 'Biology', description: 'Class 12 Biology Board preparation', examId: puc2.id } });
  const puc2BioChapters = [
    'Reproduction in Organisms', 'Sexual Reproduction in Flowering Plants', 'Human Reproduction', 
    'Reproductive Health', 'Principles of Inheritance & Variation', 'Molecular Basis of Inheritance', 
    'Evolution', 'Human Health & Disease', 'Strategies for Enhancement in Food Production', 
    'Microbes in Human Welfare', 'Biotechnology: Principles & Processes', 'Biotechnology & Applications', 
    'Organisms & Populations', 'Ecosystem', 'Biodiversity & Conservation', 'Environmental Issues'
  ];
  await seedChapters(puc2BioChapters, puc2Bio.id, 'Biology');

  const puc2CS = await prisma.subject.create({ data: { name: 'Computer Science', description: 'Class 12 Python Computer Science Board preparation', examId: puc2.id } });
  const puc2CSChapters = [
    'Exception Handling in Python', 'File Handling in Python', 'Stack', 'Queue', 'Sorting', 'Searching', 
    'Understanding Data', 'Database Concepts', 'Structured Query Language (SQL)', 'Computer Networks', 
    'Data Communication', 'Security Aspects', 'Project-Based Learning'
  ];
  await seedChapters(puc2CSChapters, puc2CS.id, 'Computer Science');

  const puc2Elec = await prisma.subject.create({ data: { name: 'Electronics', description: 'Class 12 Electronics Board preparation', examId: puc2.id } });
  const puc2ElecChapters = [
    'Semiconductor Devices', 'Transistor Biasing', 'Transistor Amplifiers', 'Feedback Amplifiers', 
    'Oscillators', 'Power Supplies', 'Operational Amplifiers', 'Digital Electronics', 'Logic Gates', 
    'Combinational Logic Circuits', 'Sequential Logic Circuits', 'Communication Electronics'
  ];
  await seedChapters(puc2ElecChapters, puc2Elec.id, 'Electronics');

  console.log('Seeding sample resources for initial testing...');
  const firstMathChapter = await prisma.chapter.findFirst({
    where: { subjectId: jeeMath.id }
  });
  if (firstMathChapter) {
    const firstTopic = await prisma.topic.findFirst({
      where: { chapterId: firstMathChapter.id }
    });
    if (firstTopic) {
      await prisma.question.create({
        data: {
          text: 'Let A and B be sets. If A contains 5 elements and B contains 6 elements, what is the maximum number of elements in A ∪ B?',
          options: JSON.stringify(['5', '6', '11', '30']),
          correctOption: 2,
          explanation: 'The maximum elements in union occurs when sets are disjoint, i.e., n(A ∪ B) = n(A) + n(B) = 5 + 6 = 11.',
          difficulty: 'EASY',
          language: 'English',
          topicId: firstTopic.id,
          isPYQ: true,
          pyqYear: 2023
        }
      });
      await prisma.note.create({
        data: {
          title: 'Sets Formulas Summary Revision',
          content: `# Theory of Sets\n\n* **Union**: A ∪ B\n* **Intersection**: A ∩ B\n* **De Morgan Laws**: (A ∪ B)' = A' ∩ B'`,
          isPremium: false,
          estimatedReadTime: 4,
          topicId: firstTopic.id
        }
      });
    }
  }

  console.log('Database seeding successfully finalized!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
