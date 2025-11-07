import React from 'react';
import { View, StyleSheet } from 'react-native';

const createStyles = (spacing, columns) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: -(8 * spacing),
      marginLeft: -(8 * spacing),
    },
    item: {
      paddingTop: 8 * spacing,
      paddingLeft: 8 * spacing,
      width: `${100 / columns}%`,
    },
  });

const Grid = ({ items = [], spacing = 12, columns = 1 }) => {
  const styles = createStyles(spacing, columns);
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View key={index} style={styles.item}>
          {item}
        </View>
      ))}
    </View>
  );
};

export default Grid;
