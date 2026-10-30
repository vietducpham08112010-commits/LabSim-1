/**
 * SimLab Reaction Engine Module (reaction-engine.ts)
 * Centralizes all valid chemical reaction combinations (REACTION_MATRIX),
 * universal inorganic/organic reaction synthesis, and physical state outcomes
 * (pH, precipitateLevel, precipitateColor, gasEvolutionRate, temperatureC, etc.)
 * with strict isolation from Physics (PHYS) and Biology (BIO) subject engines.
 */

export enum SubjectEngineTab {
  CHEM = 'CHEM',
  PHYS = 'PHYS',
  BIO = 'BIO',
}

export enum ChemicalCategory {
  METAL = 'METAL',
  ACID = 'ACID',
  BASE = 'BASE',
  SALT = 'SALT',
  INDICATOR = 'INDICATOR',
  ORGANIC_SUGAR = 'ORGANIC_SUGAR',
  STARCH = 'STARCH',
  GENERAL = 'GENERAL',
}

export interface ChemicalSpeciesProfile {
  rawCode: string;
  formula: string;
  category: ChemicalCategory;
  metal?: string;
  cation?: string | null;
  anion?: string | null;
  isConcOxidizer?: boolean;
}

export interface ReactionRule {
  eq: string;
  color: string;
  precipitateColor?: string | null;
  precipitateLevel?: number;
  gas?: boolean;
  gasEvolutionRate?: number;
  carbonTower?: boolean;
  deltaT?: number;
  pH?: number;
  isDynamicUniversal?: boolean;
  desc: string;
}

export interface ReactionDirectoryEntry {
  key: string;
  reactants: string;
  eq: string;
  phenom: string;
  type: string;
}

export interface ChemLabSubState {
  pH: number;
  temperatureC: number;
  volumeMl: number;
  naohAddedMl: number;
  precipitateLevel: number;
  precipitateColor: string | null;
  gasEvolutionRate: number;
  sugarCarbonHeight: number;
  znPlateInserted: boolean;
  cuCoatingProgress: number;
  agNO3Added: boolean;
  benchBurnerLit: boolean;
  turbidityAlpha?: number;
  flameIon?: string;
  saltBridgeInserted?: boolean;
  cellVoltage?: number;
}

