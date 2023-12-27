// Chat.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, KeyboardAvoidingView, TouchableOpacity, Text } from 'react-native';
import { GiftedChat, InputToolbar } from "react-native-gifted-chat";
import { collection, query, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomActions from './CustomActions';
import MapView from 'react-native-maps';
import { Audio } from 'expo-av';

// AudioPlayer component to handle audio playback
const AudioPlayer = ({ audioUri }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Function to play or pause the audio
  const togglePlayPause = async () => {
    if (!sound) {
      // Load and play the sound
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri });
      setSound(newSound);
      newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      await newSound.playAsync();
    } else {
      // Toggle between play and pause
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    }
  };

  // Update component state based on playback status
  const onPlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
      // Reload sound to enable replaying
      loadSound();
    } else {
      setIsPlaying(status.isPlaying);
    }
  };

  // Load sound
  const loadSound = async () => {
    if (sound) {
      await sound.unloadAsync();
    }
    const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri });
    setSound(newSound);
    newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
  };

  // Initialize sound on mount and clean up on unmount
  useEffect(() => {
    loadSound();
    return () => {
      sound?.unloadAsync();
    };
  }, [audioUri]);

  // Render Play/Pause button
  return (
    <TouchableOpacity onPress={togglePlayPause}>
      <Text style={styles.playAudioText}>
        {isPlaying ? 'Pause' : 'Play'} Audio
      </Text>
    </TouchableOpacity>
  );
};

// Main Chat component
const Chat = ({ route, navigation, db, storage, isConnected }) => {
  const [messages, setMessages] = useState([]);
  const { name, backgroundColor, userId } = route.params;

  // Send messages to Firestore
  const onSend = (newMessages = []) => {
    newMessages.forEach(msg => {
      addDoc(collection(db, "messages"), { ...msg, user: { _id: userId, name }, createdAt: new Date(msg.createdAt) })
        .catch(error => console.error("Error adding document: ", error));
    });
  };

  // Render additional functionalities like images and audio recording
  const renderCustomActions = (props) => (
    <CustomActions {...props} storage={storage} onSend={onSend} userId={userId} />
  );

  // Render input toolbar only when connected
  const renderInputToolbar = (props) => isConnected ? <InputToolbar {...props} /> : null;

  // Render location messages as map views
  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={styles.mapView}
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

  // Render custom audio component
  const renderMessageAudio = (props) => (
    props.currentMessage.audio ? <AudioPlayer audioUri={props.currentMessage.audio} /> : null
  );

  // Set up Firestore listener and load messages from storage
  useEffect(() => {
    navigation.setOptions({ title: name });
    const initialMessages = [{ _id: 2, text: `${name} has entered the chat`, createdAt: new Date(), system: true }];
    const unsubscribe = isConnected ? setupFirestoreListener() : loadMessagesFromStorage();
    return unsubscribe;

    function setupFirestoreListener() {
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      return onSnapshot(q, snapshot => processFirestoreSnapshot(snapshot, initialMessages));
    }

    function loadMessagesFromStorage() {
      AsyncStorage.getItem('messages').then(storedMessages => {
        if (storedMessages) setMessages(JSON.parse(storedMessages));
      });
    }
  }, [isConnected, db, route.params]);

  // Process Firestore snapshot for new messages
  const processFirestoreSnapshot = (snapshot, initialMessages) => {
    const newMessages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        _id: doc.id,
        text: data.text,
        createdAt: new Date(data.createdAt.seconds * 1000),
        user: data.user,
        image: data.image,
        location: data.location,
        audio: data.audio,
      };
    });
    AsyncStorage.setItem('messages', JSON.stringify(newMessages))
      .catch(error => console.error("Error saving messages to AsyncStorage: ", error));
    setMessages(GiftedChat.append(initialMessages, newMessages));
  };

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

// Styles for the components
const styles = StyleSheet.create({
  container: { flex: 1 },
  playAudioText: {
    color: 'blue',
    textDecorationLine: 'underline',
    padding: 10,
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    margin: 5,
  },
  mapView: {
    width: 150,
    height: 100,
  },
});

export default Chat;
