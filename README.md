# React Native Mobile Chat App

## Overview
This is a chat application designed for mobile phones, built using React Native,
which means it works on both Android and iOS.
The app lets users chat, share photos, their location, and audio recordings.

## Simple Objective
The main goal of this project is to create an easy-to-use chat app that works on any smartphone,
allowing people to talk, share pictures, audio recordings and location using their phone's map.

## Key Features
- **User Engagement**: Simple and intuitive interface for users to engage in chat rooms.
- **Communication Tools**: Exchange messages, share images, location, and audio recordings.
- **Offline Accessibility**: Read messages offline.
- **Customization**: Choose color themes and see names displayed.
- **Accessibility**: Designed for accessibility, including screen reader compatibility.
- **Audio Recording and Playback**: Record and play back audio messages within the chat.

## Technical Specifications
- **Built With React Native**: For Android and iOS compatibility.
- **Development Environment**: Uses Expo for development.
- **Stylish Design**: Adheres to design guidelines.
- **Data Management**:
  - Chats in Google Firestore Database.
  - Anonymous sign-in with Firebase.
  - Local chat history storage.
  - Image and audio file sharing and storage in Firebase Cloud Storage.
  - Location sharing using GPS.

## Development Environment Setup

### React Native and Expo
1. **Install Node.js and npm**: Download from [nodejs.org](https://nodejs.org).
2. **Install Expo CLI**: Run `npm install -g expo-cli`.
3. **IDE**: Use Visual Studio Code or similar.
4. **Android Studio/Xcode**: For emulator and SDK tools.

## Database Configuration

### Firebase Setup
1. **Create a Firebase Project**: Visit [Firebase Console](https://console.firebase.google.com/).
2. **Add an App**: In the Firebase project, add an Android or iOS app.
3. **Configure Database**: Set up Firestore or Realtime Database.
4. **Database Credentials**: Insert Firebase configuration in `App.js`, `CustomActions.js`.

## Libraries and Dependencies
- `@react-native-community/netinfo`, `@react-navigation/native`, `expo`, `firebase`, etc.
- Install with `npm install`.

## Running the App
- Run `expo start` in the project directory.
- Run on Android/iOS simulator or physical device.

## Troubleshooting
- Refer to Expo or React Native documentation for issues.
- Check Firebase configuration for connectivity problems.

## Contributing
- Fork the repository.
- Create a pull request with your changes.
