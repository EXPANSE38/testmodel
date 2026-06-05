var RISK_COLORS = {
  "Low": "#4caf50",
  "Medium": "#ff9800",
  "High": "#f44336",
  "Very High": "#b71c1c"
};

var SNACK_HEURISTICS = {
  highRiskWords: ["packaged", "wrapped", "instant", "cup", "pouch", "bag", "bottled", "gum", "microwave", "plastic", "foam", "snack pack", "individual"],
  lowRiskWords: ["fresh", "loose", "bulk", "unwrapped", "whole fruit", "raw", "homemade", "banana", "apple", "orange"],
  snackWords: ["snack", "food", "eat", "cracker", "chip", "candy", "bar", "cookie", "cracker", "treat", "lunch"]
};

var GENERIC_SNACK_FALLBACK = {
  name: "Unknown Snack",
  containsPlastic: "Possible",
  containsPlasticDetail: "Many packaged snacks have some plastic exposure from wrappers, processing, or environmental contamination. Fresh, loose, unpackaged foods are generally safer.",
  plasticSources: ["Possible plastic packaging", "Possible processing contamination", "Trace environmental microplastics in all foods"],
  microplasticRisk: "Unknown",
  microplasticRiskDetail: "Without a specific match, assume packaged processed snacks may contain or contact microplastics.",
  betterAlternatives: ["Choose fresh whole fruit", "Buy bulk snacks in your own container", "Avoid individually plastic-wrapped items", "Check ingredient labels for gum base or synthetic additives"],
  howLongItLasts: "Packaging from unknown snacks typically persists 400+ years if plastic",
  environmentalImpact: "Snack packaging is a leading source of flexible plastic litter worldwide.",
  potentialImpact: "When unsure, choose the option with the least packaging—you reduce plastic in both the environment and your body.",
  funFact: "Studies have found microplastics in honey, beer, salt, seafood, and bottled drinks—almost no food category is completely free of trace contamination."
};

var GENERIC_FALLBACK = {
  name: "Unknown Item",
  containsPlastic: "Unknown",
  containsPlasticDetail: "We couldn't identify this item. If it is a packaged snack, it may contain or contact microplastics from wrappers or processing.",
  plasticSources: ["Unknown—check if item is plastic or food packaged in plastic"],
  microplasticRisk: "Unknown",
  microplasticRiskDetail: "We couldn't find an exact match. Many everyday plastic and synthetic items shed microplastics through use, washing, heat, and disposal.",
  betterAlternatives: [
    "Choose natural materials (glass, metal, wood, cotton, wool) when possible",
    "Reduce single-use plastics",
    "Avoid heating food in plastic",
    "Wash synthetic fabrics less often or use a microfiber filter"
  ],
  howLongItLasts: "Most plastics take 20–1,000 years to break down; they never fully biodegrade",
  environmentalImpact: "Plastic production uses fossil fuels. Discarded items fragment into microplastics that contaminate soil, water, and food chains globally.",
  potentialImpact: "Every swap to a durable, non-plastic alternative reduces microplastic pollution in your home and the environment.",
  funFact: "The average person ingests about 5 grams of plastic per week—the equivalent of a credit card—mostly through food, water, and dust."
};
