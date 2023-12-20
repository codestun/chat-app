// CustomActions.js

import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const CustomActions = ({ storage }) => {
  return (
    <TouchableOpacity style={{ marginBottom: 10, marginLeft: 10 }}>
      <Text style={{ color: 'blue' }}>+</Text>
    </TouchableOpacity>
  );
};

export default CustomActions;
