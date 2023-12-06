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

    setMessages(GiftedChat.append([], initialMessages));

    // Real-time listener for Firestore messages
    const messagesQuery = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => {
        const data = { ...doc.data(), _id: doc.id };
        // Convert Firestore timestamp to JavaScript Date object
        if (data.createdAt?.seconds) {
          data.createdAt = new Date(data.createdAt.seconds * 1000);
        }
        return data;
      });

      // Update the state with the fetched messages
      setMessages(previousMessages => GiftedChat.append(fetchedMessages, previousMessages));
    });

    return () => unsubscribe(); // Cleanup the listener
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
