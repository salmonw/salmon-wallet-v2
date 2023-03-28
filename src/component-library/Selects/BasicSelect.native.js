import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Menu } from 'react-native-paper';
import GlobalImage from '../../component-library/Global/GlobalImage';
import IconBalanceDown from '../../assets/images/IconBalanceDown.png';
import theme, { globalStyles } from '../../component-library/Global/theme';

const styles = StyleSheet.create({
  iconDown: {
    marginLeft: theme.gutters.paddingNormal,
    tintColor: theme.colors.labelPrimary,
  },
  selected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.gutters.paddingXS,
  },
});
const BasicSelect = ({ value, setValue, options, style, disabled }) => {
  const [showDropDown, setShowDropDown] = useState(false);
  const [selectedOption, setSelectedOption] = useState(
    options.filter(opt => opt.value === value)[0].custom,
  );

  const handleChange = option => {
    setValue(option.value);
    setSelectedOption(option.custom);
    setShowDropDown(false);
  };

  return (
    <View style={style}>
      <Menu
        visible={!disabled && showDropDown}
        onDismiss={() => setShowDropDown(false)}
        anchor={
          <TouchableOpacity
            onPress={() => setShowDropDown(true)}
            style={globalStyles.inline}>
            <View style={[styles.selected, globalStyles.inline]}>
              {selectedOption}
              <GlobalImage
                source={IconBalanceDown}
                size="xxxs"
                style={styles.iconDown}
              />
            </View>
          </TouchableOpacity>
        }>
        {options.map(option => (
          <Menu.Item
            key={`option-${option.value}`}
            value={option.value}
            title={option.custom || option.label}
            onPress={() => handleChange(option)}
          />
        ))}
      </Menu>
    </View>
  );
};

export default BasicSelect;
