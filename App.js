// App.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Import the screens
import Start from './components/Start';
import Chat from './components/Chat';

// Import react Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';

// Create the navigator
const Stack = createNativeStackNavigator();

const App = () => {
  // My web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCtAWPqWSTfT9jONiKqMbuC8QpXnDZViE4",
    authDomain: "chatapp-a8044.firebaseapp.com",
    projectId: "chatapp-a8044",
    storageBucket: "chatapp-a8044.appspot.com",
    messagingSenderId: "183337411955",
    appId: "1:183337411955:web:ba1bab39d58b03f8b39106",
    measurementId: "G-6CL7E8CT84"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Initialize Cloud Firestore and get a reference to the service
  const db = getFirestore(app);

  const [text, setText] = useState('');

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen
          name="Start"
          component={Start}
        />
        <Stack.Screen
          name="Chat"
          component={Chat}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textInput: {
    width: '88%',
    borderWidth: 1,
    height: 50,
    padding: 10
  },
  textDisplay: {
    height: 50,
    lineHeight: 50
  }
});

export default App;
