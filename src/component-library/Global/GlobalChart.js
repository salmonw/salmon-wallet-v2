import React from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

import theme from './theme';
import GlobalText from './GlobalText';
import GlobalSkeleton from './GlobalSkeleton';

const TIMEFRAMES = [
  { label: '1H', days: 1, hours: 1 },
  { label: '1D', days: 1 },
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: 'YTD', days: 'ytd' },
  // { label: 'ALL', days: 'max' }, // Disabled until paid CoinGecko tier
];

const formatCurrency = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

const formatLargeNumber = value => {
  if (value === null || value === undefined) return '-';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return formatCurrency(value);
};

const formatSupply = value => {
  if (value === null || value === undefined) return '-';
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toLocaleString();
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.gutters.paddingNormal,
  },
  priceContainer: {
    paddingHorizontal: theme.gutters.paddingNormal,
    marginBottom: theme.gutters.paddingSM,
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: theme.fontSize.fontSizeXL,
    fontFamily: theme.fonts.dmSansBold,
    color: theme.colors.labelPrimary,
  },
  priceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priceChangeText: {
    fontSize: theme.fontSize.fontSizeSM,
    fontFamily: theme.fonts.dmSansMedium,
  },
  priceChangeAmount: {
    marginRight: theme.gutters.paddingXS,
  },
  priceChangePercent: {
    paddingHorizontal: theme.gutters.paddingXS,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.borderRadiusXS,
  },
  priceChangePercentPositive: {
    backgroundColor: 'rgba(124, 255, 81, 0.2)',
  },
  priceChangePercentNegative: {
    backgroundColor: 'rgba(255, 25, 25, 0.2)',
  },
  positive: {
    color: theme.colors.positiveBright,
  },
  negative: {
    color: theme.colors.negativeBright,
  },
  chartContainer: {
    overflow: 'hidden',
    marginVertical: theme.gutters.paddingSM,
  },
  timeframeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.gutters.paddingNormal,
    marginTop: theme.gutters.paddingXS,
  },
  timeframeButton: {
    paddingVertical: theme.gutters.paddingXS,
    paddingHorizontal: theme.gutters.paddingSM,
    borderRadius: theme.borderRadius.borderRadiusPill,
    minWidth: 42,
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: theme.colors.bgLight,
  },
  timeframeText: {
    fontSize: theme.fontSize.fontSizeSM,
    color: theme.colors.labelTertiary,
  },
  timeframeTextActive: {
    color: theme.colors.labelPrimary,
    fontFamily: theme.fonts.dmSansMedium,
  },
  skeletonContainer: {
    height: 200,
    backgroundColor: theme.colors.bgLight,
    borderRadius: theme.borderRadius.borderRadiusMD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    marginTop: theme.gutters.paddingNormal,
    paddingHorizontal: theme.gutters.paddingNormal,
  },
  infoTitle: {
    fontSize: theme.fontSize.fontSizeNormal,
    fontFamily: theme.fonts.dmSansBold,
    color: theme.colors.labelPrimary,
    marginBottom: theme.gutters.paddingSM,
  },
  infoCard: {
    backgroundColor: theme.colors.bgLight,
    borderRadius: theme.borderRadius.borderRadiusMD,
    padding: theme.gutters.paddingNormal,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.gutters.paddingSM,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.bgPrimary,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: theme.fontSize.fontSizeSM,
    color: theme.colors.labelSecondary,
  },
  infoValue: {
    fontSize: theme.fontSize.fontSizeSM,
    fontFamily: theme.fonts.dmSansBold,
    color: theme.colors.labelPrimary,
  },
  aboutContainer: {
    marginTop: theme.gutters.paddingNormal,
  },
  aboutTitle: {
    fontSize: theme.fontSize.fontSizeNormal,
    fontFamily: theme.fonts.dmSansBold,
    color: theme.colors.labelPrimary,
    marginBottom: theme.gutters.paddingXS,
  },
  aboutText: {
    fontSize: theme.fontSize.fontSizeSM,
    color: theme.colors.labelSecondary,
    lineHeight: 20,
  },
});

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const date = new Date(data.timestamp);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      style={{
        backgroundColor: theme.colors.cards,
        padding: 8,
        borderRadius: 4,
        border: 'none',
      }}>
      <p
        style={{
          color: theme.colors.labelPrimary,
          fontSize: 12,
          fontFamily: theme.fonts.dmSansBold,
          margin: 0,
        }}>
        ${data.value?.toFixed(2)}
      </p>
      <p
        style={{
          color: theme.colors.labelSecondary,
          fontSize: 10,
          margin: 0,
          marginTop: 2,
        }}>
        {formattedDate}
      </p>
    </div>
  );
};

