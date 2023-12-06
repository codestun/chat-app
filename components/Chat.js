// Chat.js

import React, { useState, useEffect } from 'react';
import { GiftedChat } from "react-native-gifted-chat";
import { StyleSheet, View, Platform, KeyboardAvoidingView } from 'react-native';
import { collection, query, orderBy, onSnapshot, addDoc } from "firebase/firestore";

const Chat = ({ route, navigation, db }) => {
  const [messages, setMessages] = useState([]);
  const { name, backgroundColor } = route.params;

  // Function to handle sending messages to Firestore
  const onSend = (newMessages = []) => {
    addDoc(collection(db, "messages"), newMessages[0]);
  };

  useEffect(() => {
    navigation.setOptions({ title: name });

    // Initial welcome and status messages
    const initialMessages = [
      {
        _id: 1,
        text: "Hello developer",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "React Native",
          avatar: "https://placeimg.com/140/140/any",
        },
      },
      {
        _id: 2,
        text: `${name} has entered the chat`,
        createdAt: new Date(),
        system: true,
      },
    ];

    // Query to fetch messages from Firestore, ordered by creation time
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsubMessages = onSnapshot(q, (snapshot) => {
      let newMessages = [];
      snapshot.forEach(doc => {
        const firebaseData = doc.data();

        // Converting the Firestore Timestamp to JavaScript Date object
        const createdAt = firebaseData.createdAt ? new Date(firebaseData.createdAt.seconds * 1000) : new Date();

        // Structure the message in the format expected by GiftedChat
        newMessages.push({
          _id: doc.id,
          text: firebaseData.text,
          createdAt: createdAt,
          user: firebaseData.user
        });
      });

      // Set the fetched messages, keeping initial messages at the beginning
      setMessages(GiftedChat.append(initialMessages, newMessages));
    });

    return () => {
      if (unsubMessages) unsubMessages();
    }
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{ _id: 1 }}
        renderUsernameOnMessage
      />
      {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Chat;
