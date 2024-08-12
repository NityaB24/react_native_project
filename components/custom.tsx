import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet ,Text} from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function CustomDrawerContent(props) {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profilePhoto: '',
  });
  const [message, setMessage] = useState('');
  const [imageUri, setImageUri] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setMessage('No token found');
        return;
      }

      const response = await axios.get(`${process.env.EXPO_BACKEND}/api/retailer/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setImageUri(response.data.profilePhoto || '');
      setProfile(response.data);
    } catch (error:any) {
      setMessage('Error fetching profile');
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: imageUri || 'https://avatar.iran.liara.run/public/21' }} 
          style={styles.image} 
        />
        <Text style={{marginTop:20}}>{profile.name}</Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    padding: 20,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});
