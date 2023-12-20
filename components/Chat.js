// Chat.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, InputToolbar } from "react-native-gifted-chat";
import { collection, query, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomActions from './CustomActions';

const Chat = ({ route, navigation, db, storage, isConnected }) => {
  const [messages, setMessages] = useState([]);
  const { name, backgroundColor, userId } = route.params;

  // Sends messages to Firestore
  const onSend = (newMessages = []) => newMessages.forEach(msg => addDoc(collection(db, "messages"), { ...msg, user: { _id: userId, name }, createdAt: new Date(msg.createdAt) }));

  // Renders custom action button for additional functionalities
  const renderCustomActions = (props) => <CustomActions {...props} storage={storage} onSend={onSend} />;

  // Conditionally renders the input toolbar based on network connectivity
  const renderInputToolbar = (props) => isConnected ? <InputToolbar {...props} /> : null;

  useEffect(() => {
    navigation.setOptions({ title: name });

    const initialMessages = [{ _id: 2, text: `${name} has entered the chat`, createdAt: new Date(), system: true }];

    const unsubscribe = isConnected ? setupFirestoreListener() : loadMessagesFromStorage();

    return unsubscribe;

    function setupFirestoreListener() {
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      return onSnapshot(q, (snapshot) => {
        const newMessages = snapshot.docs.map(doc => {
          const data = doc.data();
          return { _id: doc.id, text: data.text, createdAt: new Date(data.createdAt.seconds * 1000), user: data.user, ...(data.image && { image: data.image }) };
        });
        AsyncStorage.setItem('messages', JSON.stringify(newMessages));
        setMessages(GiftedChat.append(initialMessages, newMessages));
      });
    }

    async function loadMessagesFromStorage() {
      const storedMessages = await AsyncStorage.getItem('messages');
      if (storedMessages) setMessages(JSON.parse(storedMessages));
    }
  }, [isConnected, db, route.params]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <GiftedChat messages={messages} onSend={onSend} user={{ _id: userId, name }} renderUsernameOnMessage renderInputToolbar={renderInputToolbar} renderActions={renderCustomActions} />
      {Platform.OS === 'android' && <KeyboardAvoidingView behavior="height" />}
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1 } });

export default Chat;
