function createSnackTemplate({ id, keywords, name, containsPlastic = "Possible" }) {
  return {
    id,
    keywords,
    name,
    containsPlastic,
    containsPlasticDetail: `[Template] Describe whether ${name} contains plastic and why.`,
    plasticSources: ["[Template] Packaging source", "[Template] Processing or ingredient source"],
    microplasticRisk: "[Template]",
    microplasticRiskDetail: `[Template] Explain the microplastic risk level for ${name}.`,
    betterAlternatives: [
      `[Template] Better alternative 1 for ${name}`,
      `[Template] Better alternative 2 for ${name}`,
      `[Template] Better alternative 3 for ${name}`
    ],
    howLongItLasts: `[Template] How long ${name} or its packaging persists in the environment.`,
    environmentalImpact: `[Template] Environmental impact of ${name}.`,
    potentialImpact: `[Template] Personal or collective impact if people switch away from ${name}.`,
    funFact: `[Template] Add an interesting fact about ${name} and microplastics.`
  };
}

function createItemTemplate({ id, keywords, name, microplasticRisk = "[Template]" }) {
  return {
    id,
    keywords,
    name,
    microplasticRisk,
    microplasticRiskDetail: `[Template] Explain the microplastic risk for ${name}.`,
    betterAlternatives: [
      `[Template] Better alternative 1 for ${name}`,
      `[Template] Better alternative 2 for ${name}`,
      `[Template] Better alternative 3 for ${name}`
    ],
    howLongItLasts: `[Template] How long ${name} lasts in the environment.`,
    environmentalImpact: `[Template] Environmental impact of ${name}.`,
    potentialImpact: `[Template] Potential impact of choosing alternatives to ${name}.`,
    funFact: `[Template] Add an interesting fact about ${name} and microplastics.`
  };
}
