import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Buffer } from 'buffer';
import {FontAwesome} from '@expo/vector-icons';
const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profilePhoto: '',
  });
  const [message, setMessage] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean>(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setMessage('No token found');
          return;
        }
    
        console.log('Token:', token);
    
        const response = await axios.get('http://192.168.29.101:3000/api/retailer/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
    
        if (response.data.profilePhoto) {
          const imageUri = `data:image/jpeg;base64,${Buffer.from(response.data.profilePhoto).toString('base64')}`;
          setImageUri(imageUri);
        }
    
        setProfile(response.data);
      } catch (error) {
        console.error('Frontend error:', error);
        setMessage('Error fetching profile');
      }
    };
    

  
    fetchProfile();
  
    (async () => {
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === 'granted');
      setHasCameraPermission(cameraStatus.status === 'granted');
    })();
  }, []);
  
  

  const compressImage = async (uri: string): Promise<string> => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 400 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const size = await FileSystem.getInfoAsync(manipulatedImage.uri);

      return manipulatedImage.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return uri;
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setMessage('No token found');
        return;
      }

      let profilePhotoBase64: string = '';
      if (imageUri) {
        const compressedUri = await compressImage(imageUri);
        profilePhotoBase64 = (await convertImageToBase64(compressedUri)) || '';
      }

      const payload = {
        name: profile.name,
        email: profile.email,
        profilePhoto: profilePhotoBase64,
      };

      const response = await axios.put('http://192.168.29.101:3000/api/retailer/profile', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setMessage('Profile updated successfully');
      } else {
        setMessage('Failed to update profile');
      }
    } catch (error) {
      // console.error('Frontend error:', error);
      setMessage('Error updating profile');
    }
  };

  const convertImageToBase64 = async (uri: string): Promise<string | null> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error("Error converting image to base64:", error);
      return null;
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    try {
      await ImagePicker.requestCameraPermissionsAsync();
      let result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.back,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.log("error uploading image");
      throw error;
    }
  };

  if (!hasGalleryPermission || !hasCameraPermission) {
    return <Text>No access to internal storage or camera</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: imageUri || 'https://via.placeholder.com/150' }}
          style={styles.profilePhoto}
        />
        <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
          <FontAwesome name="image" size={15} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={uploadImage} style={styles.iconButton2}>
          <FontAwesome name="camera" size={15} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.profileDetails}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={profile.name}
          onChangeText={(text) => setProfile({ ...profile, name: text })}
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={profile.email}
          onChangeText={(text) => setProfile({ ...profile, email: text })}
        />
      </View>
      <TouchableOpacity onPress={handleUpdateProfile} style={styles.updateButton}>
        <Text style={styles.updateButtonText}>Update Profile</Text>
      </TouchableOpacity>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  iconButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 120,
    right: 40,
  },
  iconButton2: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 120,
    right: 0,
  },
  profileDetails: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  updateButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  message: {
    marginTop: 10,
    textAlign: 'center',
    color: '#dc3545',
  },
});

export default Profile;