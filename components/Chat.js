// Chat.js

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const Chat = () => {
  return (
    <View style={styles.container}>
      <Text>Hello Chat!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default Chat;
