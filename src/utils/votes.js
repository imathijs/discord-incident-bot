function computePenaltyPoints(incidentData) {
  let penaltyPoints = 0;
  for (const v of Object.values(incidentData.votes)) {
    if (v.plus) penaltyPoints += 1;
    if (v.minus) penaltyPoints -= 1;
  }
  return penaltyPoints;
}

function buildTallyText(incidentData) {
  const catCount = { cat0: 0, cat1: 0, cat2: 0, cat3: 0, cat4: 0, cat5: 0 };
  const penaltyPoints = computePenaltyPoints(incidentData);
  for (const v of Object.values(incidentData.votes)) {
    if (v.category && catCount[v.category] !== undefined) catCount[v.category]++;
  }

  const lines = [
    `CAT0: ${catCount.cat0}`,
    `CAT1: ${catCount.cat1}`,
    `CAT2: ${catCount.cat2}`,
    `CAT3: ${catCount.cat3}`,
    `CAT4: ${catCount.cat4}`,
    `CAT5: ${catCount.cat5}`,
    ``,
    `Netto strafpunten: **${penaltyPoints}**`
  ];

  return lines.join('\n');
}

function mostVotedCategory(incidentData) {
  const counts = { cat0: 0, cat1: 0, cat2: 0, cat3: 0, cat4: 0, cat5: 0 };

  for (const v of Object.values(incidentData.votes)) {
    if (v.category && counts[v.category] !== undefined) counts[v.category]++;
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const [winner, votes] = sorted[0];
  if (!votes || votes === 0) return null;
  return winner;
}

module.exports = {
  buildTallyText,
  computePenaltyPoints,
  mostVotedCategory
};
