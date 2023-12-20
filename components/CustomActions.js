// CustomActions.js

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CustomActions = ({ storage, onSend, userId }) => {
  const { showActionSheetWithOptions } = useActionSheet();

  // Handles picking an image from the library
  const pickImage = async () => {
    const permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissions.granted) {
      Alert.alert("Permissions not granted", "You need to allow access to the library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets) {
      uploadAndSendImage(result.assets[0].uri);
    }
  };

  // Generates a unique reference for an image
  const generateReference = (uri) => `${userId}-${new Date().getTime()}-${uri.split("/").pop()}`;

  // Uploads the image to Firebase Storage and sends the URL as a message
  const uploadAndSendImage = async (uri) => {
    const storageRef = ref(storage, `images/${generateReference(uri)}`);
    const blob = await (await fetch(uri)).blob();

    try {
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      onSend([{ _id: Math.round(Math.random() * 1000000), createdAt: new Date(), user: { _id: userId }, image: downloadURL }]);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  // Shows action sheet with options
  const onActionPress = () => {
    const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'];
    showActionSheetWithOptions({ options, cancelButtonIndex: options.length - 1 }, handleActionPress);
  };

  // Handles the selected action
  const handleActionPress = (buttonIndex) => {
    if (buttonIndex === 0) pickImage();
    // Further actions like 'Take Picture' or 'Send Location' can be implemented here
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onActionPress}>
      <View style={styles.wrapper}><Text style={styles.iconText}>+</Text></View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { width: 26, height: 26, marginLeft: 10, marginBottom: 10 },
  wrapper: { borderRadius: 13, borderColor: '#b2b2b2', borderWidth: 2, flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconText: { color: '#b2b2b2', fontWeight: 'bold', fontSize: 16, backgroundColor: 'transparent' },
});

export default CustomActions;
