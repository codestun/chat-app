// App.js

import React, { useEffect } from 'react'; // Import useEffect for side effects
// Import react Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { enableNetwork, disableNetwork } from "firebase/firestore"; // Import Firestore functions
import { useNetInfo } from "@react-native-community/netinfo"; // Import useNetInfo for network detection

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
  const db = getFirestore();  // Get a reference to Firestore

  const netInfo = useNetInfo(); // Use useNetInfo to monitor network status

  useEffect(() => {
    // This effect runs when netInfo.isConnected changes
    if (netInfo.isConnected) {
      enableNetwork(db);
    } else {
      disableNetwork(db);
    }
  }, [netInfo.isConnected]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen name="Chat">
          {props => <Chat {...props} db={db} isConnected={netInfo.isConnected} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
