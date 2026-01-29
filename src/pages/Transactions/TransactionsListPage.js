import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { format, fromUnixTime, subDays } from 'date-fns';

import GlobalBackTitle from '../../component-library/Global/GlobalBackTitle';
import GlobalLayout from '../../component-library/Global/GlobalLayout';
import GlobalText from '../../component-library/Global/GlobalText';
import GlobalSkeleton from '../../component-library/Global/GlobalSkeleton';
import CardButtonTransaction from '../../component-library/CardButton/CardButtonTransaction';
// Header ahora viene de LockSheet - no se usa aqui
// import Header from '../../component-library/Layout/Header';

// Altura del Header de LockSheet para compensar el espacio
const LOCKSHEET_HEADER_HEIGHT = 63;
import theme from '../../component-library/Global/theme';

import useAnalyticsEventTracker from '../../hooks/useAnalyticsEventTracker';
import { AppContext } from '../../AppProvider';
import { ROUTES_MAP } from './routes';
import { SECTIONS_MAP } from '../../utils/tracking';
import { useNavigation } from '../../routes/hooks';
import { withTranslation } from '../../hooks/useTranslations';

const styles = StyleSheet.create({
  dateStyle: {
    lineHeight: theme.gutters.padding3XL,
  },
  dateStyleFirst: {
    marginBottom: theme.gutters.paddingSM,
  },
  emptyStyle: {
    marginTop: 10,
  },
});

const TransactionsListPage = ({ t }) => {
  const pageSize = 10;

  const navigate = useNavigation();
  const onDetail = id => navigate(ROUTES_MAP.TRANSACTIONS_DETAIL, { id });

  const [{ activeBlockchainAccount }] = useContext(AppContext);
  const [transactions, setTransactions] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useAnalyticsEventTracker(SECTIONS_MAP.TRANSACTIONS_LIST);

  useEffect(() => {
    activeBlockchainAccount
      .getRecentTransactions({ pageSize })
      .then(({ data }) => {
        setTransactions(data);
      })
      .finally(() => setLoaded(true));
  }, [activeBlockchainAccount]);

  const showDate = (recTrans, i) => {
    let lastTransDate;
    i === 0
      ? (lastTransDate = null)
      : (lastTransDate = format(
          fromUnixTime(recTrans[i - 1].timestamp),
          'MMM d, yyyy',
        ));
    const thisTransDate = format(
      fromUnixTime(recTrans[i].timestamp),
      'MMM d, yyyy',
    );
    const yesterday = format(subDays(new Date(), 1), 'MMM d, yyyy');
    const today = format(new Date(), 'MMM d, yyyy');
    if (thisTransDate !== lastTransDate) {
      return thisTransDate === today
        ? t('transactions.today')
        : thisTransDate === yesterday
        ? t('transactions.yesterday')
        : thisTransDate;
    } else {
      return null;
    }
  };

  return (
    <GlobalLayout>
      <GlobalLayout.Header>
        <View style={{ height: LOCKSHEET_HEADER_HEIGHT }} />
        <GlobalBackTitle title={t('transactions.your_transactions')} />
        <View>
            {!loaded && <GlobalSkeleton type="ActivityList" />}
            {loaded &&
              transactions.length > 0 &&
              transactions.map((transaction, i) => (
                <View key={`transaction-${i}`}>
                  <GlobalText
                    type="body2"
                    color="secondary"
                    style={i === 0 ? styles.dateStyleFirst : styles.dateStyle}>
                    {showDate(transactions, i)}
                  </GlobalText>
                  <CardButtonTransaction
                    transaction={transaction}
                    onPress={() => onDetail(transaction.id)}
                  />
                </View>
              ))}
            {loaded && transactions.length === 0 && (
              <GlobalText
                type="body2"
                color="primary"
                numberOfLines={1}
                center="true"
                style={styles.emptyStyle}>
                {t('transactions.empty')}
              </GlobalText>
            )}
        </View>
      </GlobalLayout.Header>
    </GlobalLayout>
  );
};

export default withTranslation()(TransactionsListPage);
