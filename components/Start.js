// Start.js

import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ImageBackground } from 'react-native';

const Start = ({ navigation }) => {
  return (
    // Background image for the Start screen
    <ImageBackground
      source={require('../assets/background-image.png')}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Text style={styles.appTitle}>Chat App</Text>
        <TextInput
          style={styles.input}
          placeholder='Enter your name'
        />
        <TouchableOpacity
          style={styles.startChatButton}
          onPress={() => navigation.navigate('Chat')}
        >
          <Text style={styles.buttonText}>Start Chatting</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    // Semi-transparent overlay for better text visibility
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  appTitle: {
    fontSize: 45,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(117, 112, 131, 0.5)',
    height: 50,
    padding: 10,
    width: '100%',
    marginBottom: 20,
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
