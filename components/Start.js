// Start.js

import React, { useState } from 'react';
import { ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { getAuth, signInAnonymously } from 'firebase/auth'; // Import Firebase authentication functions

const Start = ({ navigation }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#090C08'); // Default color
  const auth = getAuth(); // Initialize Firebase Authentication

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const colors = ['#090C08', '#474056', '#8A95A5', '#B9C6AE'];

  // Function to handle anonymous sign-in
  const signInUser = () => {
    signInAnonymously(auth)
      .then((result) => {
        // Check if user is logged in (user will have a UID)
        if (result.user && result.user.uid) {
          // Navigate to the Chat screen with user parameters
          navigation.navigate('Chat', { userId: result.user.uid, name: name, backgroundColor: selectedColor });
          // Display success message
          Alert.alert("Signed in Successfully!");
        }
      })
      .catch((error) => {
        console.error('Error signing in anonymously:', error);
        Alert.alert("Unable to sign in, try again later.");
      });
  };


  return (
    // Background image for the Start screen
    <ImageBackground
      source={require('../assets/background-image.png')}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        {/* App title */}
        <Text style={styles.appTitle}>Chat App</Text>

        {/* Separate container for grouping color options, text input, and button */}
        <View style={styles.contentContainer}>
          {/* Text input for user's name */}
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your Name"
          />

          {/* Color options */}
          <View style={styles.colorOptions}>
            <Text style={styles.chooseColorText}>Choose Background Color:</Text>
            <View style={styles.colorOptionRow}>
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    selectedColor === color ? styles.colorOptionHighlighted : styles.colorOption,
                    { backgroundColor: color },
                  ]}
                  onPress={() => handleColorChange(color)}
                />
              ))}
            </View>
          </View>

          {/* Button to start chatting and navigate to the Chat screen */}
          <TouchableOpacity
            style={styles.startChatButton}
            onPress={signInUser} // Call the signInUser function
          >
            <Text style={styles.buttonText}>Start Chatting</Text>
          </TouchableOpacity>
        </View>

        {/* KeyboardAvoidingView to handle keyboard behavior */}
        {Platform.OS === 'ios' ? (
          <KeyboardAvoidingView behavior="padding">
            {/* Add a space to avoid covering the Text Input */}
            <View style={styles.keyboardSpacer} />
          </KeyboardAvoidingView>
        ) : null}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  appTitle: {
    flex: 1,
    fontSize: 45,
    fontWeight: '600',
    color: '#FFFFFF',
    alignSelf: 'center',
    marginTop: 120,
  },
  contentContainer: {
    width: '88%',
    height: '44%',
    alignItems: 'center', // Center the content horizontally
    backgroundColor: '#FFFFFF',
    borderRadius: 5, // Add some border radius for a rounded look,
    padding: 6,
    justifyContent: 'space-evenly',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(117, 112, 131, 0.5)',
    height: 50,
    padding: 10,
    borderRadius: 5,
    width: '88%',
    fontSize: 16,
    fontWeight: '300',
    color: 'rgba(117, 112, 131, 0.5)',
  },
  colorOptions: {
    width: '88%',
  },
  chooseColorText: {
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    marginBottom: 10,
    opacity: 1, // 100% opacity
  },
  colorOptionRow: {
    flexDirection: 'row',
    alignItems: 'center', // Align color options vertically
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  colorOptionHighlighted: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginHorizontal: 5,
    borderColor: '#757083',
    borderWidth: 4,
  },
  startChatButton: {
    backgroundColor: '#757083',
    padding: 20,
    borderRadius: 5,
    alignItems: 'center',
    width: '88%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  keyboardSpacer: {
    height: 30,
  },
});

export default Start;
