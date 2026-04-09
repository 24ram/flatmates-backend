/**
 * FLATMATE MATCHING ENGINE
 * Computes a 0–100 compatibility score between two users.
 *
 * Formula:
 *   score = 0.5 * lifestyle_score
 *         + 0.3 * budget_score
 *         + 0.1 * preferences_score
 *         + 0.1 * location_score
 */

/**
 * @param {object} userA - logged-in user
 * @param {object} userB - potential flatmate
 * @returns {{ score: number, explanation: string[] }}
 */
function computeCompatibility(userA, userB) {
  const reasons = [];

  // ─────────────────────────────────────────────
  // 1. LIFESTYLE SCORE (50%)
  // Factors: sleep_time, cleanliness, social_level
  // ─────────────────────────────────────────────
  const sleepDiff = Math.abs((userA.sleep_time || 22) - (userB.sleep_time || 22));
  const cleanDiff = Math.abs((userA.cleanliness || 3) - (userB.cleanliness || 3));
  const socialDiff = Math.abs((userA.social_level || 3) - (userB.social_level || 3));

  // sleep_time range: 0–23 → max diff = 12 (wraps around midnight)
  const sleepScore = 1 - Math.min(sleepDiff, 12) / 12;
  // cleanliness/social range: 1–5 → max diff = 4
  const cleanScore = 1 - cleanDiff / 4;
  const socialScore = 1 - socialDiff / 4;

  const lifestyleScore = (sleepScore * 0.4 + cleanScore * 0.3 + socialScore * 0.3) * 100;

  if (sleepScore > 0.8) reasons.push("You keep similar sleep schedules 🌙");
  if (cleanScore > 0.8) reasons.push("Similar cleanliness standards ✨");
  if (socialScore > 0.8) reasons.push("Matching social energy levels 🎉");

  // ─────────────────────────────────────────────
  // 2. BUDGET SCORE (30%)
  // Within 20% of each other = full score
  // ─────────────────────────────────────────────
  const budgetA = userA.budget || 10000;
  const budgetB = userB.budget || 10000;
  const maxBudget = Math.max(budgetA, budgetB);
  const budgetDiff = Math.abs(budgetA - budgetB);
  const budgetRatio = budgetDiff / maxBudget;

  // Within 20% → full score, beyond 80% diff → 0
  const budgetScore = Math.max(0, 1 - budgetRatio / 0.8) * 100;

  if (budgetRatio <= 0.1) reasons.push("Budgets match perfectly 💰");
  else if (budgetRatio <= 0.25) reasons.push("Budgets are close 💸");

  // ─────────────────────────────────────────────
  // 3. PREFERENCES SCORE (10%)
  // Smoking and pets compatibility
  // ─────────────────────────────────────────────
  let prefPoints = 0;
  const smokingA = userA.smoking === true || userA.smoking === "true";
  const smokingB = userB.smoking === true || userB.smoking === "true";
  const petsA = userA.pets === true || userA.pets === "true";
  const petsB = userB.pets === true || userB.pets === "true";

  if (smokingA === smokingB) {
    prefPoints += 50;
    if (!smokingA) reasons.push("Both non-smokers 🚭");
  }
  if (petsA === petsB) {
    prefPoints += 50;
    if (petsA) reasons.push("Both pet-friendly 🐾");
  }

  const prefScore = prefPoints;

  // ─────────────────────────────────────────────
  // 4. LOCATION SCORE (10%)
  // Same city = 100, else 0
  // ─────────────────────────────────────────────
  const cityA = (userA.city || "").toLowerCase().trim();
  const cityB = (userB.city || "").toLowerCase().trim();
  const locationScore = cityA && cityB && cityA === cityB ? 100 : 0;

  if (locationScore === 100) reasons.push(`Both in ${userA.city} 📍`);

  // ─────────────────────────────────────────────
  // FINAL WEIGHTED SCORE
  // ─────────────────────────────────────────────
  const finalScore = Math.round(
    0.50 * lifestyleScore +
    0.30 * budgetScore +
    0.10 * prefScore +
    0.10 * locationScore
  );

  // Clamp to 0–100
  const score = Math.max(0, Math.min(100, finalScore));

  // Fallback reason
  if (reasons.length === 0) reasons.push("Different lifestyles — worth exploring!");

  return {
    score,
    explanation: reasons.join(" · "),
  };
}

module.exports = { computeCompatibility };
