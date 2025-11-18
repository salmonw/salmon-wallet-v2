const { formatUnits, parseUnits } = require('ethers');

const parseAmount = (amount, decimals) => {
  if (decimals) {
    const value =
      typeof amount === 'number' ? amount.toFixed(decimals) : `${amount}`;
    return parseUnits(value, decimals);
  } else {
    return amount;
  }
};

const formatAmount = (amount, decimals) => {
  if (decimals) {
    const value = typeof amount === 'number' ? amount.toFixed(0) : `${amount}`;
    return formatUnits(value, decimals);
  } else {
    return amount;
  }
};

module.exports = { parseAmount, formatAmount };
