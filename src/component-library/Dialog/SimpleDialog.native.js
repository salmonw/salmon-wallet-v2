import React from 'react';
import { View } from 'react-native';
// LINT FIX - theme no usado
// import theme, { globalStyles } from '../../component-library/Global/theme';
import { globalStyles } from '../../component-library/Global/theme';
import { withTranslation } from '../../hooks/useTranslations';
import GlobalButton from '../Global/GlobalButton';
import GlobalPadding from '../Global/GlobalPadding';

import { Paragraph, Dialog, Portal } from 'react-native-paper';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: 'rgba(22,28,45, 0.9)',
  },
  title: {
    textAlign: 'center',
  },
  paragraph: {
    textAlign: 'center',
  },
});

const SimpleDialog = ({
  type,
  title,
  onClose,
  isOpen,
  action,
  text,
  btn1Title,
  btn2Title,
  t,
}) => (
  <Portal>
    <Dialog visible={isOpen} onDismiss={onClose} style={styles.dialog}>
      <Dialog.Title style={styles.title}>{title}</Dialog.Title>
      <Dialog.Content>
        <Paragraph style={styles.paragraph}>{text}</Paragraph>
        {action && (
          <View>
            <GlobalPadding size="sm" />

            <GlobalButton
              type={type || 'primary'}
              flex
              title={btn1Title}
              onPress={action}
              style={[globalStyles.button, globalStyles.buttonRight]}
              touchableStyles={globalStyles.buttonTouchable}
            />
            <GlobalPadding size="4xl" />
            <GlobalButton
              type="secondary"
              flex
              title={btn2Title}
              onPress={onClose}
              style={[globalStyles.button, globalStyles.buttonRight]}
              touchableStyles={globalStyles.buttonTouchable}
            />
            <GlobalPadding size="2xl" />
          </View>
        )}
      </Dialog.Content>
    </Dialog>
  </Portal>
);

export default withTranslation()(SimpleDialog);
