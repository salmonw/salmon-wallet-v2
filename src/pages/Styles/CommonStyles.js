import { StyleSheet } from 'react-native';
import theme from '../../component-library/Global/theme';

const isExtension = process.env.REACT_APP_IS_EXTENSION || false;

const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignSelf: 'center',
    paddingHorizontal: theme.gutters.paddingSM,
    paddingVertical: isExtension ? 10 : 40,
    maxWidth: theme.variables.mobileWidthLG,
    width: '100%',
    minHeight: '100%',
  },
});

export default commonStyles;
