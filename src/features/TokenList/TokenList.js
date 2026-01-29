import React from 'react';
import get from 'lodash-es/get';
import isNil from 'lodash-es/isNil';
import round from 'lodash-es/round';
import CardButton from '../../component-library/CardButton/CardButton';
import GlobalSkeleton from '../../component-library/Global/GlobalSkeleton';
import AvatarImage from '../../component-library/Image/AvatarImage';
import {
  hiddenValue,
  showAmount,
  isPositive,
} from '../../utils/amount';

const TokenList = ({ loading, tokens, onDetail, hiddenBalance }) => {
  if (loading) {
    return <GlobalSkeleton type="TokenList" />;
  }
  return (
    <List tokens={tokens} onDetail={onDetail} hiddenBalance={hiddenBalance} />
  );
};

// Format the price to display like "$ 131.28"
const formatTokenPrice = price => {
  if (isNil(price)) return null;
  return `$ ${round(price, 2).toFixed(2)}`;
};

// Format the change percentage
const formatChange = perc => {
  if (isNil(perc)) return null;
  const percValue = round(isNaN(perc) ? 0 : perc, 2).toFixed(1);
  const sign = isPositive(perc) ? '+' : '';
  return `${sign}${percValue}%`;
};

// Calculate the change value in USD
const formatChangeValue = (perc, usdBalance) => {
  if (isNil(perc) || isNil(usdBalance)) return null;
  const changeAmount = Math.abs((perc / 100) * usdBalance);
  const sign = isPositive(perc) ? '+' : '-';
  return `${sign}$${round(changeAmount, 2).toFixed(2)}`;
};

const List = ({ tokens, onDetail, hiddenBalance }) => (
  <>
    {tokens.map(t => {
      const perc = get(t, 'last24HoursChange.perc');
      const tokenPrice = get(t, 'last24HoursChange.usd') || t.price;

      return (
        <CardButton
          key={t.address}
          onPress={() => onDetail(t)}
          tokenCard
          icon={<AvatarImage url={t.logo} size={44} />}
          title={t.name}
          tokenPrice={formatTokenPrice(tokenPrice)}
          tokenChange={formatChange(perc)}
          tokenChangeValue={formatChangeValue(perc, t.usdBalance)}
          tokenUsdValue={hiddenBalance ? hiddenValue : showAmount(t.usdBalance)}
          tokenAmount={
            hiddenBalance
              ? hiddenValue
              : `${t.uiAmount} ${t.symbol || ''}`
          }
        />
      );
    })}
  </>
);

export default TokenList;
