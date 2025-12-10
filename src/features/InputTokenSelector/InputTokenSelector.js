import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';

import { withTranslation } from '../../hooks/useTranslations';
import { hiddenValue } from '../../utils/amount';

import GlobalLayout from '../../component-library/Global/GlobalLayout';
import GlobalBackTitle from '../../component-library/Global/GlobalBackTitle';
import CardButton from '../../component-library/CardButton/CardButton';
import GlobalImage from '../../component-library/Global/GlobalImage';
import GlobalInput from '../../component-library/Global/GlobalInput';
import GlobalPadding from '../../component-library/Global/GlobalPadding';
import GlobalInputWithButton from '../../component-library/Global/GlobalInputWithButton';
import GlobalButton from '../../component-library/Global/GlobalButton';
import theme from '../../component-library/Global/theme';
import { getShortAddress } from '../../utils/wallet';
import { isNative } from '../../utils/platform';

const MAX_PAG = 20;
const getFilterItems = (items, search) =>
  search.length >= 3
    ? items.filter(
        t =>
          (t.name || '').toLowerCase().includes(search.toLowerCase()) ||
          (t.symbol || '').toLowerCase().includes(search.toLowerCase()),
      )
    : items;

const styles = StyleSheet.create({
  ddToken: {
    flex: isNative() ? 0.7 : undefined,
  },
  chipsToken: {
    flex: isNative() ? 0.7 : undefined,
    marginVertical: theme.gutters.paddingXS,
  },
  buttonPadding: {
    paddingRight: 0,
    paddingLeft: 6,
  },
  featuredTokensContainer: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'space-between',
  },
  featuredTokenButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledToken: {
    opacity: 0.4,
  },
});

const InputWithTokenSelector = ({
  params,
  value,
  setValue,
  placeholder,
  image,
  title,
  description,
  t,
  hiddenBalance,
  tokens,
  featuredTokens,
  chips,
  onChange = () => {},
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchToken, setSearchToken] = useState('');
  const [drawedList, setDrawedList] = useState([]);
  const filteredTokens = useMemo(
    () => getFilterItems(tokens, searchToken),
    [tokens, searchToken],
  );
  useEffect(() => {
    if (filteredTokens.length > MAX_PAG) {
      setDrawedList(filteredTokens.slice(0, MAX_PAG));
    } else {
      setDrawedList(filteredTokens);
    }
  }, [filteredTokens]);
  const onSelect = token => {
    onChange(token);
    setIsVisible(false);
  };
  const onViewMore = () => {
    setDrawedList([
      ...drawedList,
      ...filteredTokens.slice(drawedList.length, drawedList.length + MAX_PAG),
    ]);
  };
  return (
    <>
      <GlobalInputWithButton
        value={value}
        setValue={setValue}
        placeholder={placeholder}
        inputStyle={chips ? styles.chipsToken : styles.ddToken}
        action={
          <CardButton
            type="secondary"
            size="sm"
            title={title}
            description={description}
            image={image}
            imageSize="xs"
            actionIcon="disclose"
            onPress={() => setIsVisible(true)}
            buttonStyle={styles.buttonPadding}
            imageStyle={description && { marginTop: theme.gutters.paddingXS }}
            keyboardType="numeric"
            nospace
          />
        }
        {...props}
      />

      <Modal
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
        visible={isVisible}>
        <GlobalLayout
          fullscreen
          style={{ backgroundColor: theme.colors.bgDarken }}>
          <GlobalLayout.Header>
            <GlobalBackTitle
              onBack={() => setIsVisible(false)}
              title={t('wallet.select_token')}
            />
            <GlobalInput
              forSearch
              placeholder={t('actions.search_placeholder')}
              value={searchToken}
              setValue={setSearchToken}
            />
            <GlobalPadding />
            {featuredTokens && (
              <View style={styles.featuredTokensContainer}>
                {featuredTokens?.map(token => (
                  <TouchableOpacity
                    key={token.mint || token.address || token.symbol}
                    onPress={() => onSelect(token)}
                    style={styles.featuredTokenButton}>
                    <GlobalImage url={token.logo} size="md" circle />
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <GlobalPadding />
            {drawedList.map(token => {
              const hasBalance = token.uiAmount > 0;
              const tokenLogo = token.logo || token.image;
              return (
                <CardButton
                  key={token.mint || token.address || token.symbol}
                  onPress={() => onSelect(token)}
                  disabled={!hasBalance}
                  icon={<GlobalImage url={tokenLogo} size="md" circle />}
                  title={
                    token.name || getShortAddress(token.mint || token.address)
                  }
                  description={
                    hasBalance
                      ? `${hiddenBalance ? hiddenValue : token.uiAmount} ${
                          token.symbol || ''
                        }`
                      : token.symbol
                  }
                  chip={chips && token?.network?.toUpperCase()}
                  buttonStyle={!hasBalance && styles.disabledToken}
                />
              );
            })}
          </GlobalLayout.Header>

          <GlobalLayout.Footer>
            {tokens.length > MAX_PAG && (
              <>
                <GlobalButton
                  type="default"
                  wideSmall
                  onPress={onViewMore}
                  title={t('actions.view_more')}
                  disabled={filteredTokens.length <= drawedList.length}
                />
                <GlobalPadding size="xs" />
              </>
            )}
            <GlobalButton
              type="primary"
              wideSmall
              onPress={() => setIsVisible(false)}
              title={t('actions.close')}
            />
          </GlobalLayout.Footer>
        </GlobalLayout>
      </Modal>
    </>
  );
};

export default withTranslation()(InputWithTokenSelector);
