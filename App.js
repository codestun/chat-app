import { useState } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';

const App = () => {
  const [text, setText] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        value={text}
        onChangeText={setText}
        placeholder='Type Something Here'
      />
      <Text style={styles.textDisplay}>You wrote: {text}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textInput: {
    width: '88%',
    borderWidth: 1,
    height: 50,
    padding: 10
  },
  textDisplay: {
    height: 50,
    lineHeight: 50
  }
});

export default App;
