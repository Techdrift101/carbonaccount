import joi from "joi";

// Interest rate band for carbon-linked lending (percent).
// An account with no reduction pays BASE_INTEREST_RATE; an account that has
// reached net zero (reduction >= baseline) pays MIN_INTEREST_RATE.
export const BASE_INTEREST_RATE = 8.0;
export const MIN_INTEREST_RATE = 2.0;

const accountSchema = joi.object({
  id: joi.string().required(),
  sort_code: joi.string().required(),
  account_number: joi.number().required(),
  balance: joi.number().required(),

  // Annual emissions when the account was opened, in tonnes CO2e.
  // Defaults to 0 so existing records without it still validate.
  baseline_emissions: joi.number().min(0).default(0),

  // Total reduction achieved against the baseline, in tonnes CO2e.
  // Defaults to 0 so existing records without it still validate.
  net_carbon_reduction: joi.number().min(0).default(0),

  // Calculated by the API, never accepted from the client.
  net_zero_progress: joi.any().strip(),
  interest_rate: joi.any().strip(),
});

// Fraction of the way to net zero, from 0 (no reduction) to 1 (net zero).
function progressToNetZero(baseline, reduction) {
  if (!baseline || baseline <= 0) return 0;
  return Math.min(reduction / baseline, 1);
}

// Adds the calculated fields to an account. Also fills in defaults for
// records saved before the carbon fields existed.
export function withCarbonFields(account) {
  const baseline_emissions = account.baseline_emissions ?? 0;
  const net_carbon_reduction = account.net_carbon_reduction ?? 0;
  const progress = progressToNetZero(baseline_emissions, net_carbon_reduction);
  const rate =
    BASE_INTEREST_RATE - (BASE_INTEREST_RATE - MIN_INTEREST_RATE) * progress;

  return {
    ...account,
    baseline_emissions,
    net_carbon_reduction,
    net_zero_progress: Math.round(progress * 10000) / 100, // percent, 2 dp
    interest_rate: Math.round(rate * 100) / 100, // percent, 2 dp
  };
}

export default accountSchema;
