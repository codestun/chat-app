// Chat.js

import React, { useState, useEffect } from 'react';
import { GiftedChat } from "react-native-gifted-chat";
import { StyleSheet, View, Platform, KeyboardAvoidingView } from 'react-native';

const Chat = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const { name, backgroundColor } = route.params;

  const onSend = (newMessages = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
  };

  useEffect(() => {
    navigation.setOptions({ title: name });
    setMessages([
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
    ]);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: 1
        }}
        renderUsernameOnMessage
      />
      {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
      {/* KeyboardAvoidingView: Adjusts keyboard behavior for Android */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Chat;
