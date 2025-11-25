import React from 'react';
import { TextInput } from 'react-native';

const GlobalTextInput = ({ ref, onEnter, ...props }) => {
  const handleKeyPress = e => {
    if (onEnter && e.key === 'Enter') onEnter();
  };
  return <TextInput ref={ref} onKeyPress={handleKeyPress} {...props} />;
};

export default GlobalTextInput;
