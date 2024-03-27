import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { Audio } from 'expo-av';

export default function TabTwoScreen() {
  const [alertTime, setAlertTime] = useState(null);
  const [inputTime, setInputTime] = useState('');
  const [display, setDisplay] = useState(false);
  const [sound, setSound] = useState();

  async function playSound() {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync( require('../../assets/sounds/emergency.mp3')
    );
    console.log('Playing Sound');
    setSound(sound);
    await sound.playAsync();
  }

  useEffect(() => {
    const checkAlert = async () => {
      try {
        const storedAlertTime = await AsyncStorage.getItem('alertTime');
        if (storedAlertTime) {
          setAlertTime(parseInt(storedAlertTime));
        }
      } catch (error) {
        console.error('Error retrieving alert time:', error);
      }
    };

    checkAlert();

    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      console.log(currentTime,alertTime);
      if (alertTime && currentTime > alertTime) {
        console.log('Alert!', 'Time to take your medication.');
        playSound();
        setDisplay(true);
        // Optionally, you can clear the alert time after showing the alert
        setAlertTime(null);
        AsyncStorage.removeItem('alertTime');
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [alertTime]);


  const handleSetAlertTime = async () => {
    // Convert input time to milliseconds since epoch
    const timeParts = inputTime.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    const selectedTime = new Date();
    console.log(inputTime);
    selectedTime.setHours(hours, minutes, 0, 0);
    console.log(selectedTime);

    // Store selected time in AsyncStorage
    await AsyncStorage.setItem('alertTime', selectedTime.getTime().toString());
    setAlertTime(selectedTime.getTime());
    setInputTime('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medication Timer Testing</Text>
      {display && <Text style={styles.title}>Time Over.</Text>}
      <View style={styles.separator} />
      <TextInput
        style={styles.input}
        placeholder="Enter time (HH:MM)"
        value={inputTime}
        onChangeText={setInputTime}
      />
      <Button title="Set Alert Time" onPress={handleSetAlertTime} />
      <Button title="Mute Audio" onPress={()=>sound.unloadAsync()} />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
