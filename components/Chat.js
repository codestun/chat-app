// Chat.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, KeyboardAvoidingView, TouchableOpacity, Text, ActionSheetIOS } from 'react-native';
import { GiftedChat, InputToolbar } from "react-native-gifted-chat";
import { collection, query, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomActions from './CustomActions';

const Chat = ({ route, navigation, db, storage, isConnected }) => {
  const [messages, setMessages] = useState([]);
  const { name, backgroundColor, userId } = route.params;

  // Function to handle sending messages to Firestore
  const onSend = (newMessages = []) => {
    if (newMessages.length > 0) {
      const messageToSend = {
        ...newMessages[0],
        user: {
          _id: userId,
          name: name
        },
        createdAt: new Date() // Set the current date/time as createdAt
      };
      addDoc(collection(db, "messages"), messageToSend);
    }
  };

  // Function to conditionally render the InputToolbar
  const renderInputToolbar = (props) => {
    // Only render InputToolbar if there is a network connection
    if (isConnected) {
      return (
        <InputToolbar {...props}>
          <TouchableOpacity onPress={showActionSheet} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>+</Text>
          </TouchableOpacity>
        </InputToolbar>
      );
    } else return null;
  };

  // Function to show ActionSheet
  const showActionSheet = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "Send Image", "Send Location"],
        cancelButtonIndex: 0,
      },
      buttonIndex => {
        if (buttonIndex === 1) {
          // Logic for choosing image from library or taking a photo
        } else if (buttonIndex === 2) {
          // Logic for sharing location
        }
      },
    );
  };

  // Custom Actions render function
  const renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  let unsubMessages; // Declare outside useEffect

  useEffect(() => {
    navigation.setOptions({ title: name });

    // Initial welcome and status messages
    const initialMessages = [
      {
        _id: 2,
        text: `${name} has entered the chat`,
        createdAt: new Date(),
        system: true,
      },
    ];

    if (isConnected) {
      // Unregister current onSnapshot listener to avoid multiple listeners
      if (unsubMessages) unsubMessages();
      unsubMessages = null;

      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      unsubMessages = onSnapshot(q, (snapshot) => {
        let newMessages = [];
        snapshot.forEach(doc => { // Ensure data structure aligns with GiftedChat
          const firebaseData = doc.data();

          // Converting the Firestore Timestamp to JavaScript Date object
          const createdAt = firebaseData.createdAt ? new Date(firebaseData.createdAt.seconds * 1000) : new Date();

          // Structure the message in the format expected by GiftedChat
          newMessages.push({
            _id: doc.id,
            text: firebaseData.text,
            createdAt,
            user: firebaseData.user
          });
        });

        // Cache the new messages
        AsyncStorage.setItem('messages', JSON.stringify(newMessages));

        setMessages(GiftedChat.append(initialMessages, newMessages));
      });
    } else {
      // If not connected, load messages from AsyncStorage
      AsyncStorage.getItem('messages').then(storedMessages => {
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages));
        }
      });
    }
    // Cleanup function
    return () => {
      if (unsubMessages) unsubMessages(); // Unsubscribe from Firestore updates
    };
  }, [isConnected, db, route.params]); // Add dependencies

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{ _id: userId, name: name }}
        renderUsernameOnMessage
        renderInputToolbar={renderInputToolbar} // Use the custom InputToolbar rendering function
        renderActions={renderCustomActions} // Add renderActions prop to GiftedChat
      />
      {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionButton: {
    marginLeft: 10,
    marginBottom: 10,
  },
  actionButtonText: {
    color: 'blue',
    fontSize: 16,
  },
});

export default Chat;
