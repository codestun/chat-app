// Start.js

import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';

const Start = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>Chat App</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder='Enter your name'
        />
      </View>
      <TouchableOpacity
        style={styles.startChatButton}
        onPress={() => navigation.navigate('Chat')}
      >
        <Text style={styles.buttonText}>Start Chatting</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#8A95A5',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  appTitle: {
    fontSize: 45,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(117, 112, 131, 0.5)',
    height: 50,
    padding: 10,
    marginTop: 5,
    width: '100%',
  },
  startChatButton: {
    backgroundColor: '#757083',
    padding: 15,
    borderRadius: 0,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default Start;
