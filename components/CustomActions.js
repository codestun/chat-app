// CustomActions.js

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CustomActions = ({ storage, onSend, userId }) => {
  const { showActionSheetWithOptions } = useActionSheet();

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

  // Display the action sheet with options
  const onActionPress = () => {
    const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      { options, cancelButtonIndex },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          pickImage();
        } else if (buttonIndex === 1) {
          takePhoto();  // Call the takePhoto function
        } // Add additional options as needed
      }
    );
  };

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
