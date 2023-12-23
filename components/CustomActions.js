// CustomActions.js

import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';

const CustomActions = ({ wrapperStyle, iconTextStyle, storage, onSend, userId }) => {
  const { showActionSheetWithOptions } = useActionSheet();
  let recordingObject = null;

  // Function to handle image picking from the library
  const pickImage = async () => {
    let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissions.granted) {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageURI = result.assets[0].uri;
        uploadAndSendImage(imageURI);
      }
    } else {
      Alert.alert("Permissions not granted", "You need to allow access to the library.");
    }
  };

  // Function to handle taking a photo using the camera
  const takePhoto = async () => {
    let cameraPermissions = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermissions.granted) {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      if (!result.canceled) {
        uploadAndSendImage(result.uri);
      }
    } else {
      Alert.alert("Camera permission not granted", "You need to allow access to the camera.");
    }
  };

  // Function to generate a unique reference for each image
  const generateReference = (uri) => {
    const timeStamp = new Date().getTime();
    const imageName = uri.split("/").pop();
    return `${userId}-${timeStamp}-${imageName}`;
  };

  // Function to upload the image to Firebase Storage and send the image URL as a message
  const uploadAndSendImage = async (uri) => {
    const uniqueRefString = generateReference(uri);
    const storageRef = ref(storage, `images/${uniqueRefString}`);

    const response = await fetch(uri);
    const blob = await response.blob();

    uploadBytes(storageRef, blob).then(async (snapshot) => {
      const downloadURL = await getDownloadURL(snapshot.ref);
      const imageMessage = {
        _id: Math.round(Math.random() * 1000000),
        createdAt: new Date(),
        user: {
          _id: userId,
        },
        image: downloadURL,
      };
      onSend([imageMessage]);
    }).catch(error => {
      console.error("Error uploading image:", error);
    });
  };

  // Function to handle sending location
  const sendLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    if (location) {
      onSend([{
        _id: Math.round(Math.random() * 1000000),
        createdAt: new Date(),
        user: {
          _id: userId,
        },
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      }]);
    }
  };

  // Function to start recording
  const startRecording = async () => {
    try {
      let permissions = await Audio.requestPermissionsAsync();
      if (permissions.granted) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        recordingObject = recording;
      } else {
        Alert.alert('Microphone permission not granted');
      }
    } catch (err) {
      Alert.alert('Failed to start recording', err.message);
    }
  };

  // Function to stop recording
  const stopRecording = async () => {
    await recordingObject.stopAndUnloadAsync();
  };

  // Function to send recorded audio
  const sendRecordedSound = async () => {
    await stopRecording();
    const uri = await recordingObject.getURI();
    const uniqueRefString = generateReference(uri);
    const newUploadRef = ref(storage, `audios/${uniqueRefString}`);
    const response = await fetch(uri);
    const blob = await response.blob();
    uploadBytes(newUploadRef, blob).then(async (snapshot) => {
      const audioURL = await getDownloadURL(snapshot.ref);
      onSend([{ _id: Math.round(Math.random() * 1000000), createdAt: new Date(), user: { _id: userId }, audio: audioURL }]);
    });
  };

  // Display the action sheet with options
  const onActionPress = () => {
    const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Record a Sound', 'Cancel'];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      { options, cancelButtonIndex },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            pickImage();
            break;
          case 1:
            takePhoto();
            break;
          case 2:
            sendLocation();
            break;
          case 3:
            startRecording();
            break;
        }
      }
    );
  };

  // useEffect to handle the cleanup of recordingObject
  useEffect(() => {
    return () => {
      if (recordingObject) {
        recordingObject.stopAndUnloadAsync();
      }
    };
  }, []);

  // Render the '+' icon for custom actions
  return (
    <TouchableOpacity style={styles.container} onPress={onActionPress}>
      <View style={styles.wrapper}>
        <Text style={styles.iconText}>+</Text>
      </View>
    </TouchableOpacity>
  );
};

// Styles for the custom actions component
const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: '#b2b2b2',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'transparent',
  },
});

export default CustomActions;
