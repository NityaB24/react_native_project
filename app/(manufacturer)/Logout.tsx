import React from 'react';
import { Button, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';

const LogoutScreen = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.replace('/'); // Redirect to home screen
    } catch (error:any) {
      console.error('Error clearing AsyncStorage:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LogoutScreen;
