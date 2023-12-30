// CustomActions.js

import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';

// CustomActions component for handling image, audio, and location sharing
const CustomActions = ({ wrapperStyle, iconTextStyle, storage, onSend, userId }) => {
  const { showActionSheetWithOptions } = useActionSheet();
  let recordingObject = null;

  // Cleanup recording object on component unmount
  useEffect(() => {
    return () => {
      if (recordingObject) {
        recordingObject.stopAndUnloadAsync();
      }
    };
  }, []);

  // Pick an image from the device library
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

  // Take a photo using the device camera
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

  // Generate a unique reference for each image or audio file
  const generateReference = (uri) => {
    const timeStamp = new Date().getTime();
    const parts = uri.split("/");
    const imageName = parts.length > 0 ? parts[parts.length - 1] : `unknown-${timeStamp}`;
    return `${userId}-${timeStamp}-${imageName}`;
  };

  // Upload image to Firebase Storage and send the image URL as a message
  const uploadAndSendImage = async (uri) => {
    const uniqueRefString = generateReference(uri);
    const storageRef = ref(storage, `images/${uniqueRefString}`);

    const response = await fetch(uri);
    const blob = await response.blob();

    uploadBytes(storageRef, blob).then(async (snapshot) => {
      try {
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
      } catch (error) {
        console.error("Error getting download URL:", error);
      }
    }).catch(error => {
      console.error("Error uploading image:", error);
    });
  };

  // Send user's current location
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

  // Start audio recording
  const startRecording = async () => {
    try {
      let permissions = await Audio.requestPermissionsAsync();
      if (permissions?.granted) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true
        });
        Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY).then(results => {
          recordingObject = results.recording;
          Alert.alert('You are recording...', undefined, [
            { text: 'Cancel', onPress: () => { stopRecording() } },
            { text: 'Stop and Send', onPress: () => { sendRecordedSound() } },
          ],
            { cancelable: false }
          );
        })
      }
    } catch (err) {
      Alert.alert('Failed to record!');
    }
  }

  // Stop recording and unload the recording object
  const stopRecording = async () => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false
    });
    await recordingObject.stopAndUnloadAsync();
  }

  // Upload recorded audio and send it as a message
  const sendRecordedSound = async () => {
    try {
      await stopRecording();
      if (!recordingObject) {
        console.error("Recording object is not initialized");
        return;
      }
      const uri = await recordingObject.getURI();
      const uniqueRefString = generateReference(uri);
      const newUploadRef = ref(storage, `audios/${uniqueRefString}`);
      const response = await fetch(uri);
      const blob = await response.blob();

      uploadBytes(newUploadRef, blob).then(async (snapshot) => {
        const soundURL = await getDownloadURL(snapshot.ref);
        onSend([{
          audio: soundURL,
          _id: Math.round(Math.random() * 1000000),
          createdAt: new Date(),
          user: { _id: userId }
        }]);
      });
    } catch (error) {
      console.error("Error in sendRecordedSound:", error);
    }
  };

  // Display an action sheet with various options
  const onActionPress = () => {
    const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Record a Sound', 'Cancel'];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      { options, cancelButtonIndex },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            pickImage();
            return;
          case 1:
            takePhoto();
            return;
          case 2:
            sendLocation();
            return;
          case 3:
            startRecording();
            return;
          default:
        }
      },
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onActionPress}
      accessible={true}
      accessibilityLabel="Custom actions"
      accessibilityRole="button"
      accessibilityHint="Opens a menu for image, audio, and location sharing options"
    >
      <View style={[styles.wrapper, wrapperStyle]}>
        <Text style={[styles.iconText, iconTextStyle]}>+</Text>
      </View>
    </TouchableOpacity>
  );
}

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