const GlobalChart = ({
  data,
  coinInfo,
  loading,
  error,
  selectedTimeframe,
  onTimeframeChange,
  showTimeframes = true,
}) => {
  const formatChartData = (prices, timeframe) => {
    if (!prices || !Array.isArray(prices) || prices.length === 0) {
      return [];
    }

    let filteredPrices = prices;

    // For 1H timeframe, filter to only last hour of data
    if (timeframe?.hours === 1) {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      filteredPrices = prices.filter(([timestamp]) => timestamp >= oneHourAgo);
    }

    return filteredPrices.map(([timestamp, value]) => ({
      timestamp,
      value,
    }));
  };

  const currentTimeframe = TIMEFRAMES.find(
    tf => tf.days === selectedTimeframe || tf.label === selectedTimeframe,
  );
  const chartData = formatChartData(data?.prices, currentTimeframe);

  const marketData = coinInfo?.marketData;
  const currentPrice = marketData?.currentPrice;
  const priceChange24h = marketData?.priceChange24h;
  const priceChangePercentage24h = marketData?.priceChangePercentage24h;
  const isPricePositive = priceChange24h >= 0;

  // Use 24h price change for chart color (consistent with badge)
  const chartColor = isPricePositive
    ? theme.colors.positiveBright
    : theme.colors.negativeBright;

  const renderPriceHeader = () => {
    if (!coinInfo) return null;

    return (
      <View style={styles.priceContainer}>
        <GlobalText style={styles.currentPrice}>
          {formatCurrency(currentPrice)}
        </GlobalText>
        <View style={styles.priceChangeContainer}>
          <GlobalText
            style={[
              styles.priceChangeText,
              styles.priceChangeAmount,
              isPricePositive ? styles.positive : styles.negative,
            ]}>
            {isPricePositive ? '+' : ''}
            {formatCurrency(priceChange24h)}
          </GlobalText>
          <View
            style={[
              styles.priceChangePercent,
              isPricePositive
                ? styles.priceChangePercentPositive
                : styles.priceChangePercentNegative,
            ]}>
            <GlobalText
              style={[
                styles.priceChangeText,
                isPricePositive ? styles.positive : styles.negative,
              ]}>
              {isPricePositive ? '+' : ''}
              {priceChangePercentage24h?.toFixed(1)}%
            </GlobalText>
          </View>
        </View>
      </View>
    );
  };

  const renderTimeframeSelector = () => (
    <View style={styles.timeframeContainer}>
      {TIMEFRAMES.map(({ label, days }) => {
        const isSelected =
          selectedTimeframe === days || selectedTimeframe === label;
        return (
          <TouchableOpacity
            key={label}
            style={[
              styles.timeframeButton,
              isSelected && styles.timeframeButtonActive,
            ]}
            onPress={() => onTimeframeChange(days)}>
            <GlobalText
              style={[
                styles.timeframeText,
                isSelected && styles.timeframeTextActive,
              ]}>
              {label}
            </GlobalText>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderInfoSection = () => {
    if (!coinInfo) return null;

    const infoItems = [
      { label: 'Name', value: coinInfo.name },
      { label: 'Symbol', value: coinInfo.symbol?.toUpperCase() },
      { label: 'Market Cap', value: formatLargeNumber(marketData?.marketCap) },
      { label: 'Total Supply', value: formatSupply(marketData?.totalSupply) },
      {
        label: 'Circulating Supply',
        value: formatSupply(marketData?.circulatingSupply),
      },
    ];

    return (
      <View style={styles.infoSection}>
        <GlobalText style={styles.infoTitle}>Info</GlobalText>
        <View style={styles.infoCard}>
          {infoItems.map(({ label, value }, index) => (
            <View
              key={label}
              style={[
                styles.infoRow,
                index === infoItems.length - 1 && styles.infoRowLast,
              ]}>
              <GlobalText style={styles.infoLabel}>{label}</GlobalText>
              <GlobalText style={styles.infoValue}>{value || '-'}</GlobalText>
            </View>
          ))}
        </View>
        {coinInfo.description && (
          <View style={styles.aboutContainer}>
            <GlobalText style={styles.aboutTitle}>About</GlobalText>
            <GlobalText style={styles.aboutText} numberOfLines={5}>
              {coinInfo.description.replace(/<[^>]*>/g, '')}
            </GlobalText>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.skeletonContainer}>
          <GlobalSkeleton type="Chart" />
        </View>
        {showTimeframes && renderTimeframeSelector()}
      </View>
    );
  }

  if (error || !chartData.length) {
    return null;
  }

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.min(screenWidth, 500);
  const chartHeight = 200;

  return (
    <View style={styles.container}>
      {renderPriceHeader()}
      <View style={styles.chartContainer}>
        <LineChart
          width={chartWidth}
          height={chartHeight}
          data={chartData}
          margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
          <XAxis dataKey="timestamp" hide />
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={chartColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: chartColor }}
          />
        </LineChart>
      </View>
      {showTimeframes && renderTimeframeSelector()}
      {renderInfoSection()}
    </View>
  );
};

export default GlobalChart;
