// App.js

import React from 'react';
// Import react Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Import the screens
import Start from './components/Start';
import Chat from './components/Chat';

// Create the navigator
const Stack = createNativeStackNavigator();

const App = () => {
  // Firebase configuration
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
  initializeApp(firebaseConfig);

  // Initialize Cloud Firestore and get a reference to the service
  const db = getFirestore();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen name="Chat">
          {props => <Chat {...props} db={db} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
