import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: `${process.env.EXPO_AWS_ACCESS_KEY_ID}`,
  secretAccessKey: `${process.env.EXPO_AWS_SECERT_ACCESS_KEY}`,
  region: `${process.env.EXPO_AWS_REGION}`
});

const s3 = new AWS.S3();
const uploadFilestoS3 = (bucketName: string, fileName: string, file: Blob) => {
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: file,
  };
  return s3.upload(params).promise();
};

const Profile = () => {
  const router = useRouter();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profilePhoto: '',
  });
  const [message, setMessage] = useState('');
  const [imageUris, setImageUris] = useState('');

  const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === 'granted');
    })();
  }, []);

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

      setImageUris(response.data.profilePhoto || '');
      setProfile(response.data);
    } catch (error:any) {
      console.error('Frontend error:', error);
      setMessage('Error fetching profile');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setMessage('No token found');
        return;
      }

      const payload = {
        name: profile.name,
        email: profile.email,
        profilePhoto: profile.profilePhoto,
      };

      const response = await axios.put(`${process.env.EXPO_BACKEND}/api/retailer/profile`, payload, {
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
    } catch (error:any) {
      setMessage('Error updating profile');
    }
  };

  const uploadImage = async (imageType: string) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const filePath = result.assets[0].uri;
      const timestamp = new Date().toISOString();
      const fileName = `${timestamp}_${imageType}.jpg`;
      const bucketName = 'verification-files-project';

      try {
        const response = await fetch(filePath);
        const filedata = await response.blob();
        await uploadFilestoS3(bucketName, fileName, filedata);
        const fileUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;
        setProfile({ ...profile, [imageType]: fileUrl });
        setImageUris(fileUrl);
      } catch (error:any) {
        console.log('upload error', error);
      }
    }
  };

  if (!hasGalleryPermission) {
    return <Text>No access to internal storage</Text>;
  }

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
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: imageUris || 'https://via.placeholder.com/150' }}
          style={styles.profilePhoto}
        />
        <TouchableOpacity onPress={() => uploadImage('profilePhoto')} style={styles.iconButton2}>
          <FontAwesome name="image" size={15} color="#fff" />
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
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.updateButtonText}>Logout</Text>
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
  logoutButton: {
    backgroundColor: '#fc4e54',
    marginTop:20,
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