export interface LabState {
  activeTab: SubjectEngineTab | 'CHEM' | 'PHYS' | 'BIO';
  engine2D: string;
  subType: string;
  sandboxTarget?: 'beaker' | 'tissue';
  sandboxReagents: string[];
  skinDamageLevel: number;
  activeEquation?: string;
  phenomenonDesc?: string;
  chem: ChemLabSubState;
  phys?: Record<string, unknown>;
  bio?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ReactionPhysicalOutcome {
  matched: boolean;
  reactionKey: string;
  rule: ReactionRule;
  pH: number;
  temperatureC: number;
  precipitateLevel: number;
  precipitateColor: string | null;
  gasEvolutionRate: number;
  sugarCarbonHeight: number;
  znPlateInserted: boolean;
  cuCoatingProgress: number;
  agNO3Added: boolean;
  liquidColor: string;
  plumeColor: string;
  shakeIntensity: number;
  shakeDuration: number;
}

export interface ReactionVisualHooks {
  setEquationBannerHTML?: (eq: string, desc: string) => void;
  spawnPrecipitateParticles?: (color: string, count: number) => void;
  triggerScreenShake?: (intensity: number, duration: number) => void;
  triggerMolecularBondReaction?: (reactionKey: string, rule: ReactionRule) => void;
  triggerBeakerDissolve?: (liquidColor: string, plumeColor: string) => void;
  onStateUpdated?: (outcome: ReactionPhysicalOutcome) => void;
}

/**
 * Single-reagent baseline colors and default pH values when added alone to a beaker
 */
export const SINGLE_REAGENT_PROFILES: Record<string, { color: string; pH: number }> = {
  CuSO4: { color: 'rgba(2, 132, 199, 0.78)', pH: 4.8 },
  FeCl3: { color: 'rgba(180, 83, 9, 0.78)', pH: 2.4 },
  FeSO4: { color: 'rgba(74, 222, 128, 0.55)', pH: 4.5 },
  KMnO4: { color: 'rgba(168, 85, 247, 0.82)', pH: 7.0 },
  Iodine: { color: 'rgba(217, 119, 6, 0.75)', pH: 6.5 },
  Br2: { color: 'rgba(234, 88, 12, 0.72)', pH: 3.8 },
  KI: { color: 'rgba(253, 224, 71, 0.35)', pH: 7.0 },
  NaOH: { color: 'rgba(56, 189, 248, 0.32)', pH: 13.0 },
  'Ca(OH)2': { color: 'rgba(226, 232, 240, 0.42)', pH: 12.4 },
  NH3: { color: 'rgba(96, 165, 250, 0.32)', pH: 11.2 },
  Na2CO3: { color: 'rgba(56, 189, 248, 0.32)', pH: 11.0 },
  NaHCO3: { color: 'rgba(6, 182, 212, 0.30)', pH: 8.3 },
  HCl: { color: 'rgba(244, 63, 94, 0.28)', pH: 1.0 },
  H2SO4_conc: { color: 'rgba(245, 158, 11, 0.45)', pH: 0.5 },
  HNO3_conc: { color: 'rgba(250, 204, 21, 0.42)', pH: 0.8 },
  CH3COOH: { color: 'rgba(251, 113, 133, 0.30)', pH: 2.9 },
  Phenol: { color: 'rgba(236, 72, 153, 0.25)', pH: 7.0 },
  Sugar: { color: 'rgba(254, 240, 138, 0.45)', pH: 7.0 },
  Starch: { color: 'rgba(224, 242, 254, 0.40)', pH: 7.0 },
  AgNO3: { color: 'rgba(226, 232, 240, 0.35)', pH: 6.0 },
  BaCl2: { color: 'rgba(226, 232, 240, 0.35)', pH: 7.0 },
  PbNO3: { color: 'rgba(203, 213, 225, 0.38)', pH: 5.2 },
  H2O2: { color: 'rgba(186, 230, 253, 0.35)', pH: 6.2 },
  NaCl_sat: { color: 'rgba(226, 232, 240, 0.35)', pH: 7.0 },
  C6H12O6: { color: 'rgba(254, 249, 195, 0.42)', pH: 7.0 },
  CH3CHO: { color: 'rgba(224, 242, 254, 0.38)', pH: 6.8 },
  C2H5OH: { color: 'rgba(224, 242, 254, 0.32)', pH: 7.0 },
  'C3H5(OH)3': { color: 'rgba(186, 230, 253, 0.45)', pH: 7.0 },
  C6H5OH: { color: 'rgba(254, 226, 226, 0.38)', pH: 5.4 },
  C6H5NH2: { color: 'rgba(254, 243, 199, 0.42)', pH: 8.8 },
  CH3COOC2H5: { color: 'rgba(254, 249, 195, 0.38)', pH: 7.0 },
  Albumin: { color: 'rgba(254, 240, 138, 0.48)', pH: 7.2 },
  C2H4: { color: 'rgba(224, 242, 254, 0.28)', pH: 7.0 },
  C2H2: { color: 'rgba(224, 242, 254, 0.28)', pH: 7.0 },
  HCOOH: { color: 'rgba(251, 113, 133, 0.32)', pH: 2.4 },
  AgNO3_NH3: { color: 'rgba(226, 232, 240, 0.42)', pH: 10.5 },
  'Cu(OH)2': { color: 'rgba(2, 132, 199, 0.75)', pH: 9.2 },
  CaCO3: { color: 'rgba(248, 250, 252, 0.55)', pH: 8.5 },
  Na_metal: { color: 'rgba(203, 213, 225, 0.45)', pH: 12.8 },
};

/**
 * Centralized REACTION_MATRIX managing valid chemistry reaction combinations
 * and physical state parameters.
 */
export const REACTION_MATRIX: Record<string, ReactionRule> = {
  'HCl+NaOH': {
    eq: 'HCl + NaOH → NaCl + H₂O',
    color: 'rgba(224,242,254,0.45)',
    deltaT: 8,
    pH: 7.0,
    precipitateLevel: 0,
    gasEvolutionRate: 0,
    desc: 'Phản ứng trung hòa tỏa nhiệt, pH tăng dần đến điểm tương đương trung tính pH = 7.',
  },
  'AgNO3+HCl': {
    eq: 'AgNO₃ + HCl → AgCl↓(trắng) + HNO₃',
    color: '#f8fafc',
    precipitateColor: '#ffffff',
    precipitateLevel: 0.85,
    pH: 1.8,
    desc: 'Xuất hiện kết tủa trắng AgCl vón cục không tan trong axit mạnh.',
  },
  'AgNO3+NaCl_sat': {
    eq: 'AgNO₃ + NaCl → AgCl↓(trắng) + NaNO₃',
    color: '#f8fafc',
    precipitateColor: '#ffffff',
    precipitateLevel: 0.85,
    pH: 7.0,
    desc: 'Xuất hiện kết tủa trắng bạc clorua AgCl tinh khiết.',
  },
  'AgNO3+BaCl2': {
    eq: '2AgNO₃ + BaCl₂ → 2AgCl↓(trắng) + Ba(NO₃)₂',
    color: '#f8fafc',
    precipitateColor: '#ffffff',
    precipitateLevel: 0.85,
    pH: 6.8,
    desc: 'Ion Ag⁺ kết hợp với Cl⁻ tạo kết tủa trắng bạc clorua AgCl.',
  },
  'AgNO3+FeCl3': {
    eq: '3AgNO₃ + FeCl₃ → 3AgCl↓(trắng) + Fe(NO₃)₃',
    color: '#fef3c7',
    precipitateColor: '#ffffff',
    precipitateLevel: 0.88,
    pH: 3.2,
    desc: 'Xuất hiện kết tủa trắng AgCl lắng xuống trong dung dịch muối sắt(III).',
  },
  'AgNO3+KI': {
    eq: 'AgNO₃ + KI → AgI↓(vàng đậm) + KNO₃',
    color: '#fef08a',
    precipitateColor: '#eab308',
    precipitateLevel: 0.85,
    pH: 7.0,
    desc: 'Xuất hiện kết tủa màu vàng đậm của bạc iodua AgI không tan trong axit.',
  },
  'AgNO3+Br2': {
    eq: 'AgNO₃ + Br₂ + H₂O → AgBr↓(vàng nhạt) + HBrO + HNO₃',
    color: '#fef08a',
    precipitateColor: '#fde047',
    precipitateLevel: 0.82,
    pH: 2.5,
    desc: 'Nước brom tác dụng với dung dịch AgNO₃ tạo kết tủa vàng nhạt AgBr↓.',
  },
  'AgNO3+NaOH': {
    eq: '2AgNO₃ + 2NaOH → Ag₂O↓(nâu đen) + 2NaNO₃ + H₂O',
    color: '#475569',
    precipitateColor: '#334155',
    precipitateLevel: 0.85,
    pH: 11.5,
    desc: 'AgOH không bền phân hủy ngay thành kết tủa bạc(I) oxit Ag₂O màu nâu đen.',
  },
  'AgNO3+Na2CO3': {
    eq: '2AgNO₃ + Na₂CO₃ → Ag₂CO₃↓(vàng nhạt) + 2NaNO₃',
    color: '#fef9c3',
    precipitateColor: '#fef08a',
    precipitateLevel: 0.85,
    pH: 9.2,
    desc: 'Xuất hiện kết tủa bạc cacbonat Ag₂CO₃ màu vàng nhạt.',
  },
  'AgNO3+Cu_metal': {
    eq: 'Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag↓(trắng bạc)',
    color: '#0284c7',
    precipitateColor: '#e2e8f0',
    precipitateLevel: 0.80,
    pH: 5.5,
    desc: 'Đồng đẩy bạc ra khỏi muối tạo lớp tinh thể bạc sáng lấp lánh và dung dịch xanh lam.',
  },
  'KI+PbNO3': {
    eq: '2KI + Pb(NO₃)₂ → PbI₂↓(vàng óng) + 2KNO₃',
    color: '#fef08a',
    precipitateColor: '#facc15',
    precipitateLevel: 0.90,
    pH: 6.5,
    desc: 'Hiện tượng "Mưa Vàng" tuyệt đẹp: Tinh thể chì(II) iodua PbI₂ màu vàng óng lắng xuống đáy cốc.',
  },
  'HCl+PbNO3': {
    eq: 'Pb(NO₃)₂ + 2HCl → PbCl₂↓(trắng) + 2HNO₃',
    color: '#f8fafc',
    precipitateColor: '#ffffff',
    precipitateLevel: 0.85,
    pH: 1.6,
    desc: 'Xuất hiện kết tủa trắng chì(II) clorua PbCl₂ (tan được trong nước nóng).',
  },
  'NaOH+PbNO3': {
    eq: 'Pb(NO₃)₂ + 2NaOH → Pb(OH)₂↓(trắng) + 2NaNO₃',
    color: '#f8fafc',
    precipitateColor: '#ffffff',
    precipitateLevel: 0.85,
    pH: 11.8,
    desc: 'Tạo kết tủa trắng chì(II) hiđroxit Pb(OH)₂ có tính lưỡng tính.',
  },
  'H2SO4_conc+PbNO3': {
    eq: 'Pb(NO₃)₂ + H₂SO₄ → PbSO₄↓(trắng) + 2HNO₃',
    color: '#f8fafc',
    precipitateColor: '#ffffff',
    precipitateLevel: 0.88,
    pH: 1.2,
    desc: 'Tạo kết tủa trắng bền vững chì(II) sunfat PbSO₄.',
  },
  'CuSO4+NaOH': {
    eq: 'CuSO₄ + 2NaOH → Cu(OH)₂↓(xanh lam) + Na₂SO₄',
    color: '#0284c7',
    precipitateColor: '#0284c7',
    precipitateLevel: 0.85,
    pH: 11.6,
    desc: 'Xuất hiện kết tủa màu xanh lam của đồng(II) hiđroxit Cu(OH)₂.',
  },
  'Ca(OH)2+CuSO4': {
    eq: 'CuSO₄ + Ca(OH)₂ → Cu(OH)₂↓(xanh lam) + CaSO₄↓',
    color: '#0284c7',
    precipitateColor: '#38bdf8',
    precipitateLevel: 0.88,
    pH: 11.2,
    desc: 'Hỗn hợp Bordeaux: Tạo kết tủa keo xanh lam Cu(OH)₂ và CaSO₄ ít tan.',
  },
  'CuSO4+NH3': {
    eq: 'CuSO₄ + 4NH₃ → [Cu(NH₃)₄]SO₄ (Phức xanh thẫm)',
    color: '#1d4ed8',
    deltaT: 4,
    pH: 10.8,
    precipitateLevel: 0,
    desc: 'Tạo phức chất Tetraamminecopper(II) màu xanh lam thẫm đặc trưng.',
  },
  'CuSO4+Na2CO3': {
    eq: '2CuSO₄ + 2Na₂CO₃ + H₂O → Cu₂(OH)₂CO₃↓(xanh lục) + 2Na₂SO₄ + CO₂↑',
    color: '#10b981',
    precipitateColor: '#10b981',
    precipitateLevel: 0.85,
    gas: true,
    gasEvolutionRate: 1.0,
    pH: 8.6,
    desc: 'Tạo kết tủa cacbonat bazơ đồng màu xanh lục malachit kèm bọt khí CO₂.',
  },
  'FeCl3+NaOH': {
    eq: 'FeCl₃ + 3NaOH → Fe(OH)₃↓(nâu đỏ) + 3NaCl',
    color: '#b45309',
    precipitateColor: '#b45309',
    precipitateLevel: 0.85,
    pH: 11.4,
    desc: 'Xuất hiện kết tủa màu nâu đỏ của sắt(III) hiđroxit Fe(OH)₃.',
  },
  'FeCl3+NH3': {
    eq: 'FeCl₃ + 3NH₃ + 3H₂O → Fe(OH)₃↓(nâu đỏ) + 3NH₄Cl',
    color: '#b45309',
    precipitateColor: '#b45309',
    precipitateLevel: 0.85,
    pH: 9.8,
    desc: 'Dung dịch NH₃ kết tủa hoàn toàn ion Fe³⁺ dưới dạng Fe(OH)₃ nâu đỏ (không tạo phức).',
  },
  'FeCl3+KI': {
    eq: '2FeCl₃ + 2KI → 2FeCl₂ + I₂ + 2KCl',
    color: '#b45309',
    deltaT: 3,
    pH: 4.2,
    desc: 'Phản ứng oxi hóa - khử: Ion Fe³⁺ oxi hóa I⁻ thành I₂ màu nâu vàng.',
  },
  'FeCl3+Na2CO3': {
    eq: '2FeCl₃ + 3Na₂CO₃ + 3H₂O → 2Fe(OH)₃↓(nâu đỏ) + 3CO₂↑ + 6NaCl',
    color: '#b45309',
    precipitateColor: '#b45309',
    precipitateLevel: 0.85,
    gas: true,
    gasEvolutionRate: 1.0,
    pH: 7.8,
    desc: 'Thủy phân kép hoàn toàn: Vừa tạo kết tủa nâu đỏ Fe(OH)₃ vừa sủi bọt khí CO₂!',
  },
  'FeSO4+NaOH': {
    eq: 'FeSO₄ + 2NaOH → Fe(OH)₂↓(trắng xanh) + Na₂SO₄',
    color: '#86efac',
    precipitateColor: '#bbf7d0',
    precipitateLevel: 0.85,
    pH: 11.5,
    desc: 'Xuất hiện kết tủa trắng hơi xanh của sắt(II) hiđroxit Fe(OH)₂.',
  },
  'FeSO4+KMnO4': {
    eq: '10FeSO₄ + 2KMnO₄ + 8H₂SO₄ → 5Fe₂(SO₄)₃ + 2MnSO₄ + K₂SO₄ + 8H₂O',
    color: '#fde047',
    deltaT: 7,
    pH: 2.2,
    desc: 'Ion Fe²⁺ làm mất màu thuốc tím KMnO₄, chuyển dung dịch sang màu vàng nhạt của Fe³⁺.',
  },
  'BaCl2+H2SO4_conc': {
    eq: 'BaCl₂ + H₂SO₄ → BaSO₄↓(trắng) + 2HCl',
    color: '#f8fafc',
    precipitateColor: '#ffffff',
    precipitateLevel: 0.90,
    pH: 1.5,
    desc: 'Kết tủa trắng BaSO₄ bền vững không tan trong mọi axit dư.',
  },
  'BaCl2+CuSO4': {
    eq: 'BaCl₂ + CuSO₄ → BaSO₄↓(trắng) + CuCl₂',
    color: '#0284c7',
    precipitateColor: '#ffffff',
    precipitateLevel: 0.85,
    pH: 5.2,
    desc: 'Tạo kết tủa trắng BaSO₄ trong dung dịch màu xanh lơ của CuCl₂.',
  },
  'BaCl2+FeSO4': {
    eq: 'BaCl₂ + FeSO₄ → BaSO₄↓(trắng) + FeCl₂',
    color: '#bbf7d0',
    precipitateColor: '#ffffff',
    precipitateLevel: 0.85,
    pH: 5.0,
    desc: 'Xuất hiện kết tủa trắng BaSO₄ trong dung dịch FeCl₂ lục nhạt.',
  },
  'BaCl2+Na2CO3': {
    eq: 'BaCl₂ + Na₂CO₃ → BaCO₃↓(trắng) + 2NaCl',
    color: '#f8fafc',
    precipitateColor: '#ffffff',
    precipitateLevel: 0.85,
    pH: 9.5,
    desc: 'Xuất hiện kết tủa trắng bari cacbonat BaCO₃.',
  },
  'Ca(OH)2+Na2CO3': {
    eq: 'Ca(OH)₂ + Na₂CO₃ → CaCO₃↓(trắng) + 2NaOH',
    color: '#f8fafc',
    precipitateColor: '#ffffff',
    precipitateLevel: 0.85,
    pH: 12.2,
    desc: 'Tạo kết tủa trắng canxi cacbonat CaCO₃ lắng xuống đáy bình.',
  },
  'Ca(OH)2+HCl': {
    eq: 'Ca(OH)₂ + 2HCl → CaCl₂ + 2H₂O',
    color: 'rgba(224,242,254,0.45)',
    deltaT: 7,
    pH: 7.0,
    desc: 'Phản ứng trung hòa nước vôi trong bằng axit HCl tỏa nhiệt.',
  },
  'Na2CO3+HCl': {
    eq: 'Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂↑',
    color: 'rgba(224,242,254,0.55)',
    gas: true,
    gasEvolutionRate: 1.0,
    deltaT: 3,
    pH: 5.6,
    desc: 'Sủi bọt khí CO₂ không màu thoát ra mãnh liệt từ lòng dung dịch.',
  },
  'HCl+NaHCO3': {
    eq: 'NaHCO₃ + HCl → NaCl + H₂O + CO₂↑',
    color: 'rgba(224,242,254,0.55)',
    gas: true,
    gasEvolutionRate: 1.0,
    deltaT: 2,
    pH: 5.8,
    desc: 'Natri hiđrocacbonat sủi bọt khí CO₂ ngay lập tức khi gặp axit HCl.',
  },
  'CH3COOH+NaHCO3': {
    eq: 'NaHCO₃ + CH₃COOH → CH₃COONa + H₂O + CO₂↑',
    color: 'rgba(224,242,254,0.55)',
    gas: true,
    gasEvolutionRate: 1.0,
    deltaT: 2,
    pH: 6.4,
    desc: 'Phản ứng sủi bọt khí CO₂ giữa muối nở (Baking soda) và axit axetic.',
  },
  'CH3COOH+Na2CO3': {
    eq: 'Na₂CO₃ + 2CH₃COOH → 2CH₃COONa + H₂O + CO₂↑',
    color: 'rgba(224,242,254,0.55)',
    gas: true,
    gasEvolutionRate: 1.0,
    deltaT: 3,
    pH: 6.5,
    desc: 'Axit axetic đẩy axit yếu hơn ra khỏi muối cacbonat tạo bọt khí CO₂↑.',
  },
  'CH3COOH+NaOH': {
    eq: 'CH₃COOH + NaOH → CH₃COONa + H₂O',
    color: 'rgba(224,242,254,0.45)',
    deltaT: 6,
    pH: 8.7,
    desc: 'Phản ứng trung hòa axit yếu CH₃COOH bằng bazơ mạnh NaOH.',
  },
  'H2SO4_conc+Na2CO3': {
    eq: 'Na₂CO₃ + H₂SO₄ → Na₂SO₄ + H₂O + CO₂↑',
    color: 'rgba(224,242,254,0.55)',
    gas: true,
    gasEvolutionRate: 1.15,
    deltaT: 12,
    pH: 4.5,
    desc: 'Phản ứng sủi bọt khí CO₂ dữ dội kèm tỏa nhiệt.',
  },
  'Al_metal+NaOH': {
    eq: '2Al + 2NaOH + 2H₂O → 2NaAlO₂ + 3H₂↑',
    color: 'rgba(186,230,253,0.5)',
    gas: true,
    gasEvolutionRate: 1.0,
    deltaT: 14,
    pH: 12.4,
    desc: 'Lá nhôm tan dần trong dung dịch kiềm NaOH và sủi bọt khí H₂ mạnh mẽ.',
  },
  'Al_metal+HCl': {
    eq: '2Al + 6HCl → 2AlCl₃ + 3H₂↑',
    color: 'rgba(186,230,253,0.5)',
    gas: true,
    gasEvolutionRate: 1.0,
    deltaT: 12,
    pH: 2.2,
    desc: 'Lá nhôm tác dụng với axit HCl giải phóng bọt khí hiđro H₂.',
  },
  'Al_metal+CuSO4': {
    eq: '2Al + 3CuSO₄ → Al₂(SO₄)₃ + 3Cu↓(đỏ)',
    color: '#38bdf8',
    precipitateColor: '#b45309',
    precipitateLevel: 0.85,
    deltaT: 10,
    pH: 4.8,
    desc: 'Nhôm đẩy đồng ra khỏi dung dịch muối tạo kết tủa đồng đỏ bám quanh lá nhôm.',
  },
  'KMnO4+H2O2': {
    eq: '2KMnO₄ + 5H₂O₂ + 3H₂SO₄ → 2MnSO₄ + 5O₂↑ + 8H₂O',
    color: 'rgba(244,114,182,0.18)',
    gas: true,
    gasEvolutionRate: 1.1,
    deltaT: 9,
    pH: 3.5,
    desc: 'Oxy già H₂O₂ khử thuốc tím KMnO₄ làm mất màu tím và sủi bọt khí O₂ mãnh liệt.',
  },
  'HCl+KMnO4': {
    eq: '2KMnO₄ + 16HCl(đặc) → 2KCl + 2MnCl₂ + 5Cl₂↑(vàng lục) + 8H₂O',
    color: '#bef264',
    gas: true,
    gasEvolutionRate: 1.0,
    deltaT: 8,
    pH: 1.6,
    desc: 'Thuốc tím oxi hóa HCl giải phóng khí Clo (Cl₂↑) màu vàng lục mùi hắc.',
  },
  'Br2+KI': {
    eq: 'Br₂ + 2KI → 2KBr + I₂',
    color: '#92400e',
    deltaT: 3,
    pH: 6.2,
    desc: 'Brom có tính oxi hóa mạnh hơn Iod nên đẩy I₂ ra khỏi dung dịch muối KI.',
  },
  'Iodine+Starch': {
    eq: 'I₂ + Tinh bột (Amylose) → Phức chất xanh tím đậm',
    color: '#1e1b4b',
    precipitateColor: '#312e81',
    precipitateLevel: 0.82,
    pH: 6.8,
    desc: 'Phân tử I₂ chui vào vòng xoắn amylose của hồ tinh bột tạo màu xanh tím đặc trưng.',
  },
  'CuSO4+Zn_metal': {
    eq: 'Zn + CuSO₄ → ZnSO₄ + Cu↓(đỏ)',
    color: '#0284c7',
    pH: 5.4,
    desc: 'Kim loại Cu màu đỏ bám quanh thanh kẽm, màu xanh dung dịch nhạt dần.',
  },
  'CuSO4+Fe_metal': {
    eq: 'Fe + CuSO₄ → FeSO₄ + Cu↓(đỏ)',
    color: '#34d399',
    precipitateColor: '#b45309',
    precipitateLevel: 0.82,
    deltaT: 5,
    pH: 5.2,
    desc: 'Đinh sắt đẩy đồng ra khỏi dung dịch CuSO₄ tạo lớp đồng đỏ và dung dịch FeSO₄ lục nhạt.',
  },
  'CuSO4+Mg_metal': {
    eq: 'Mg + CuSO₄ → MgSO₄ + Cu↓ + H₂↑(phụ)',
    color: '#38bdf8',
    precipitateColor: '#b45309',
    precipitateLevel: 0.85,
    gas: true,
    gasEvolutionRate: 1.0,
    deltaT: 14,
    pH: 5.6,
    desc: 'Magie phản ứng rất mạnh với dung dịch CuSO₄ tạo đồng kim loại đỏ và sủi bọt khí.',
  },
  'FeCl3+Zn_metal': {
    eq: 'Zn + 2FeCl₃ → ZnCl₂ + 2FeCl₂',
    color: '#4ade80',
    deltaT: 5,
    pH: 4.0,
    desc: 'Thanh kẽm khử ion Fe³⁺ màu vàng nâu thành ion Fe²⁺ màu lục nhạt.',
  },
  'FeCl3+Fe_metal': {
    eq: 'Fe + 2FeCl₃ → 3FeCl₂',
    color: '#86efac',
    deltaT: 4,
    pH: 4.2,
    desc: 'Kim loại sắt khử muối sắt(III) vàng nâu về muối sắt(II) màu lục nhạt.',
  },
  'FeCl3+Cu_metal': {
    eq: 'Cu + 2FeCl₃ → CuCl₂ + 2FeCl₂',
    color: '#06b6d4',
    deltaT: 4,
    pH: 4.1,
    desc: 'Lá đồng tan dần trong dung dịch FeCl₃ tạo hỗn hợp muối CuCl₂ và FeCl₂ màu xanh lục.',
  },
  'HCl+Zn_metal': {
    eq: 'Zn + 2HCl → ZnCl₂ + H₂↑',
    color: '#38bdf8',
    gas: true,
    gasEvolutionRate: 1.0,
    deltaT: 6,
    pH: 2.4,
    desc: 'Kim loại kẽm tan dần và sủi bọt khí hiđro H₂ thoát ra mãnh liệt.',
  },
  'HCl+Fe_metal': {
    eq: 'Fe + 2HCl → FeCl₂ + H₂↑',
    color: '#86efac',
    gas: true,
    gasEvolutionRate: 1.0,
    deltaT: 5,
    pH: 2.6,
    desc: 'Đinh sắt tan dần trong axit HCl tạo dung dịch FeCl₂ lục nhạt và bọt khí H₂↑.',
  },
  'HCl+Mg_metal': {
    eq: 'Mg + 2HCl → MgCl₂ + H₂↑',
    color: '#e0f2fe',
    gas: true,
    gasEvolutionRate: 1.15,
    deltaT: 16,
    pH: 2.8,
    desc: 'Dải Magie tan mãnh liệt trong axit HCl, sủi bọt khí H₂ dày đặc và tỏa nhiệt mạnh.',
  },
  'HNO3_conc+Zn_metal': {
    eq: 'Zn + 4HNO₃(đặc) → Zn(NO₃)₂ + 2NO₂↑(nâu đỏ) + 2H₂O',
    color: '#b45309',
    gas: true,
    gasEvolutionRate: 1.15,
    deltaT: 22,
    pH: 1.2,
    desc: 'Kẽm phản ứng mãnh liệt với HNO₃ đặc sinh ra khí NO₂ màu nâu đỏ đặc trưng.',
  },
  'HNO3_conc+Cu_metal': {
    eq: 'Cu + 4HNO₃(đặc) → Cu(NO₃)₂ + 2NO₂↑(nâu đỏ) + 2H₂O',
    color: '#0284c7',
    gas: true,
    gasEvolutionRate: 1.15,
    deltaT: 20,
    pH: 1.4,
    desc: 'Lá đồng tan nhanh trong HNO₃ đặc tạo dung dịch xanh lam và khí NO₂ nâu đỏ.',
  },
  'HNO3_conc+Fe_metal': {
    eq: 'Fe + 6HNO₃(đặc, t°) → Fe(NO₃)₃ + 3NO₂↑(nâu đỏ) + 3H₂O',
    color: '#b45309',
    gas: true,
    gasEvolutionRate: 1.1,
    deltaT: 18,
    pH: 1.5,
    desc: 'Ở nhiệt độ cao, sắt tác dụng với HNO₃ đặc tạo muối sắt(III) và khí NO₂ nâu đỏ (thụ động hóa khi nguội).',
  },
  'H2SO4_conc+Sugar': {
    eq: 'C₁₂H₂₂O₁₁ + H₂SO₄ → 12C + 11H₂O + SO₂↑ + CO₂↑',
    color: '#0f172a',
    carbonTower: true,
    gas: true,
    gasEvolutionRate: 1.2,
    deltaT: 45,
    pH: 1.0,
    desc: 'Axit háo nước than hóa đường, cột than đen dâng trào kèm khói SO₂.',
  },
  'H2SO4_conc+Cu_metal': {
    eq: 'Cu + 2H₂SO₄(đặc, t°) → CuSO₄ + SO₂↑ + 2H₂O',
    color: '#0284c7',
    gas: true,
    gasEvolutionRate: 1.1,
    deltaT: 24,
    pH: 1.2,
    desc: 'Đồng tác dụng với H₂SO₄ đặc nóng tạo dung dịch CuSO₄ màu xanh lam và khí SO₂ mùi hắc.',
  },
  'H2SO4_conc+NaOH': {
    eq: 'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O',
    color: '#38bdf8',
    deltaT: 28,
    pH: 7.0,
    desc: 'Phản ứng trung hòa axit mạnh - bazơ mạnh tỏa nhiệt lượng rất lớn!',
  },
  'NaOH+Phenol': {
    eq: 'NaOH + Phenolphthalein → Dạng ion màu hồng cánh sen',
    color: 'rgba(236, 72, 153, 0.85)',
    pH: 12.5,
    desc: 'Chỉ thị Phenolphtalein chuyển sang màu hồng cánh sen rực rỡ trong môi trường kiềm pH > 8.2.',
  },
  'Ca(OH)2+Phenol': {
    eq: 'Ca(OH)₂ + Phenolphthalein → Dạng ion màu hồng cánh sen',
    color: 'rgba(236, 72, 153, 0.82)',
    pH: 12.2,
    desc: 'Nước vôi trong có môi trường kiềm mạnh làm Phenolphtalein hóa hồng.',
  },
  'NH3+Phenol': {
    eq: 'NH₃ + H₂O ⇌ NH₄⁺ + OH⁻ (Hóa hồng Phenolphtalein)',
    color: 'rgba(236, 72, 153, 0.75)',
    pH: 11.2,
    desc: 'Dung dịch amoniac có tính bazơ yếu làm chỉ thị Phenolphtalein chuyển màu hồng.',
  },
  'Na2CO3+Phenol': {
    eq: 'Na₂CO₃ + H₂O ⇌ NaHCO₃ + NaOH (Hóa hồng Phenolphtalein)',
    color: 'rgba(236, 72, 153, 0.75)',
    pH: 11.0,
    desc: 'Muối cacbonat thủy phân cho môi trường bazơ làm hồng chỉ thị Phenolphtalein.',
  },
  'HCl+Phenol': {
    eq: 'HCl + Phenolphthalein → Không màu',
    color: 'rgba(224, 242, 254, 0.45)',
    pH: 1.5,
    desc: 'Chỉ thị Phenolphtalein không màu trong môi trường axit.',
  },
  'H2SO4_conc+SKIN': {
    eq: 'H₂SO₄(đặc) + Mô Da → Than hóa Keratin & Protein',
    color: '#1e293b',
    precipitateColor: '#0f172a',
    pH: 0.8,
    desc: 'CẢNH BÁO NGUY HIỂM: H₂SO₄ đặc hút nước cực mạnh gây bỏng sâu và đen mô da!',
  },
  'HNO3_conc+SKIN': {
    eq: 'HNO₃(đặc) + Protein Da → Phản ứng Xanthoproteic',
    color: '#facc15',
    precipitateColor: '#eab308',
    pH: 1.0,
    desc: 'CẢNH BÁO NGUY HIỂM: Axit nitric nitro hóa các gốc thơm của protein tạo màu vàng sẫm.',
  },
  'NaOH+SKIN': {
    eq: 'NaOH(đặc) + Lipid Da → Xà phòng hóa màng tế bào',
    color: '#fda4af',
    pH: 13.5,
    desc: 'CẢNH BÁO NGUY HIỂM: Bazơ ăn mòn mô da sâu và nhớt do xà phòng hóa lipid.',
  },
  'HCl+SKIN': {
    eq: 'HCl + Mô Da → Kích ứng và viêm đỏ rát biểu bì',
    color: '#f43f5e',
    pH: 1.2,
    desc: 'Axit clohiđric gây kích ứng ăn mòn biểu bì da. Cần rửa ngay với nước cất nhiều lần!',
  },
  // === ORGANIC CHEMISTRY & ANALYTICAL REACTIONS ===
  'AgNO3_NH3+C6H12O6': {
    eq: 'C₅H₁₁O₅-CHO + 2[Ag(NH₃)₂]OH →(t°) C₅H₁₁O₅-COONH₄ + 2Ag↓(trắng bạc) + 3NH₃ + H₂O',
    color: '#e2e8f0',
    precipitateColor: '#cbd5e1',
    precipitateLevel: 0.9,
    deltaT: 12,
    pH: 9.8,
    desc: 'Phản ứng tráng gương của Glucozơ: Tạo lớp bạc kim loại Ag↓ sáng bóng bám đều lên thành bình!',
  },
  'AgNO3+C6H12O6': {
    eq: 'C₆H₁₂O₆ + 2AgNO₃ + 3NH₃ + H₂O → C₅H₁₁O₅-COONH₄ + 2Ag↓(gương bạc) + 2NH₄NO₃',
    color: '#e2e8f0',
    precipitateColor: '#cbd5e1',
    precipitateLevel: 0.88,
    deltaT: 10,
    pH: 9.5,
    desc: 'Phản ứng tráng bạc nhận biết Glucozơ: Giải phóng lớp kết tủa bạc kim loại Ag↓ sáng lấp lánh.',
  },
  'AgNO3_NH3+CH3CHO': {
    eq: 'CH₃CHO + 2[Ag(NH₃)₂]OH →(t°) CH₃COONH₄ + 2Ag↓(gương bạc) + 3NH₃ + H₂O',
    color: '#e2e8f0',
    precipitateColor: '#cbd5e1',
    precipitateLevel: 0.92,
    deltaT: 14,
    pH: 9.8,
    desc: 'Phản ứng tráng gương Anđehit axetic: Tạo lớp gương bạc Ag↓ sáng bóng đặc trưng của nhóm -CHO.',
  },
  'AgNO3+CH3CHO': {
    eq: 'CH₃CHO + 2AgNO₃ + 3NH₃ + H₂O → CH₃COONH₄ + 2Ag↓(gương bạc) + 2NH₄NO₃',
    color: '#e2e8f0',
    precipitateColor: '#cbd5e1',
    precipitateLevel: 0.9,
    deltaT: 12,
    pH: 9.5,
    desc: 'Anđehit axetic khử phức bạc tạo lớp kết tủa bạc kim loại Ag↓ tráng sáng thành ống nghiệm.',
  },
  'AgNO3_NH3+HCOOH': {
    eq: 'HCOOH + 2[Ag(NH₃)₂]OH →(t°) (NH₄)₂CO₃ + 2Ag↓(trắng bạc) + 2NH₃ + H₂O',
    color: '#e2e8f0',
    precipitateColor: '#cbd5e1',
    precipitateLevel: 0.88,
    deltaT: 12,
    pH: 9.2,
    desc: 'Axit fomic HCOOH có nhóm chức -CHO trong phân tử nên tham gia phản ứng tráng bạc tạo 2Ag↓.',
  },
  'AgNO3_NH3+C2H2': {
    eq: 'CH≡CH + 2[Ag(NH₃)₂]OH → Ag-C≡C-Ag↓(vàng nhạt) + 4NH₃ + 2H₂O',
    color: '#fef9c3',
    precipitateColor: '#fde047',
    precipitateLevel: 0.86,
    deltaT: 4,
    pH: 9.6,
    desc: 'Phản ứng thế nguyên tử H linh động ở liên kết ba đầu mạch của Axetilen tạo kết tủa bạc axetilua C₂Ag₂↓ màu vàng nhạt.',
  },
  'AgNO3+C2H2': {
    eq: 'CH≡CH + 2AgNO₃ + 2NH₃ → Ag-C≡C-Ag↓(vàng nhạt) + 2NH₄NO₃',
    color: '#fef9c3',
    precipitateColor: '#fde047',
    precipitateLevel: 0.85,
    deltaT: 4,
    pH: 9.2,
    desc: 'Axetilen tạo kết tủa vàng nhạt bạc axetilua Ag-C≡C-Ag↓ dùng để nhận biết ankin có nối ba đầu mạch.',
  },
  'C3H5(OH)3+Cu(OH)2': {
    eq: '2C₃H₅(OH)₃ + Cu(OH)₂ → [C₃H₅(OH)₂O]₂Cu (Phức xanh lam thẫm) + 2H₂O',
    color: '#1d4ed8',
    deltaT: 4,
    pH: 8.5,
    desc: 'Glixerol hòa tan kết tủa Cu(OH)₂ tạo dung dịch phức chất đồng(II) glixerat màu xanh lam thẫm trong suốt (nhận biết ancol đa chức có OH kề nhau).',
  },
  'C3H5(OH)3+CuSO4': {
    eq: '2C₃H₅(OH)₃ + Cu(OH)₂ → [C₃H₅(OH)₂O]₂Cu (Phức đồng xanh thẫm) + 2H₂O',
    color: '#1d4ed8',
    deltaT: 3,
    pH: 8.2,
    desc: 'Tạo phức chất đồng(II) glixerat màu xanh lam thẫm đặc trưng của poliol có các nhóm -OH liền kề.',
  },
  'C6H12O6+Cu(OH)2': {
    eq: '2C₆H₁₂O₆ + Cu(OH)₂ → (C₆H₁₁O₆)₂Cu (Phức xanh lam thẫm) + 2H₂O',
    color: '#1d4ed8',
    deltaT: 4,
    pH: 8.4,
    desc: 'Ở nhiệt độ thường, Glucozơ hòa tan Cu(OH)₂ tạo dung dịch phức đồng(II) glucozơ màu xanh lam thẫm (khi đun nóng tạo kết tủa đỏ gạch Cu₂O↓).',
  },
  'CH3CHO+Cu(OH)2': {
    eq: 'CH₃CHO + 2Cu(OH)₂ + NaOH →(t°) CH₃COONa + Cu₂O↓(đỏ gạch) + 3H₂O',
    color: '#ea580c',
    precipitateColor: '#dc2626',
    precipitateLevel: 0.85,
    deltaT: 16,
    pH: 9.0,
    desc: 'Đun nóng Anđehit với Cu(OH)₂ trong môi trường kiềm tạo kết tủa đồng(I) oxit Cu₂O↓ màu đỏ gạch đặc trưng.',
  },
  'Albumin+Cu(OH)2': {
    eq: 'Protein (Albumin) + Cu(OH)₂ + OH⁻ → Phức chất Biure (Màu tím đặc trưng)',
    color: '#7e22ce',
    deltaT: 3,
    pH: 10.5,
    desc: 'Phản ứng màu Biure: Các liên kết peptit (-CO-NH-) của lòng trắng trứng phản ứng với Cu(OH)₂/OH⁻ tạo phức chất màu tím đậm đặc trưng!',
  },
  'Albumin+CuSO4': {
    eq: 'Protein (Albumin) + Cu²⁺ + 2OH⁻ → Phức chất Biure (Màu tím)',
    color: '#7e22ce',
    deltaT: 3,
    pH: 10.2,
    desc: 'Phản ứng Biure nhận biết Protein (có từ 2 liên kết peptit trở lên) tạo dung dịch màu tím đặc trưng.',
  },
  'Albumin+HNO3_conc': {
    eq: 'Protein (Albumin) + HNO₃(đặc) → Hợp chất Nitro thơm↓(màu vàng)',
    color: '#facc15',
    precipitateColor: '#eab308',
    precipitateLevel: 0.88,
    deltaT: 14,
    pH: 1.5,
    desc: 'Phản ứng Xanthoproteic: Axit HNO₃ đặc nitro hóa vòng benzen trong gốc amino acid của Albumin tạo kết tủa màu vàng sẫm!',
  },
  'Br2+C6H5OH': {
    eq: 'C₆H₅OH + 3Br₂ → C₆H₂Br₃OH↓(trắng) + 3HBr',
    color: '#f8fafc',
    precipitateColor: '#ffffff',
    precipitateLevel: 0.88,
    deltaT: 6,
    pH: 2.8,
    desc: 'Nhận biết Phenol: Nước Brom mất màu nhanh và xuất hiện ngay kết tủa trắng 2,4,6-tribromphenol↓ do ảnh hưởng hoạt hóa của nhóm -OH lên vòng benzen.',
  },
  'Br2+C6H5NH2': {
    eq: 'C₆H₅NH₂ + 3Br₂ → C₆H₂Br₃NH₂↓(trắng) + 3HBr',
    color: '#f8fafc',
    precipitateColor: '#ffffff',
    precipitateLevel: 0.88,
    deltaT: 6,
    pH: 3.2,
    desc: 'Nhận biết Anilin: Dung dịch nước Brom mất màu và tạo kết tủa trắng 2,4,6-tribromanilin↓ ngay ở điều kiện thường.',
  },
  'Br2+C2H4': {
    eq: 'CH₂=CH₂ + Br₂(da cam) → Br-CH₂-CH₂-Br (Không màu)',
    color: 'rgba(224, 242, 254, 0.35)',
    deltaT: 5,
    pH: 6.5,
    desc: 'Phản ứng cộng mở vòng liên kết π của Etilen làm mất màu da cam của dung dịch nước Brom tạo 1,2-đibrometan.',
  },
  'Br2+C2H2': {
    eq: 'CH≡CH + 2Br₂(da cam) → CHBr₂-CHBr₂ (Mất màu nước Brom)',
    color: 'rgba(224, 242, 254, 0.35)',
    deltaT: 7,
    pH: 6.5,
    desc: 'Axetilen cộng hợp tối đa 2 phân tử Br₂ vào liên kết ba làm mất màu dung dịch nước Brom hoàn toàn.',
  },
  'Br2+CH3CHO': {
    eq: 'CH₃CHO + Br₂ + H₂O → CH₃COOH + 2HBr (Mất màu nước Brom)',
    color: 'rgba(224, 242, 254, 0.38)',
    deltaT: 6,
    pH: 2.4,
    desc: 'Anđehit axetic có tính khử mạnh, bị nước Brom oxi hóa thành axit axetic làm mất màu dung dịch Brom.',
  },
  'Br2+C6H12O6': {
    eq: 'C₅H₁₁O₅-CHO + Br₂ + H₂O → C₅H₁₁O₅-COOH (Axit gluconic) + 2HBr',
    color: 'rgba(224, 242, 254, 0.38)',
    deltaT: 5,
    pH: 2.8,
    desc: 'Glucozơ làm mất màu dung dịch nước Brom, chứng minh trong phân tử glucozơ có nhóm chức anđehit (-CHO).',
  },
  'C2H4+KMnO4': {
    eq: '3CH₂=CH₂ + 2KMnO₄ + 4H₂O → 3HO-CH₂-CH₂-OH (Etilen glicol) + 2MnO₂↓(nâu đen) + 2KOH',
    color: '#78350f',
    precipitateColor: '#451a03',
    precipitateLevel: 0.82,
    deltaT: 6,
    pH: 10.4,
    desc: 'Etilen làm mất màu tím của dung dịch KMnO₄ ở ngay nhiệt độ thường và tạo kết tủa nâu đen MnO₂↓.',
  },
  'C2H2+KMnO4': {
    eq: '3CH≡CH + 8KMnO₄ → 3KOOC-COOK + 8MnO₂↓(nâu đen) + 2KOH + 2H₂O',
    color: '#78350f',
    precipitateColor: '#451a03',
    precipitateLevel: 0.85,
    deltaT: 8,
    pH: 10.6,
    desc: 'Axetilen bị oxi hóa bởi thuốc tím KMnO₄ làm mất màu tím và xuất hiện kết tủa nâu đen MnO₂↓.',
  },
  'C2H5OH+Na_metal': {
    eq: '2C₂H₅OH + 2Na → 2C₂H₅ONa (Natri etylat) + H₂↑',
    color: 'rgba(224, 242, 254, 0.48)',
    gas: true,
    gasEvolutionRate: 1.05,
    deltaT: 14,
    pH: 12.2,
    desc: 'Mẩu kim loại Natri tan dần trong ancol etylic khan và sủi bọt khí H₂↑ đều đặn (thế nguyên tử H linh động của nhóm -OH).',
  },
  'C2H5OH+CH3COOH': {
    eq: 'CH₃COOH + C₂H₅OH ⇌(H₂SO₄ đặc, t°) CH₃COOC₂H₅ (Etyl axetat mùi thơm) + H₂O',
    color: 'rgba(254, 249, 195, 0.55)',
    deltaT: 15,
    pH: 4.2,
    desc: 'Phản ứng este hóa thuận nghịch tạo thành Etyl axetat (CH₃COOC₂H₅) nhẹ hơn nước nổi lên trên và có mùi thơm hoa quả đặc trưng.',
  },
  'CH3COOC2H5+NaOH': {
    eq: 'CH₃COOC₂H₅ + NaOH →(t°) CH₃COONa + C₂H₅OH',
    color: 'rgba(186, 230, 253, 0.48)',
    deltaT: 12,
    pH: 10.8,
    desc: 'Phản ứng xà phòng hóa (thủy phân este trong môi trường kiềm một chiều) tạo muối natri axetat và ancol etylic đồng nhất.',
  },
  'C6H5OH+NaOH': {
    eq: 'C₆H₅OH + NaOH → C₆H₅ONa (Natri phenolat tan trong suốt) + H₂O',
    color: 'rgba(224, 242, 254, 0.42)',
    deltaT: 5,
    pH: 11.4,
    desc: 'Phenol thể hiện tính axit yếu: Tác dụng với dung dịch NaOH tạo muối natri phenolat tan hoàn toàn trong nước.',
  },
  'C6H5NH2+HCl': {
    eq: 'C₆H₅NH₂ + HCl → C₆H₅NH₃Cl (Phenylamoni clorua tan trong nước)',
    color: 'rgba(224, 242, 254, 0.42)',
    deltaT: 6,
    pH: 3.6,
    desc: 'Anilin thể hiện tính bazơ yếu: Nhỏ HCl vào làm các giọt anilin không tan chuyển thành muối phenylamoni clorua tan hoàn toàn.',
  },
  'CaCO3+CH3COOH': {
    eq: 'CaCO₃ + 2CH₃COOH → (CH₃COO)₂Ca + CO₂↑ + H₂O',
    color: 'rgba(224, 242, 254, 0.52)',
    gas: true,
    gasEvolutionRate: 0.95,
    deltaT: 4,
    pH: 5.2,
    desc: 'Axit axetic hòa tan đá vôi CaCO₃ và sủi bọt khí CO₂↑ liên tục (chứng minh CH₃COOH mạnh hơn axit cacbonic).',
  },
  'CaCO3+HCl': {
    eq: 'CaCO₃ + 2HCl → CaCl₂ + CO₂↑ + H₂O',
    color: 'rgba(224, 242, 254, 0.55)',
    gas: true,
    gasEvolutionRate: 1.15,
    deltaT: 7,
    pH: 3.5,
    desc: 'Đá vôi CaCO₃ tan nhanh trong axit HCl giải phóng bọt khí CO₂↑ sủi mạnh.',
  },
  'CH3COOH+Mg_metal': {
    eq: 'Mg + 2CH₃COOH → (CH₃COO)₂Mg + H₂↑',
    color: 'rgba(224, 242, 254, 0.48)',
    gas: true,
    gasEvolutionRate: 0.95,
    deltaT: 10,
    pH: 4.5,
    desc: 'Dải Magie tan trong dung dịch axit axetic giải phóng bọt khí hiđro H₂↑ đều đặn.',
  },
  'CH3COOH+Zn_metal': {
    eq: 'Zn + 2CH₃COOH → (CH₃COO)₂Zn + H₂↑',
    color: 'rgba(224, 242, 254, 0.48)',
    gas: true,
    gasEvolutionRate: 0.85,
    deltaT: 5,
    pH: 4.6,
    desc: 'Thanh kẽm tác dụng với axit hữu cơ CH₃COOH sủi bọt khí H₂↑.',
  },
};

export const REACTION_DIRECTORY: ReactionDirectoryEntry[] = [
  { key: 'AgNO3_NH3+C6H12O6', reactants: 'Glucozơ + AgNO₃/NH₃', eq: 'C₅H₁₁O₅-CHO + 2[Ag(NH₃)₂]OH → C₅H₁₁O₅-COONH₄ + 2Ag↓ + 3NH₃ + H₂O', phenom: 'Phản ứng tráng gương tạo kết tủa bạc sáng bóng bám thành bình.', type: 'Hữu cơ · Tráng bạc' },
  { key: 'AgNO3_NH3+CH3CHO', reactants: 'CH₃CHO + AgNO₃/NH₃', eq: 'CH₃CHO + 2[Ag(NH₃)₂]OH → CH₃COONH₄ + 2Ag↓ + 3NH₃ + H₂O', phenom: 'Anđehit axetic tráng gương bạc Ag↓ sáng lấp lánh.', type: 'Hữu cơ · Anđehit' },
  { key: 'C3H5(OH)3+Cu(OH)2', reactants: 'Glixerol + Cu(OH)₂', eq: '2C₃H₅(OH)₃ + Cu(OH)₂ → [C₃H₅(OH)₂O]₂Cu + 2H₂O', phenom: 'Kết tủa Cu(OH)₂ tan tạo dung dịch phức đồng(II) glixerat xanh lam thẫm.', type: 'Hữu cơ · Poliol' },
  { key: 'Albumin+Cu(OH)2', reactants: 'Albumin (Protein) + Cu(OH)₂', eq: 'Protein + Cu(OH)₂ + OH⁻ → Phức chất Biure màu tím', phenom: 'Phản ứng màu Biure tạo dung dịch phức chất màu tím đặc trưng.', type: 'Hữu cơ · Protein' },
  { key: 'Albumin+HNO3_conc', reactants: 'Albumin + HNO₃(đặc)', eq: 'Protein + HNO₃(đặc) → Kết tủa Nitro màu vàng', phenom: 'Phản ứng Xanthoproteic tạo kết tủa màu vàng do nitro hóa vòng thơm.', type: 'Hữu cơ · Protein' },
  { key: 'Br2+C6H5OH', reactants: 'Phenol (C₆H₅OH) + Br₂', eq: 'C₆H₅OH + 3Br₂ → C₆H₂Br₃OH↓(trắng) + 3HBr', phenom: 'Mất màu nước brom và xuất hiện kết tủa trắng 2,4,6-tribromphenol.', type: 'Hữu cơ · Phenol' },
  { key: 'Br2+C6H5NH2', reactants: 'Anilin (C₆H₅NH₂) + Br₂', eq: 'C₆H₅NH₂ + 3Br₂ → C₆H₂Br₃NH₂↓(trắng) + 3HBr', phenom: 'Nước brom mất màu và tạo kết tủa trắng 2,4,6-tribromanilin.', type: 'Hữu cơ · Amin' },
  { key: 'AgNO3_NH3+C2H2', reactants: 'Axetilen (C₂H₂) + AgNO₃/NH₃', eq: 'CH≡CH + 2AgNO₃ + 2NH₃ → C₂Ag₂↓(vàng nhạt) + 2NH₄NO₃', phenom: 'Xuất hiện kết tủa bạc axetilua C₂Ag₂↓ màu vàng nhạt.', type: 'Hữu cơ · Ankin' },
  { key: 'Br2+C2H4', reactants: 'Etilen (C₂H₄) + Nước Brom', eq: 'CH₂=CH₂ + Br₂ → CH₂Br-CH₂Br', phenom: 'Khí Etilen làm mất màu da cam của dung dịch nước Brom.', type: 'Hữu cơ · Anken' },
  { key: 'C2H4+KMnO4', reactants: 'Etilen (C₂H₄) + KMnO₄', eq: '3C₂H₄ + 2KMnO₄ + 4H₂O → 3C₂H₄(OH)₂ + 2MnO₂↓ + 2KOH', phenom: 'Mất màu tím KMnO₄ và tạo kết tủa nâu đen MnO₂↓.', type: 'Hữu cơ · Oxi hóa' },
  { key: 'C2H5OH+Na_metal', reactants: 'Etanol (C₂H₅OH) + Natri (Na)', eq: '2C₂H₅OH + 2Na → 2C₂H₅ONa + H₂↑', phenom: 'Natri tan trong ancol etylic và sủi bọt khí H₂↑.', type: 'Hữu cơ · Ancol' },
  { key: 'C2H5OH+CH3COOH', reactants: 'CH₃COOH + C₂H₅OH', eq: 'CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O', phenom: 'Phản ứng este hóa tạo Etyl axetat có mùi thơm hoa quả.', type: 'Hữu cơ · Este hóa' },
  { key: 'CH3COOC2H5+NaOH', reactants: 'Etyl axetat + NaOH', eq: 'CH₃COOC₂H₅ + NaOH → CH₃COONa + C₂H₅OH', phenom: 'Thủy phân este trong kiềm (Xà phòng hóa) tạo dung dịch đồng nhất.', type: 'Hữu cơ · Este' },
  { key: 'CuSO4+NaOH', reactants: 'CuSO₄ + NaOH', eq: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄', phenom: 'Kết tủa màu xanh lam của Cu(OH)₂ lắng đáy cốc.', type: 'Trao đổi ion' },
  { key: 'FeCl3+NaOH', reactants: 'FeCl₃ + NaOH', eq: 'FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl', phenom: 'Kết tủa màu nâu đỏ của Fe(OH)₃ xuất hiện ngay lập tức.', type: 'Trao đổi ion' },
  { key: 'FeSO4+NaOH', reactants: 'FeSO₄ + NaOH', eq: 'FeSO₄ + 2NaOH → Fe(OH)₂↓(trắng xanh) + Na₂SO₄', phenom: 'Kết tủa trắng xanh Fe(OH)₂, hóa nâu đỏ dần trong không khí.', type: 'Trao đổi ion' },
  { key: 'KI+PbNO3', reactants: 'KI + Pb(NO₃)₂', eq: '2KI + Pb(NO₃)₂ → PbI₂↓(vàng) + 2KNO₃', phenom: 'Hiện tượng "Mưa Vàng": Kết tủa vàng óng ánh của chì(II) iodua PbI₂.', type: 'Kết tủa Mưa Vàng' },
  { key: 'Na2CO3+HCl', reactants: 'Na₂CO₃ + HCl', eq: 'Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂↑', phenom: 'Sủi bọt khí CO₂ không màu mãnh liệt trong lòng dung dịch.', type: 'Khí thoát ra' },
  { key: 'NaHCO3+CH3COOH', reactants: 'NaHCO₃ + CH₃COOH', eq: 'NaHCO₃ + CH₃COOH → CH₃COONa + H₂O + CO₂↑', phenom: 'Phản ứng sủi bọt khí CO₂ đều đặn (Baking soda + Giấm ăn).', type: 'Axit + Muối' },
  { key: 'Ca(OH)2+Na2CO3', reactants: 'Ca(OH)₂ + Na₂CO₃', eq: 'Ca(OH)₂ + Na₂CO₃ → CaCO₃↓(trắng) + 2NaOH', phenom: 'Nước vôi trong vẩn đục tạo kết tủa trắng đá vôi CaCO₃.', type: 'Trao đổi ion' },
  { key: 'CuSO4+NH3', reactants: 'CuSO₄ + NH₃ (dư)', eq: 'CuSO₄ + 4NH₃ → [Cu(NH₃)₄]SO₄ (Xanh lam thẫm)', phenom: 'Tạo kết tủa xanh nhạt rồi tan ngay tạo phức đồng-amoniac xanh thẫm.', type: 'Tạo phức chất' },
  { key: 'Al_metal+NaOH', reactants: 'Lá Nhôm (Al) + NaOH', eq: '2Al + 2NaOH + 2H₂O → 2NaAlO₂ + 3H₂↑', phenom: 'Nhôm tan nhanh trong kiềm mạnh và sủi bọt khí H₂ liên tục.', type: 'Lưỡng tính / Khử' },
  { key: 'Al_metal+HCl', reactants: 'Lá Nhôm (Al) + HCl', eq: '2Al + 6HCl → 2AlCl₃ + 3H₂↑', phenom: 'Nhôm tan trong axit clohiđric giải phóng bọt khí H₂ và tỏa nhiệt.', type: 'Kim loại + Axit' },
  { key: 'KMnO4+H2O2', reactants: 'KMnO₄ + H₂O₂', eq: '2KMnO₄ + 5H₂O₂ + 3H₂SO₄ → 2MnSO₄ + 5O₂↑ + K₂SO₄ + 8H₂O', phenom: 'Dung dịch thuốc tím mất màu nhanh chóng kèm sủi bọt khí O₂ mạnh.', type: 'Oxi hóa - Khử' },
  { key: 'FeSO4+KMnO4', reactants: 'FeSO₄ + KMnO₄', eq: '10FeSO₄ + 2KMnO₄ + 8H₂SO₄ → 5Fe₂(SO₄)₃ + 2MnSO₄ + K₂SO₄ + 8H₂O', phenom: 'Dung dịch thuốc tím KMnO₄ mất màu tím do oxi hóa Fe²⁺ lên Fe³⁺.', type: 'Oxi hóa - Khử' },
  { key: 'Iodine+Starch', reactants: 'Iodine (I₂) + Hồ Tinh Bột', eq: 'I₂ + Amylose (Tinh bột) → Phức chất màu xanh tím đậm', phenom: 'Dung dịch chuyển ngay sang màu xanh tím đặc trưng của phức chất amylose-iod.', type: 'Nhận biết Hữu cơ' },
  { key: 'AgNO3+HCl', reactants: 'AgNO₃ + HCl', eq: 'AgNO₃ + HCl → AgCl↓ + HNO₃', phenom: 'Kết tủa màu trắng vón cục của AgCl không tan trong axit.', type: 'Nhận biết Halide' },
  { key: 'AgNO3+NaCl_sat', reactants: 'AgNO₃ + NaCl', eq: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃', phenom: 'Xuất hiện kết tủa trắng tinh khiết của muối bạc clorua.', type: 'Nhận biết ion' },
  { key: 'AgNO3+KI', reactants: 'AgNO₃ + KI', eq: 'AgNO₃ + KI → AgI↓(vàng đậm) + KNO₃', phenom: 'Kết tủa màu vàng đậm của bạc iodua AgI không tan trong HNO₃.', type: 'Nhận biết Halide' },
  { key: 'AgNO3+Cu_metal', reactants: 'AgNO₃ + Lá Đồng (Cu)', eq: 'Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag↓(trắng bạc)', phenom: 'Tinh thể bạc Ag sáng lấp lánh bám lên lá đồng, dung dịch hóa xanh lam.', type: 'Nhiệt luyện / Thủy luyện' },
  { key: 'H2SO4_conc+Sugar', reactants: 'H₂SO₄(đặc) + Đường', eq: 'C₁₂H₂₂O₁₁ + H₂SO₄ → 12C + 11H₂O + SO₂↑ + CO₂↑', phenom: 'Than hóa đường, cột than đen xốp trào dâng kèm khói trắng.', type: 'Háo nước & Oxi hóa' },
  { key: 'HCl+NaOH', reactants: 'HCl + NaOH', eq: 'HCl + NaOH → NaCl + H₂O', phenom: 'Phản ứng trung hòa tỏa nhiệt, pH dung dịch tăng từ 1.0 lên 7.0.', type: 'Trung hòa Axit-Bazơ' },
  { key: 'BaCl2+H2SO4_conc', reactants: 'BaCl₂ + H₂SO₄', eq: 'BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl', phenom: 'Kết tủa trắng mịn BaSO₄ bền vững không tan trong axit dư.', type: 'Nhận biết Sunfat' },
  { key: 'BaCl2+CuSO4', reactants: 'BaCl₂ + CuSO₄', eq: 'BaCl₂ + CuSO₄ → BaSO₄↓ + CuCl₂', phenom: 'Tạo kết tủa trắng BaSO₄ trong dung dịch màu xanh lơ CuCl₂.', type: 'Trao đổi ion' },
  { key: 'BaCl2+Na2CO3', reactants: 'BaCl₂ + Na₂CO₃', eq: 'BaCl₂ + Na₂CO₃ → BaCO₃↓(trắng) + 2NaCl', phenom: 'Xuất hiện kết tủa trắng bari cacbonat BaCO₃ lắng xuống đáy.', type: 'Trao đổi ion' },
  { key: 'CuSO4+Zn_metal', reactants: 'CuSO₄ + Thanh Zn', eq: 'Zn + CuSO₄ → ZnSO₄ + Cu↓', phenom: 'Thanh kẽm phủ lớp đồng đỏ kim loại, màu xanh lam nhạt dần.', type: 'Oxi hóa - Khử' },
  { key: 'CuSO4+Fe_metal', reactants: 'CuSO₄ + Đinh Sắt (Fe)', eq: 'Fe + CuSO₄ → FeSO₄ + Cu↓(đỏ)', phenom: 'Lớp đồng đỏ bám ngoài đinh sắt, dung dịch nhạt màu xanh chuyển lục nhạt.', type: 'Kim loại đẩy muối' },
  { key: 'FeCl3+Zn_metal', reactants: 'FeCl₃ + Thanh Zn', eq: 'Zn + 2FeCl₃ → ZnCl₂ + 2FeCl₂', phenom: 'Thanh kẽm khử Fe³⁺ (vàng nâu) về Fe²⁺ (lục nhạt).', type: 'Oxi hóa - Khử' },
  { key: 'FeCl3+KI', reactants: 'FeCl₃ + KI', eq: '2FeCl₃ + 2KI → 2FeCl₂ + I₂ + 2KCl', phenom: 'Ion Fe³⁺ oxi hóa I⁻ tạo dung dịch màu nâu vàng của I₂ tự do.', type: 'Oxi hóa - Khử' },
  { key: 'HCl+Zn_metal', reactants: 'HCl + Thanh Zn', eq: 'Zn + 2HCl → ZnCl₂ + H₂↑', phenom: 'Thanh kẽm tan dần và sủi bọt khí hiđro mãnh liệt.', type: 'Kim loại + Axit' },
  { key: 'HCl+Mg_metal', reactants: 'HCl + Dải Magie (Mg)', eq: 'Mg + 2HCl → MgCl₂ + H₂↑', phenom: 'Dải Mg tan cực nhanh trong axit kèm sủi bọt khí H₂ và tỏa nhiệt mạnh.', type: 'Kim loại + Axit' },
  { key: 'HNO3_conc+Zn_metal', reactants: 'HNO₃(đặc) + Thanh Zn', eq: 'Zn + 4HNO₃(đ) → Zn(NO₃)₂ + 2NO₂↑(nâu đỏ) + 2H₂O', phenom: 'Phản ứng mãnh liệt tỏa khí NO₂ màu nâu đỏ và tỏa nhiệt mạnh.', type: 'Oxi hóa mạnh' },
  { key: 'HNO3_conc+Cu_metal', reactants: 'HNO₃(đặc) + Lá Đồng (Cu)', eq: 'Cu + 4HNO₃(đ) → Cu(NO₃)₂ + 2NO₂↑(nâu đỏ) + 2H₂O', phenom: 'Đồng tan nhanh tạo dung dịch xanh lam và bốc khói khí NO₂ nâu đỏ.', type: 'Oxi hóa mạnh' },
  { key: 'H2SO4_conc+NaOH', reactants: 'H₂SO₄(đặc) + NaOH', eq: 'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O', phenom: 'Phản ứng trung hòa tỏa nhiệt lượng rất lớn (nhiệt độ tăng vọt).', type: 'Tỏa nhiệt mạnh' },
  { key: 'NaOH+Phenol', reactants: 'NaOH + Phenolphtalein', eq: 'NaOH + Phenolphthalein → Ion Quinoid', phenom: 'Dung dịch lập tức chuyển sang màu hồng cánh sen đặc trưng.', type: 'Chỉ thị pH' },
  { key: 'Na2CO3+Phenol', reactants: 'Na₂CO₃ + Phenolphtalein', eq: 'CO₃²⁻ + H₂O ⇌ HCO₃⁻ + OH⁻ (Hóa hồng)', phenom: 'Muối Na₂CO₃ thủy phân tạo môi trường kiềm làm hồng Phenolphtalein.', type: 'Thủy phân muối' },
  { key: 'HCl+Phenol', reactants: 'HCl + Phenolphtalein', eq: 'HCl + Phenolphthalein → Dạng Axit', phenom: 'Dung dịch giữ nguyên trạng thái trong suốt không màu.', type: 'Chỉ thị pH' },
  { key: 'H2SO4_conc+SKIN', reactants: 'H₂SO₄(đặc) + Mô Da', eq: 'H₂SO₄(đặc) + Protein Mô Da → Than hóa Keratin', phenom: 'CẢNH BÁO NGUY HIỂM: Hút nước cực mạnh làm đen và hoại tử mô da!', type: 'An toàn Lab' },
  { key: 'HNO3_conc+SKIN', reactants: 'HNO₃(đặc) + Mô Da', eq: 'HNO₃(đặc) + Vòng thơm Protein → Hợp chất Nitro vàng', phenom: 'CẢNH BÁO NGUY HIỂM: Phản ứng Xanthoproteic làm vàng da ăn sâu!', type: 'An toàn Lab' },
  { key: 'NaOH+SKIN', reactants: 'NaOH(đặc) + Mô Da', eq: 'NaOH(đặc) + Màng Lipid → Xà phòng hóa mô mềm', phenom: 'CẢNH BÁO NGUY HIỂM: Ăn mòn kiềm nhớt trơn trượt phá hủy tế bào!', type: 'An toàn Lab' },
];

/**
 * Parses a chemical reagent code or formula into a structured chemical species profile
 */
export function parseChemicalSpeciesProfile(rawCode: string): ChemicalSpeciesProfile {
  const clean = String(rawCode || '')
    .replace(/_conc|_sat|_metal/g, '')
    .replace(/₀/g, '0')
    .replace(/₁/g, '1')
    .replace(/₂/g, '2')
    .replace(/₃/g, '3')
    .replace(/₄/g, '4')
    .replace(/₅/g, '5')
    .replace(/₆/g, '6')
    .replace(/₇/g, '7')
    .replace(/₈/g, '8')
    .replace(/₉/g, '9')
    .trim();

  const labelMap: Record<string, string> = {
    H2SO4_conc: 'H₂SO₄(đặc)',
    HNO3_conc: 'HNO₃(đặc)',
    NaCl_sat: 'NaCl',
    Zn_metal: 'Zn',
    Al_metal: 'Al',
    Fe_metal: 'Fe',
    Mg_metal: 'Mg',
    Cu_metal: 'Cu',
    PbNO3: 'Pb(NO₃)₂',
    Sugar: 'C₁₂H₂₂O₁₁',
    Starch: '(C₆H₁₀O₅)ₙ',
    Iodine: 'I₂',
    Phenol: 'Phenolphthalein',
  };
  const formulaDisplay = labelMap[rawCode] || clean;

  // Detect pure metals
  const metalMatch = clean.match(/^(K|Na|Ba|Ca|Mg|Al|Zn|Fe|Ni|Sn|Pb|Cu|Ag|Au)$/i);
  if (metalMatch || String(rawCode).endsWith('_metal')) {
    const sym = metalMatch ? metalMatch[1] : clean;
    return { rawCode, formula: formulaDisplay, category: ChemicalCategory.METAL, metal: sym };
  }

  // Detect indicators / organic
  if (/phenol/i.test(rawCode)) {
    return { rawCode, formula: 'Phenolphthalein', category: ChemicalCategory.INDICATOR };
  }
  if (/sugar|C12H22O11|glucose|C6H12O6/i.test(rawCode)) {
    return { rawCode, formula: formulaDisplay, category: ChemicalCategory.ORGANIC_SUGAR };
  }
  if (/starch|C6H10O5/i.test(rawCode)) {
    return { rawCode, formula: formulaDisplay, category: ChemicalCategory.STARCH };
  }

  // Detect Acids
  if (/^(HCl|HBr|HI|HNO3|H2SO4|H3PO4|H2CO3|H2S|CH3COOH|HCOOH)/i.test(clean)) {
    let anion = 'Cl';
    if (/SO4/i.test(clean)) anion = 'SO4';
    else if (/NO3/i.test(clean)) anion = 'NO3';
    else if (/PO4/i.test(clean)) anion = 'PO4';
    else if (/CO3/i.test(clean)) anion = 'CO3';
    else if (/CH3COO/i.test(clean)) anion = 'CH3COO';
    else if (/Br/i.test(clean)) anion = 'Br';
    else if (/I/i.test(clean)) anion = 'I';
    else if (/S$/i.test(clean)) anion = 'S';
    return {
      rawCode,
      formula: formulaDisplay,
      category: ChemicalCategory.ACID,
      cation: 'H',
      anion,
      isConcOxidizer: rawCode === 'H2SO4_conc' || rawCode === 'HNO3_conc',
    };
  }

  // Detect Bases / Alkalis
  if (/OH/i.test(clean) || /^NH3$/i.test(clean)) {
    let cation = 'Na';
    const m = clean.match(/^(Na|K|Li|Ba|Ca|Mg|Fe|Cu|Zn|Al|NH4)/i);
    if (m) cation = m[1];
    else if (/^NH3$/i.test(clean)) cation = 'NH4';
    return { rawCode, formula: formulaDisplay, category: ChemicalCategory.BASE, cation, anion: 'OH' };
  }

  // Detect Salts & General Inorganic Compounds
  let cation: string | null = null;
  let anion: string | null = null;
  const catMatch = clean.match(/^(Na|K|Li|NH4|Ag|Ba|Ca|Mg|Zn|Fe|Cu|Pb|Al|Mn|Cr|Hg)/);
  if (catMatch) cation = catMatch[1];
  if (/SO4/i.test(clean)) anion = 'SO4';
  else if (/CO3/i.test(clean)) anion = /HCO3/i.test(clean) ? 'HCO3' : 'CO3';
  else if (/NO3/i.test(clean)) anion = 'NO3';
  else if (/PO4/i.test(clean)) anion = 'PO4';
  else if (/SO3/i.test(clean)) anion = 'SO3';
  else if (/MnO4/i.test(clean)) anion = 'MnO4';
  else if (/Cr2O7/i.test(clean)) anion = 'Cr2O7';
  else if (/Cl/i.test(clean)) anion = 'Cl';
  else if (/Br/i.test(clean)) anion = 'Br';
  else if (/I/i.test(clean)) anion = 'I';
  else if (/S$/i.test(clean)) anion = 'S';

  return {
    rawCode,
    formula: formulaDisplay,
    category: cation && anion ? ChemicalCategory.SALT : ChemicalCategory.GENERAL,
    cation,
    anion,
  };
}

const PRECIPITATE_SOLUBILITY_TABLE: Record<string, { f: string; col: string; liq: string; gas?: boolean }> = {
  'Ag+Cl': { f: 'AgCl↓(trắng)', col: '#ffffff', liq: '#f8fafc' },
  'Ag+Br': { f: 'AgBr↓(vàng nhạt)', col: '#fef08a', liq: '#fefce8' },
  'Ag+I': { f: 'AgI↓(vàng đậm)', col: '#eab308', liq: '#fef08a' },
  'Ag+CO3': { f: 'Ag₂CO₃↓(vàng nhạt)', col: '#fef08a', liq: '#fefce8' },
  'Ag+PO4': { f: 'Ag₃PO₄↓(vàng)', col: '#facc15', liq: '#fef9c3' },
  'Ag+OH': { f: 'Ag₂O↓(nâu đen)', col: '#334155', liq: '#64748b' },
  'Ag+S': { f: 'Ag₂S↓(đen)', col: '#0f172a', liq: '#334155' },
  'Ba+SO4': { f: 'BaSO₄↓(trắng)', col: '#ffffff', liq: '#f8fafc' },
  'Ba+CO3': { f: 'BaCO₃↓(trắng)', col: '#ffffff', liq: '#f8fafc' },
  'Ba+SO3': { f: 'BaSO₃↓(trắng)', col: '#ffffff', liq: '#f8fafc' },
  'Ba+PO4': { f: 'Ba₃(PO₄)₂↓(trắng)', col: '#ffffff', liq: '#f8fafc' },
  'Ca+CO3': { f: 'CaCO₃↓(trắng)', col: '#ffffff', liq: '#f8fafc' },
  'Ca+PO4': { f: 'Ca₃(PO₄)₂↓(trắng)', col: '#ffffff', liq: '#f8fafc' },
  'Pb+I': { f: 'PbI₂↓(vàng óng)', col: '#facc15', liq: '#fef08a' },
  'Pb+Cl': { f: 'PbCl₂↓(trắng)', col: '#ffffff', liq: '#f8fafc' },
  'Pb+SO4': { f: 'PbSO₄↓(trắng)', col: '#ffffff', liq: '#f8fafc' },
  'Pb+CO3': { f: 'PbCO₃↓(trắng)', col: '#ffffff', liq: '#f8fafc' },
  'Pb+OH': { f: 'Pb(OH)₂↓(trắng)', col: '#ffffff', liq: '#f8fafc' },
  'Pb+S': { f: 'PbS↓(đen)', col: '#0f172a', liq: '#334155' },
  'Cu+OH': { f: 'Cu(OH)₂↓(xanh lam)', col: '#0284c7', liq: '#38bdf8' },
  'Cu+CO3': { f: 'CuCO₃·Cu(OH)₂↓(xanh lục)', col: '#10b981', liq: '#34d399' },
  'Cu+S': { f: 'CuS↓(đen)', col: '#0f172a', liq: '#1e293b' },
  'Fe+OH': { f: 'Fe(OH)ₙ↓(kết tủa)', col: '#b45309', liq: '#d97706' },
  'Fe+CO3': { f: 'Fe(OH)₃↓ + CO₂↑', col: '#b45309', liq: '#d97706', gas: true },
  'Zn+OH': { f: 'Zn(OH)₂↓(trắng keo)', col: '#ffffff', liq: '#f1f5f9' },
  'Zn+CO3': { f: 'ZnCO₃↓(trắng)', col: '#ffffff', liq: '#f1f5f9' },
  'Al+OH': { f: 'Al(OH)₃↓(keo trắng)', col: '#ffffff', liq: '#f1f5f9' },
  'Mg+OH': { f: 'Mg(OH)₂↓(trắng)', col: '#ffffff', liq: '#f8fafc' },
  'Mg+CO3': { f: 'MgCO₃↓(trắng)', col: '#ffffff', liq: '#f8fafc' },
};

/**
 * Algorithmic Inorganic & Organic Reaction Synthesizer for arbitrary reagent pairs
 */
export function synthesizeUniversalChemistryReaction(codeA: string, codeB: string): ReactionRule {
  const pA = parseChemicalSpeciesProfile(codeA);
  const pB = parseChemicalSpeciesProfile(codeB);

  // 1. Acid + Base Neutralization
  if (
    (pA.category === ChemicalCategory.ACID && pB.category === ChemicalCategory.BASE) ||
    (pB.category === ChemicalCategory.ACID && pA.category === ChemicalCategory.BASE)
  ) {
    const acid = pA.category === ChemicalCategory.ACID ? pA : pB;
    const base = pA.category === ChemicalCategory.BASE ? pA : pB;
    const saltName = `${base.cation}${acid.anion === 'SO4' ? '₂SO₄' : acid.anion === 'CO3' ? '₂CO₃' : acid.anion}`;
    const isBaSO4 = base.cation === 'Ba' && acid.anion === 'SO4';
    return {
      eq: `${acid.formula} + ${base.formula} → ${saltName}${isBaSO4 ? '↓(trắng)' : ''} + H₂O`,
      color: isBaSO4 ? '#f8fafc' : 'rgba(56, 189, 248, 0.42)',
      precipitateColor: isBaSO4 ? '#ffffff' : undefined,
      precipitateLevel: isBaSO4 ? 0.85 : 0,
      deltaT: 11,
      pH: 7.0,
      desc: `Phản ứng trung hòa Axit - Bazơ (${acid.formula} + ${base.formula}) tạo muối ${saltName} và nước kèm tỏa nhiệt (ΔH < 0).`,
    };
  }

  // 2. Acid + Carbonate / Bicarbonate / Sulfite / Sulfide -> Gas Evolution
  const checkAcidGas = (ac: ChemicalSpeciesProfile, salt: ChemicalSpeciesProfile): ReactionRule | null => {
    if (ac.category !== ChemicalCategory.ACID) return null;
    if (salt.anion === 'CO3' || salt.anion === 'HCO3') {
      return {
        eq: `${salt.formula} + ${ac.formula} → Muối ${salt.cation || ''}${ac.anion} + H₂O + CO₂↑`,
        color: 'rgba(224, 242, 254, 0.55)',
        gas: true,
        gasEvolutionRate: 1.0,
        deltaT: 4,
        pH: 5.5,
        desc: 'Axit mạnh đẩy axit yếu H₂CO₃ ra khỏi muối cacbonat, phân hủy ngay tạo bọt khí CO₂↑ sủi mạnh.',
      };
    }
    if (salt.anion === 'SO3') {
      return {
        eq: `${salt.formula} + ${ac.formula} → Muối ${salt.cation || ''}${ac.anion} + H₂O + SO₂↑`,
        color: 'rgba(224, 242, 254, 0.55)',
        gas: true,
        gasEvolutionRate: 1.0,
        deltaT: 5,
        pH: 4.5,
        desc: 'Phản ứng trao đổi ion giải phóng khí lưu huỳnh đioxit SO₂↑ sủi bọt.',
      };
    }
    if (salt.anion === 'S' && salt.cation !== 'Cu' && salt.cation !== 'Ag' && salt.cation !== 'Pb') {
      return {
        eq: `${salt.formula} + ${ac.formula} → Muối ${salt.cation || ''}${ac.anion} + H₂S↑`,
        color: 'rgba(224, 242, 254, 0.55)',
        gas: true,
        gasEvolutionRate: 1.0,
        deltaT: 3,
        pH: 5.0,
        desc: 'Phản ứng giải phóng khí hiđro sunfua H₂S↑ thoát ra khỏi dung dịch.',
      };
    }
    return null;
  };
  const gasRes = checkAcidGas(pA, pB) || checkAcidGas(pB, pA);
  if (gasRes) return gasRes;

  // 3. Metal + Acid Reaction
  if (
    (pA.category === ChemicalCategory.METAL && pB.category === ChemicalCategory.ACID) ||
    (pB.category === ChemicalCategory.METAL && pA.category === ChemicalCategory.ACID)
  ) {
    const m = pA.category === ChemicalCategory.METAL ? pA : pB;
    const ac = pA.category === ChemicalCategory.ACID ? pA : pB;
    const activeMetals = ['K', 'Na', 'Ba', 'Ca', 'Mg', 'Al', 'Zn', 'Fe', 'Ni', 'Sn', 'Pb'];
    if (ac.isConcOxidizer) {
      const gasProd = ac.rawCode === 'HNO3_conc' ? 'NO₂↑(nâu đỏ)' : 'SO₂↑';
      return {
        eq: `${m.formula} + ${ac.formula} → ${m.formula}(${ac.anion})ₙ + ${gasProd} + H₂O`,
        color: ac.rawCode === 'HNO3_conc' ? '#b45309' : '#0284c7',
        gas: true,
        gasEvolutionRate: 1.15,
        deltaT: 19,
        pH: 1.8,
        desc: `Phản ứng oxi hóa - khử mạnh giữa kim loại ${m.formula} và axit đặc ${ac.formula}, giải phóng khí ${gasProd} và tỏa nhiệt lớn.`,
      };
    }
    if (m.metal && activeMetals.includes(m.metal)) {
      return {
        eq: `${m.formula} + ${ac.formula} → ${m.formula}${ac.anion}ₙ + H₂↑`,
        color: m.metal === 'Fe' ? '#86efac' : 'rgba(186, 230, 253, 0.55)',
        gas: true,
        gasEvolutionRate: 1.0,
        deltaT: 9,
        pH: 3.2,
        desc: `Kim loại ${m.formula} đứng trước H trong dãy điện hóa khử ion H⁺ của axit ${ac.formula}, sủi bọt khí H₂↑ liên tục.`,
      };
    }
  }

  // 4. Metal + Salt Solution Displacement (Beketov Series)
  if (
    (pA.category === ChemicalCategory.METAL && pB.category === ChemicalCategory.SALT) ||
    (pB.category === ChemicalCategory.METAL && pA.category === ChemicalCategory.SALT)
  ) {
    const m = pA.category === ChemicalCategory.METAL ? pA : pB;
    const salt = pA.category === ChemicalCategory.SALT ? pA : pB;
    const series = ['Mg', 'Al', 'Zn', 'Fe', 'Ni', 'Sn', 'Pb', 'Cu', 'Ag', 'Au'];
    const idxM = m.metal ? series.indexOf(m.metal) : -1;
    const idxCat = salt.cation ? series.indexOf(salt.cation) : -1;
    if (idxM !== -1 && idxCat !== -1 && idxM < idxCat) {
      const displacedColor = salt.cation === 'Cu' ? '#b45309' : salt.cation === 'Ag' ? '#e2e8f0' : '#64748b';
      return {
        eq: `${m.formula} + ${salt.formula} → ${m.metal}(${salt.anion}) + ${salt.cation}↓`,
        color: m.metal === 'Fe' ? '#86efac' : '#38bdf8',
        precipitateColor: displacedColor,
        precipitateLevel: 0.82,
        deltaT: 6,
        pH: 5.5,
        desc: `Phản ứng thế kim loại (Dãy điện hóa): ${m.formula} hoạt động mạnh hơn đẩy ${salt.cation} ra khỏi dung dịch muối ${salt.formula} tạo kết tủa kim loại ${salt.cation}↓.`,
      };
    }
  }

  // 5. Double Replacement Precipitation Matrix
  const pair1 = pA.cation && pB.anion ? PRECIPITATE_SOLUBILITY_TABLE[`${pA.cation}+${pB.anion}`] : null;
  const pair2 = pB.cation && pA.anion ? PRECIPITATE_SOLUBILITY_TABLE[`${pB.cation}+${pA.anion}`] : null;
  const hit = pair1 || pair2;
  if (hit) {
    const byproduct = pair1
      ? `${pB.cation || 'Na'}${pA.anion || 'NO₃'}`
      : `${pA.cation || 'Na'}${pB.anion || 'NO₃'}`;
    return {
      eq: `${pA.formula} + ${pB.formula} → ${hit.f} + ${byproduct}`,
      color: hit.liq,
      precipitateColor: hit.col,
      precipitateLevel: 0.85,
      gas: Boolean(hit.gas),
      gasEvolutionRate: hit.gas ? 1.0 : 0,
      deltaT: 4,
      pH: 7.0,
      desc: `Phản ứng trao đổi ion trong dung dịch: Tạo thành chất kết tủa ${hit.f} tách ra khỏi pha lỏng (thỏa mãn điều kiện phản ứng trao đổi ion).`,
    };
  }

  // 6. Aqueous Ionic Equilibrium / Solution Mixing
  const ionsList: string[] = [];
  if (pA.cation) ionsList.push(`${pA.cation}⁺`);
  if (pA.anion) ionsList.push(`${pA.anion}⁻`);
  if (pB.cation && pB.cation !== pA.cation) ionsList.push(`${pB.cation}⁺`);
  if (pB.anion && pB.anion !== pA.anion) ionsList.push(`${pB.anion}⁻`);
  const ionSummary = ionsList.length > 0 ? ionsList.join(', ') : `${pA.formula}, ${pB.formula}`;

  return {
    eq: `${pA.formula} + ${pB.formula} ⇌ Hệ dung dịch điện ly (${ionSummary})`,
    color: 'rgba(56, 189, 248, 0.45)',
    deltaT: 2,
    pH: 7.0,
    precipitateLevel: 0,
    gasEvolutionRate: 0,
    isDynamicUniversal: true,
    desc: `Hệ phân ly hoàn toàn tạo dung dịch đồng nhất chứa các tiểu phân [${ionSummary}]. Hệ thống đang truy vấn thêm cơ chế nâng cao từ kho dữ liệu mở rộng...`,
  };
}

/**
 * Resolves any two chemical reagents (or a pre-joined key like 'CuSO4+NaOH')
 * against REACTION_MATRIX across all permutations, falling back to universal synthesis.
 */
export function resolveReactionCombination(
  reagentOrKeyA: string,
  reagentB?: string
): { key: string; rule: ReactionRule; isSynthesized: boolean } {
  let codeA = reagentOrKeyA;
  let codeB = reagentB || '';

  if (!reagentB && reagentOrKeyA.includes('+')) {
    const parts = reagentOrKeyA.split('+');
    codeA = parts[0];
    codeB = parts[1];
  }

  const kSorted = [codeA, codeB].sort().join('+');
  const kDirect = `${codeA}+${codeB}`;
  const kReverse = `${codeB}+${codeA}`;

  if (REACTION_MATRIX[kDirect]) {
    return { key: kDirect, rule: REACTION_MATRIX[kDirect], isSynthesized: false };
  }
  if (REACTION_MATRIX[kReverse]) {
    return { key: kReverse, rule: REACTION_MATRIX[kReverse], isSynthesized: false };
  }
  if (REACTION_MATRIX[kSorted]) {
    return { key: kSorted, rule: REACTION_MATRIX[kSorted], isSynthesized: false };
  }

  const synthesized = synthesizeUniversalChemistryReaction(codeA, codeB);
  REACTION_MATRIX[kSorted] = synthesized;
  return { key: kSorted, rule: synthesized, isSynthesized: true };
}

/**
 * Finds all valid reaction partners in REACTION_MATRIX for a single reagent in the vessel
 */
export function getCompatiblePartners(
  reagentCode: string
): Array<{ code: string; key: string; desc: string }> {
  const suggestions: Array<{ code: string; key: string; desc: string }> = [];
  Object.keys(REACTION_MATRIX).forEach((k) => {
    if (!k.includes('SKIN')) {
      const parts = k.split('+');
      if (parts.includes(reagentCode)) {
        const partner = parts[0] === reagentCode ? parts[1] : parts[0];
        if (!suggestions.some((item) => item.code === partner)) {
          suggestions.push({
            code: partner,
            key: k,
            desc: REACTION_MATRIX[k].desc,
          });
        }
      }
    }
  });
  return suggestions;
}

/**
 * Computes the deterministic physical state outcome for a chemical reaction rule
 */
export function computeReactionPhysicalOutcome(
  rule: ReactionRule,
  reactionKey: string,
  currentChem?: Partial<ChemLabSubState>
): ReactionPhysicalOutcome {
  const baseTemp = typeof currentChem?.temperatureC === 'number' ? currentChem.temperatureC : 25.0;
  const baseCoating = typeof currentChem?.cuCoatingProgress === 'number' ? currentChem.cuCoatingProgress : 0;

  // Precipitate level & color
  const precipitateColor = rule.precipitateColor || null;
  const precipitateLevel = precipitateColor
    ? typeof rule.precipitateLevel === 'number'
      ? rule.precipitateLevel
      : 0.85
    : 0;

  // Gas evolution & Carbon tower
  let gasEvolutionRate = rule.gas
    ? typeof rule.gasEvolutionRate === 'number'
      ? rule.gasEvolutionRate
      : 1.0
    : 0;
  let sugarCarbonHeight = 0;
  if (rule.carbonTower) {
    sugarCarbonHeight = 0.05;
    gasEvolutionRate = 1.2;
  }

  // Metal immersion & redox coating
  const hasMetal = Boolean(
    reactionKey &&
      (reactionKey.includes('Zn_metal') ||
        reactionKey.includes('Fe_metal') ||
        reactionKey.includes('Cu_metal') ||
        reactionKey.includes('Mg_metal') ||
        reactionKey.includes('Al_metal'))
  );
  const znPlateInserted = hasMetal || Boolean(currentChem?.znPlateInserted);
  const cuCoatingProgress =
    hasMetal && (reactionKey.includes('CuSO4') || reactionKey.includes('AgNO3'))
      ? Math.max(0.18, baseCoating || 0.18)
      : baseCoating;

  const agNO3Added = Boolean(reactionKey && reactionKey.includes('AgNO3')) || Boolean(currentChem?.agNO3Added);

  // Temperature outcome
  const temperatureC = rule.deltaT ? Math.min(100, baseTemp + rule.deltaT) : baseTemp;

  // pH outcome
  let pH = typeof currentChem?.pH === 'number' ? currentChem.pH : 7.0;
  if (typeof rule.pH === 'number') {
    pH = rule.pH;
  } else if (reactionKey === 'HCl+NaOH' || reactionKey === 'H2SO4_conc+NaOH') {
    pH = 7.0;
  } else if (
    reactionKey &&
    (reactionKey.includes('NaOH') || reactionKey.includes('Ca(OH)2') || reactionKey.includes('NH3'))
  ) {
    pH = 12.2;
  } else if (
    reactionKey &&
    (reactionKey.includes('HCl') ||
      reactionKey.includes('H2SO4') ||
      reactionKey.includes('HNO3') ||
      reactionKey.includes('CH3COOH'))
  ) {
    pH = 1.6;
  }

  // Screen shake calculation for vigorous reactions
  let shakeIntensity = 0;
  let shakeDuration = 0;
  if (rule.carbonTower) {
    shakeIntensity = 4.2;
    shakeDuration = 1.45;
  } else if (rule.deltaT && rule.deltaT >= 12) {
    shakeIntensity = Math.min(3.6, 1.6 + rule.deltaT * 0.06);
    shakeDuration = 0.75;
  }

  const liquidColor = rule.color || 'rgba(56,189,248,0.45)';
  const plumeColor = rule.precipitateColor || rule.color || '#38bdf8';

  return {
    matched: true,
    reactionKey,
    rule,
    pH,
    temperatureC,
    precipitateLevel,
    precipitateColor,
    gasEvolutionRate,
    sugarCarbonHeight,
    znPlateInserted,
    cuCoatingProgress,
    agNO3Added,
    liquidColor,
    plumeColor,
    shakeIntensity,
    shakeDuration,
  };
}

/**
 * Applies a chemical reaction rule's physical outcomes to `currentLabState`.
 * Strictly isolated: Only mutates chemistry state (`labState.chem`) and never interferes
 * with Physics (`PHYS`) or Biology (`BIO`) subject engines.
 */
export function applyReactionToLabState(
  labState: LabState | null | undefined,
  rule: ReactionRule,
  reactionKey: string,
  hooks?: ReactionVisualHooks
): ReactionPhysicalOutcome | null {
  if (!labState || !labState.chem) return null;

  // Guard: Do not interfere if another subject engine (PHYS or BIO) is currently active
  if (labState.activeTab !== SubjectEngineTab.CHEM) {
    return null;
  }

  const outcome = computeReactionPhysicalOutcome(rule, reactionKey, labState.chem);

  // Update currentLabState.chem physical variables
  labState.chem.precipitateColor = outcome.precipitateColor;
  labState.chem.precipitateLevel = outcome.precipitateLevel;
  labState.chem.gasEvolutionRate = outcome.gasEvolutionRate;
  labState.chem.sugarCarbonHeight = outcome.sugarCarbonHeight;
  labState.chem.znPlateInserted = outcome.znPlateInserted;
  labState.chem.cuCoatingProgress = outcome.cuCoatingProgress;
  labState.chem.agNO3Added = outcome.agNO3Added;
  labState.chem.temperatureC = outcome.temperatureC;
  labState.chem.pH = outcome.pH;

  labState.activeEquation = rule.eq;
  labState.phenomenonDesc = rule.desc;

  // Execute visual & UI hooks if provided
  if (hooks?.setEquationBannerHTML) {
    hooks.setEquationBannerHTML(rule.eq, rule.desc);
  }
  if (outcome.precipitateColor && outcome.precipitateLevel > 0 && hooks?.spawnPrecipitateParticles) {
    hooks.spawnPrecipitateParticles(outcome.precipitateColor, 42);
  }
  if (
    labState.engine2D === 'CHEM_A_VESSEL' &&
    outcome.shakeIntensity > 0 &&
    hooks?.triggerScreenShake
  ) {
    hooks.triggerScreenShake(outcome.shakeIntensity, outcome.shakeDuration);
  }
  if (hooks?.triggerMolecularBondReaction) {
    hooks.triggerMolecularBondReaction(reactionKey, rule);
  }
  if (hooks?.triggerBeakerDissolve) {
    hooks.triggerBeakerDissolve(outcome.liquidColor, outcome.plumeColor);
  }
  if (hooks?.onStateUpdated) {
    hooks.onStateUpdated(outcome);
  }

  return outcome;
}

/**
 * Updates `currentLabState.chem` when a single reagent is added to the vessel.
 * Strictly guarded so it never affects `PHYS` or `BIO` engines.
 */
export function applySingleReagentToLabState(
  labState: LabState | null | undefined,
  reagentCode: string
): { liquidColor: string; pH: number } | null {
  if (!labState || !labState.chem) return null;
  if (labState.activeTab !== SubjectEngineTab.CHEM) {
    return null;
  }

  const profile = SINGLE_REAGENT_PROFILES[reagentCode] || {
    color: 'rgba(56, 189, 248, 0.35)',
    pH: 7.0,
  };

  labState.chem.pH = profile.pH;
  labState.chem.precipitateLevel = 0;
  labState.chem.precipitateColor = null;
  labState.chem.gasEvolutionRate = 0;
  labState.chem.sugarCarbonHeight = 0;
  if (reagentCode.includes('_metal')) {
    labState.chem.znPlateInserted = true;
  }

  return { liquidColor: profile.color, pH: profile.pH };
}

/**
 * Resets all chemistry reaction state variables in `currentLabState.chem`
 * without modifying any Physics (`phys`) or Biology (`bio`) state.
 */
export function resetChemistryReactionState(labState: LabState | null | undefined): void {
  if (!labState || !labState.chem) return;
  labState.sandboxReagents = [];
  labState.skinDamageLevel = 0;
  labState.chem.precipitateLevel = 0;
  labState.chem.precipitateColor = null;
  labState.chem.gasEvolutionRate = 0;
  labState.chem.sugarCarbonHeight = 0;
  labState.chem.znPlateInserted = false;
  labState.chem.cuCoatingProgress = 0;
  labState.chem.agNO3Added = false;
  labState.chem.volumeMl = 90;
  labState.chem.temperatureC = 25.0;
  labState.chem.pH = 7.0;
  labState.chem.benchBurnerLit = false;
}

export interface CorrosiveTissueProfile {
  code: string;
  isCorrosive: boolean;
  mechanismVi: string;
  mechanismEn: string;
  glowColor: string;
  coreColor: string;
  rimColor: string;
  deltaTempC: number;
  damageIncrement: number;
}

export const CORROSIVE_TISSUE_PROFILES: Record<string, CorrosiveTissueProfile> = {
  H2SO4_conc: {
    code: 'H2SO4_conc',
    isCorrosive: true,
    mechanismVi: 'Than hóa Keratin & Hút nước mô (C₁₂H₂₂O₁₁ → 12C)',
    mechanismEn: 'Exothermic Keratin Carbonization & Dehydration',
    glowColor: 'rgba(245, 158, 11, 0.78)',
    coreColor: '#090d16',
    rimColor: '#f59e0b',
    deltaTempC: 36.5,
    damageIncrement: 0.55,
  },
  HNO3_conc: {
    code: 'HNO3_conc',
    isCorrosive: true,
    mechanismVi: 'Phản ứng Xanthoproteic — Nitro hóa vòng thơm Protein',
    mechanismEn: 'Xanthoproteic Nitration of Aromatic Proteins',
    glowColor: 'rgba(250, 204, 21, 0.80)',
    coreColor: '#ca8a04',
    rimColor: '#facc15',
    deltaTempC: 24.0,
    damageIncrement: 0.50,
  },
  NaOH: {
    code: 'NaOH',
    isCorrosive: true,
    mechanismVi: 'Xà phòng hóa màng Lipid & Hoại tử hóa lỏng mô mềm',
    mechanismEn: 'Alkaline Lipid Saponification & Liquefaction Necrosis',
    glowColor: 'rgba(244, 63, 94, 0.75)',
    coreColor: '#be123c',
    rimColor: '#fda4af',
    deltaTempC: 18.5,
    damageIncrement: 0.48,
  },
  HCl: {
    code: 'HCl',
    isCorrosive: true,
    mechanismVi: 'Đông tụ Protein biểu bì & Kích ứng ăn mòn axit',
    mechanismEn: 'Acidic Coagulation & Epidermal Corrosion',
    glowColor: 'rgba(225, 29, 72, 0.72)',
    coreColor: '#9f1239',
    rimColor: '#f43f5e',
    deltaTempC: 11.0,
    damageIncrement: 0.38,
  },
  Br2: {
    code: 'Br2',
    isCorrosive: true,
    mechanismVi: 'Oxi hóa mạnh & Bỏng sâu biểu bì do Brom lỏng',
    mechanismEn: 'Severe Oxidative Bromine Tissue Burn',
    glowColor: 'rgba(234, 88, 12, 0.78)',
    coreColor: '#7c2d12',
    rimColor: '#fb923c',
    deltaTempC: 16.0,
    damageIncrement: 0.46,
  },
  KMnO4: {
    code: 'KMnO4',
    isCorrosive: true,
    mechanismVi: 'Oxi hóa mô biểu bì tạo vết nâu đen MnO₂↓',
    mechanismEn: 'Permanganate Epidermal Oxidation (MnO₂ staining)',
    glowColor: 'rgba(168, 85, 247, 0.72)',
    coreColor: '#4c1d95',
    rimColor: '#c084fc',
    deltaTempC: 9.5,
    damageIncrement: 0.34,
  },
};

export function getCorrosiveTissueProfile(reagentCode: string): CorrosiveTissueProfile {
  if (CORROSIVE_TISSUE_PROFILES[reagentCode]) {
    return CORROSIVE_TISSUE_PROFILES[reagentCode];
  }
  const parsed = parseChemicalSpeciesProfile(reagentCode);
  if (parsed.category === ChemicalCategory.ACID || parsed.category === ChemicalCategory.BASE) {
    return {
      code: reagentCode,
      isCorrosive: true,
      mechanismVi:
        parsed.category === ChemicalCategory.ACID
          ? `Ăn mòn axit (${parsed.formula}) làm biến tính Protein biểu bì`
          : `Ăn mòn kiềm (${parsed.formula}) tác động lên lớp màng Lipid`,
      mechanismEn:
        parsed.category === ChemicalCategory.ACID
          ? `Acidic corrosion (${parsed.formula}) denaturing epidermal protein`
          : `Alkaline corrosion (${parsed.formula}) saponifying epidermal lipids`,
      glowColor:
        parsed.category === ChemicalCategory.ACID
          ? 'rgba(244, 63, 94, 0.70)'
          : 'rgba(236, 72, 153, 0.70)',
      coreColor: parsed.category === ChemicalCategory.ACID ? '#881337' : '#9d174d',
      rimColor: parsed.category === ChemicalCategory.ACID ? '#fb7185' : '#f472b6',
      deltaTempC: 10.0,
      damageIncrement: 0.35,
    };
  }
  return {
    code: reagentCode,
    isCorrosive: false,
    mechanismVi: 'Tương tác bề mặt biểu bì (Không gây bỏng hoại tử)',
    mechanismEn: 'Superficial epidermal contact (Non-necrotic)',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    coreColor: '#0284c7',
    rimColor: '#38bdf8',
    deltaTempC: 1.0,
    damageIncrement: 0.08,
  };
}

/**
 * Registers or updates a reaction rule in REACTION_MATRIX
 */
export function registerReactionRule(reactionKey: string, rule: ReactionRule): void {
  if (!reactionKey || !rule) return;
  REACTION_MATRIX[reactionKey] = rule;
}

export const ReactionEngine = {
  SubjectEngineTab,
  ChemicalCategory,
  REACTION_MATRIX,
  REACTION_DIRECTORY,
  SINGLE_REAGENT_PROFILES,
  CORROSIVE_TISSUE_PROFILES,
  parseChemicalSpeciesProfile,
  synthesizeUniversalChemistryReaction,
  resolveReactionCombination,
  getCompatiblePartners,
  computeReactionPhysicalOutcome,
  applyReactionToLabState,
  applySingleReagentToLabState,
  resetChemistryReactionState,
  getCorrosiveTissueProfile,
  registerReactionRule,
};

declare global {
  interface Window {
    ReactionEngine?: typeof ReactionEngine;
    REACTION_MATRIX?: Record<string, ReactionRule>;
    REACTION_DIRECTORY?: ReactionDirectoryEntry[];
  }
}

if (typeof window !== 'undefined') {
  window.ReactionEngine = ReactionEngine;
  window.REACTION_MATRIX = REACTION_MATRIX;
  window.REACTION_DIRECTORY = REACTION_DIRECTORY;
}

export default ReactionEngine;

