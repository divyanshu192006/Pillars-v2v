/**
 * Clinically accurate fetal development data.
 * Sources: WHO Fetal Growth Charts, ACOG guidelines, BabyCenter Medical Advisory Board.
 */

export interface FetalWeekData {
  week: number;
  lengthCm: number;
  weightGrams: number;
  weightDisplay: string;
  stage: string;
  trimester: 1 | 2 | 3;
  /** 4 key developmental milestones this week */
  milestones: string[];
  /** Brain / neurological development */
  brainDevelopment: string;
  /** Movement status */
  movement: string;
  /** Hearing status */
  hearing: string;
  /** Lung development */
  lungs: string;
  /** Educational insight for the mother */
  insight: string;
  /** Which SVG file to use (mapped to trimester bands) */
  svgKey: 'w08' | 'w12' | 'w20' | 'w28' | 'w36' | 'w40';
}

const DATA: FetalWeekData[] = [
  {
    week: 4, lengthCm: 0.2, weightGrams: 0, weightDisplay: '< 1 g',
    stage: 'Implantation', trimester: 1,
    milestones: ['Embryo implants in uterine wall', 'Placenta begins forming', 'Neural tube starts developing', 'Heart cells forming'],
    brainDevelopment: 'Neural tube forming', movement: 'None detectable', hearing: 'Not yet developed', lungs: 'Not yet formed',
    insight: 'The embryo is smaller than a grain of rice, but already the foundation for all major organs is being laid. Start folic acid immediately.',
    svgKey: 'w08',
  },
  {
    week: 6, lengthCm: 0.6, weightGrams: 0, weightDisplay: '< 1 g',
    stage: 'Embryonic Period', trimester: 1,
    milestones: ['Heart begins beating (~100 bpm)', 'Brain forming rapidly', 'Arm and leg buds appear', 'Facial features starting'],
    brainDevelopment: 'Brain and spinal cord forming', movement: 'None felt yet', hearing: 'Not yet developed', lungs: 'Lung buds forming',
    insight: 'Your baby\'s heart is beating for the first time. The embryo is about the size of a lentil, and the heartbeat can sometimes be seen on ultrasound.',
    svgKey: 'w08',
  },
  {
    week: 8, lengthCm: 1.6, weightGrams: 1, weightDisplay: '~1 g',
    stage: 'Organogenesis', trimester: 1,
    milestones: ['All major organs forming', 'Fingers and toes developing', 'Eyes forming with pigment', 'Heartbeat clearly detectable'],
    brainDevelopment: 'Brain growing rapidly', movement: 'Tiny reflex movements', hearing: 'Not yet', lungs: 'Lung buds present',
    insight: 'All major organs are now forming. The embryo has graduated to "fetus" status. Morning sickness peaks around this time — small, frequent meals help.',
    svgKey: 'w08',
  },
  {
    week: 10, lengthCm: 3.1, weightGrams: 4, weightDisplay: '~4 g',
    stage: 'Fetal Period Begins', trimester: 1,
    milestones: ['Vital organs functional', 'Fingernails forming', 'Tooth buds appearing', 'Baby can swallow'],
    brainDevelopment: 'Brain divides into sections', movement: 'Spontaneous, not felt', hearing: 'Ear structure forming', lungs: 'Airways branching',
    insight: 'Your baby can now make small swallowing movements. The critical period of organ development is nearly complete, which is why avoiding toxins now is so important.',
    svgKey: 'w08',
  },
  {
    week: 12, lengthCm: 5.4, weightGrams: 14, weightDisplay: '~14 g',
    stage: 'End of First Trimester', trimester: 1,
    milestones: ['Risk of miscarriage drops significantly', 'Reflexes developing', 'Kidneys producing urine', 'Placenta fully formed'],
    brainDevelopment: 'Cerebral cortex forming', movement: 'Active but unfelt', hearing: 'Inner ear developing', lungs: 'Beginning to practice breathing',
    insight: 'You have reached the end of the first trimester — the highest-risk period is now behind you. The placenta is now fully functioning as your baby\'s lifeline.',
    svgKey: 'w12',
  },
  {
    week: 14, lengthCm: 8.7, weightGrams: 43, weightDisplay: '~43 g',
    stage: 'Second Trimester', trimester: 2,
    milestones: ['Facial muscles developing', 'Baby can grimace', 'Lanugo (fine hair) appearing', 'Gender identifiable on ultrasound'],
    brainDevelopment: 'Brain impulses firing', movement: 'Somersaulting in amniotic fluid', hearing: 'Sounds transmitted', lungs: 'Breathing fluid',
    insight: 'Many women feel energy returning as morning sickness subsides. Your baby can now make facial expressions and is very active, though you may not feel it yet.',
    svgKey: 'w12',
  },
  {
    week: 16, lengthCm: 11.6, weightGrams: 100, weightDisplay: '~100 g',
    stage: 'Second Trimester', trimester: 2,
    milestones: ['Eyes can move side to side', 'Hearing developing rapidly', 'Skeleton hardening (ossification)', 'Heartbeat audible by Doppler'],
    brainDevelopment: 'Nerve connections multiplying', movement: 'Quickening may begin', hearing: 'Can hear low-frequency sounds', lungs: 'Surfactant production starting',
    insight: 'You may begin to feel the first fluttering movements called "quickening" — often described as bubbles or butterflies. Talk and sing to your baby; they can hear you.',
    svgKey: 'w12',
  },
  {
    week: 18, lengthCm: 14.2, weightGrams: 190, weightDisplay: '~190 g',
    stage: 'Second Trimester', trimester: 2,
    milestones: ['Unique fingerprints forming', 'Myelin forming around nerves', 'Intestines developing', 'Fallopian tubes / testes in position'],
    brainDevelopment: 'Myelination beginning', movement: 'Noticeable kicks and rolls', hearing: 'Responds to mother\'s voice', lungs: 'Air sacs forming',
    insight: 'Your baby now has unique fingerprints — no other human has the same pattern. Nutrient intake is critical as rapid growth continues. Iron-rich foods are essential.',
    svgKey: 'w20',
  },
  {
    week: 20, lengthCm: 25.0, weightGrams: 300, weightDisplay: '~300 g',
    stage: 'Halfway Point', trimester: 2,
    milestones: ['Anomaly scan recommended', 'Vernix caseosa coating forming', 'Sleep-wake cycles established', 'Baby swallowing amniotic fluid'],
    brainDevelopment: 'Brain growing rapidly', movement: 'Strong kicks felt', hearing: 'Responds to external sounds', lungs: 'Practicing breathing movements',
    insight: 'You are halfway through your pregnancy. The anomaly scan at this stage is the most important ultrasound — it checks baby\'s brain, spine, heart, and organs.',
    svgKey: 'w20',
  },
  {
    week: 22, lengthCm: 27.8, weightGrams: 430, weightDisplay: '~430 g',
    stage: 'Second Trimester', trimester: 2,
    milestones: ['Eyes fully formed (lids still fused)', 'Grip reflex developing', 'Lips and eyebrows visible', 'Inner ear balance developing'],
    brainDevelopment: 'Sensory areas developing', movement: 'Regular movement patterns', hearing: 'Can hear music and voices', lungs: 'Surfactant increasing',
    insight: 'Your baby can feel touch through the amniotic fluid. Playing music and talking frequently can stimulate brain development at this critical stage.',
    svgKey: 'w20',
  },
  {
    week: 24, lengthCm: 30.0, weightGrams: 600, weightDisplay: '~600 g',
    stage: 'Viability Threshold', trimester: 2,
    milestones: ['Viable outside womb with intensive care', 'Taste buds forming on tongue', 'Brain wave activity detectable', 'Rapid weight gain begins'],
    brainDevelopment: 'Active brain wave patterns', movement: 'Strong, regular patterns', hearing: 'Startle response to loud sounds', lungs: 'Surfactant production active',
    insight: 'A critical milestone — your baby has reached the threshold of viability. If born now with intensive care, survival is possible. Screening for gestational diabetes is due this week.',
    svgKey: 'w28',
  },
  {
    week: 26, lengthCm: 35.6, weightGrams: 760, weightDisplay: '~760 g',
    stage: 'Third Trimester Approaching', trimester: 2,
    milestones: ['Eyes begin to open', 'Eyelashes present', 'Spine strengthening', 'Immune system developing'],
    brainDevelopment: 'Visual cortex developing', movement: 'Responds to light', hearing: 'Recognises mother\'s heartbeat', lungs: 'Lung branching complete',
    insight: 'Your baby can now open their eyes and respond to light. The brain is maturing rapidly. Ensure adequate calcium and vitamin D intake for bone development.',
    svgKey: 'w28',
  },
  {
    week: 28, lengthCm: 37.6, weightGrams: 1100, weightDisplay: '1.1 kg',
    stage: 'Third Trimester', trimester: 3,
    milestones: ['Eyes can blink', 'Hearing is improving rapidly', 'Brain growth accelerating', 'Sleep cycles developing'],
    brainDevelopment: 'Active — rapid growth phase', movement: 'Strong, count 10 in 2 hrs', hearing: 'Developing well', lungs: 'In progress',
    insight: 'Third trimester begins — the most critical monitoring period. Count fetal movements daily: you should feel at least 10 movements in 2 hours. Report any reduction immediately.',
    svgKey: 'w28',
  },
  {
    week: 30, lengthCm: 39.9, weightGrams: 1300, weightDisplay: '1.3 kg',
    stage: 'Third Trimester', trimester: 3,
    milestones: ['Brain developing grooves and ridges', 'Red blood cells produced by bone marrow', 'Body fat accumulating rapidly', 'Toenails fully formed'],
    brainDevelopment: 'Cortex folding forming', movement: 'Very active, strong kicks', hearing: 'Nearly complete', lungs: 'Maturing rapidly',
    insight: 'Your baby is now gaining about 200g per week. The wrinkled skin is beginning to smooth as fat deposits build up. Sleep on your left side to optimize blood flow.',
    svgKey: 'w28',
  },
  {
    week: 32, lengthCm: 42.4, weightGrams: 1700, weightDisplay: '1.7 kg',
    stage: 'Third Trimester', trimester: 3,
    milestones: ['Rapid brain development phase', 'Most babies turn head-down', 'Practice breathing movements', 'Immune antibodies transferring'],
    brainDevelopment: 'Rapid neural growth', movement: 'Strong but space reducing', hearing: 'Fully developed', lungs: 'Nearly mature',
    insight: 'Your baby is receiving maternal antibodies that will protect them for the first months after birth. Brain development is now in the fastest phase of the entire pregnancy.',
    svgKey: 'w36',
  },
  {
    week: 34, lengthCm: 45.0, weightGrams: 2100, weightDisplay: '2.1 kg',
    stage: 'Third Trimester', trimester: 3,
    milestones: ['Fingernails reach fingertips', 'Lanugo hair mostly shed', 'Fat deposits 8% of body weight', 'Central nervous system maturing'],
    brainDevelopment: 'Cortex active', movement: 'Rhythmic patterns', hearing: 'Complete', lungs: 'Surfactant levels adequate',
    insight: 'If born now, most babies do well with minimal medical support. Prepare your hospital bag and review the signs of labour with your ASHA worker.',
    svgKey: 'w36',
  },
  {
    week: 36, lengthCm: 47.4, weightGrams: 2600, weightDisplay: '2.6 kg',
    stage: 'Late Third Trimester', trimester: 3,
    milestones: ['Nearly full-term', 'Skull bones flexible for delivery', 'Immune system strengthening', 'Digestive system ready'],
    brainDevelopment: 'Mature and active', movement: 'Regular patterns felt', hearing: 'Complete', lungs: 'Mature for breathing',
    insight: 'Your baby is almost fully developed. Weekly antenatal visits are now essential. Discuss your birth plan with your doctor. Watch for signs of labour — contractions, water breaking.',
    svgKey: 'w36',
  },
  {
    week: 38, lengthCm: 49.8, weightGrams: 3000, weightDisplay: '3.0 kg',
    stage: 'Full Term', trimester: 3,
    milestones: ['Fully formed and ready for birth', 'Lungs fully mature', 'Brain still developing (continues after birth)', 'Head engaged in pelvis'],
    brainDevelopment: 'Fully functional', movement: 'Less space, but still active', hearing: 'Complete', lungs: 'Fully mature',
    insight: 'Your baby is full-term and ready for birth. Labour can begin any day now. Go to hospital immediately if you experience contractions every 5 minutes, water breaking, or reduced movement.',
    svgKey: 'w40',
  },
  {
    week: 40, lengthCm: 51.2, weightGrams: 3400, weightDisplay: '3.4 kg',
    stage: 'Due Date', trimester: 3,
    milestones: ['Complete development', 'Ready for independent life', 'All organs functional', 'Immune system active'],
    brainDevelopment: 'Fully mature', movement: 'Active, count regularly', hearing: 'Complete', lungs: 'Complete',
    insight: 'Your due date has arrived. If labour has not started, your doctor may discuss induction. Breastfeed within 1 hour of birth — colostrum provides crucial immunity.',
    svgKey: 'w40',
  },
];

/** Get the closest week data (rounds down to nearest available entry) */
export function getFetalData(week: number): FetalWeekData {
  // clamp
  const w = Math.max(4, Math.min(40, week));
  // find exact or closest lower
  let best = DATA[0];
  for (const d of DATA) {
    if (d.week <= w) best = d;
    else break;
  }
  return best;
}

/** SVG import map — trimester-keyed */
export const FETAL_SVGS: Record<string, string> = {
  w08: new URL('../assets/fetal-development/week-08.svg', import.meta.url).href,
  w12: new URL('../assets/fetal-development/week-12.svg', import.meta.url).href,
  w20: new URL('../assets/fetal-development/week-20.svg', import.meta.url).href,
  w28: new URL('../assets/fetal-development/week-28.svg', import.meta.url).href,
  w36: new URL('../assets/fetal-development/week-36.svg', import.meta.url).href,
  w40: new URL('../assets/fetal-development/week-40.svg', import.meta.url).href,
};
