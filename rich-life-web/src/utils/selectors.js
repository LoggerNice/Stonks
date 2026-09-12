export function getActivityCost(activity) {
  return Math.floor(activity.baseCost * Math.pow(1.18, activity.level));
}

export function getActivityIncome(activity) {
  return activity.baseIncomePerSecond * activity.level;
}

export function getBusinessIncome(business) {
  if (!Array.isArray(business.activities)) {
    return 0;
  }

  return business.activities.reduce(
    (sum, activity) => sum + getActivityIncome(activity),
    0
  );
}

export function getBusinessTotalLevel(business) {
  if (!Array.isArray(business.activities)) {
    return 0;
  }

  return business.activities.reduce(
    (sum, activity) => sum + activity.level,
    0
  );
}

function getAllExclusiveItems(exclusives) {
  if (!exclusives || typeof exclusives !== 'object') {
    return [];
  }

  return Object.values(exclusives).flatMap((collection) =>
    Array.isArray(collection.items) ? collection.items : []
  );
}

export function getIncomeMultiplier(exclusives) {
  const items = getAllExclusiveItems(exclusives);

  return items.reduce((acc, item) => {
    if (item.owned && item.incomeMultiplier) {
      return acc * item.incomeMultiplier;
    }

    return acc;
  }, 1);
}

export function getClickPower(exclusives) {
  const items = getAllExclusiveItems(exclusives);

  return items.reduce((acc, item) => {
    if (item.owned && item.clickBonus) {
      return acc + item.clickBonus;
    }

    return acc;
  }, 1);
}

export function getTotalIncomePerSecond(state) {
  const businessIncome = state.businesses.reduce(
    (sum, business) => sum + getBusinessIncome(business),
    0
  );

  const dividendIncome = state.assets.reduce(
    (sum, asset) => sum + asset.quantity * asset.dividendPerSecond,
    0
  );

  return (
    businessIncome * getIncomeMultiplier(state.exclusives) + dividendIncome
  );
}

export function getPortfolioValue(state) {
  return state.assets.reduce(
    (sum, asset) => sum + asset.quantity * asset.price,
    0
  );
}