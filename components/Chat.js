// Chat.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, InputToolbar } from "react-native-gifted-chat";
import { collection, query, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomActions from './CustomActions';
import MapView from 'react-native-maps';
import { Audio } from 'expo-av';

const Chat = ({ route, navigation, db, storage, isConnected }) => {
  const [messages, setMessages] = useState([]);
  const { name, backgroundColor, userId } = route.params;
  let soundObject = null; // Declare a variable to hold the sound object

  // Sends messages to Firestore
  const onSend = (newMessages = []) => {
    newMessages.forEach(msg => {
      addDoc(collection(db, "messages"), { ...msg, user: { _id: userId, name }, createdAt: new Date(msg.createdAt) })
    });
  };

  // Renders custom action button for additional functionalities
  const renderCustomActions = (props) => {
    return <CustomActions {...props} storage={storage} onSend={onSend} />;
  };

  // Conditionally renders the input toolbar based on network connectivity
  const renderInputToolbar = (props) => {
    return isConnected ? <InputToolbar {...props} /> : null;
  };

  // Function to render custom view for location messages
  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{ width: 150, height: 100 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        />
      );
    }
    return null;
  };

  const renderMessageAudio = (props) => {
    if (props.currentMessage.audio) {
      return (
        <TouchableOpacity
          style={{ padding: 10, backgroundColor: "#ddd", borderRadius: 10, margin: 5 }}
          onPress={async () => {
            if (soundObject) {
              soundObject.unloadAsync();
            }
            const { sound } = await Audio.Sound.createAsync({ uri: props.currentMessage.audio });
            soundObject = sound;
            await sound.playAsync();
          }}
        >
          <Text>Play Audio</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };


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
          const message = { _id: doc.id, text: data.text, createdAt: new Date(data.createdAt.seconds * 1000), user: data.user };
          if (data.image) {
            message.image = data.image;
          }
          if (data.location) {
            message.location = data.location;
          }
          return message;
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

  useEffect(() => {
    // Cleanup function to unload sound object
    return () => {
      if (soundObject) {
        soundObject.unloadAsync();
      }
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: userId, name }}
        renderUsernameOnMessage
        renderInputToolbar={renderInputToolbar}
        renderActions={renderCustomActions}
        renderCustomView={renderCustomView}
        renderMessageAudio={renderMessageAudio}
      />
      {Platform.OS === 'android' && <KeyboardAvoidingView behavior="height" />}
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1 } });

export default Chat;
