import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView,Modal,Dimensions } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
const { width, height } = Dimensions.get('window');
const Schemes = () => {
  const [imageUris, setImageUris] = useState({
    retailerScheme: '',
  });
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSchemes(); // Initial fetch of schemes on component mount
  }, []);


  const fetchSchemes = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setMessage('No token found');
        return;
      }
  
      const response = await axios.get(`${process.env.EXPO_BACKEND}/api/manufacturer/scheme`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        const schemes = response.data; // This is an array
        if (schemes.length > 0) {
          const { retailerScheme, userScheme } = schemes[0]; // Access the first item of the array
          setImageUris({
            retailerScheme: retailerScheme || '',
          });
        } else {
          setMessage('No schemes found');
        }
      } else {
        setMessage('Failed to fetch schemes');
      }
    } catch (error:any) {
      setMessage('Error fetching schemes');
    }
  };
  const openFullScreenImage = (uri: string | null) => {
    setFullScreenImage(uri);
};
const closeFullScreenImage = () => {
    setFullScreenImage(null);
};

  return (
    <>
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Retailer Schemes</Text>
        {imageUris.retailerScheme && (
          <View style={styles.previewContainer}>
            {imageUris.retailerScheme ? (
                <TouchableOpacity onPress={() => openFullScreenImage(imageUris.retailerScheme)}>
              <Image source={{ uri: imageUris.retailerScheme }} style={styles.images} />
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
    <Modal
    animationType="slide"
    transparent={false}
    visible={!!fullScreenImage}
    onRequestClose={closeFullScreenImage}
>
    <View style={styles.fullScreenContainer}>
        <Image source={{ uri: fullScreenImage || 'https://via.placeholder.com/150' }} style={styles.fullScreenImage} />
        <TouchableOpacity style={styles.closeButton} onPress={closeFullScreenImage}>
            <FontAwesome name="close" size={30} color="#fff" />
        </TouchableOpacity>
    </View>
</Modal>
</>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  imagePicker: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    backgroundColor: '#e9ecef',
    marginBottom: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ced4da',
  },
  noAccessText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#dc3545',
  },
  error: {
    color: '#dc3545',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  previewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
},
fullScreenImage: {
    width: '100%',
    height: '90%',
    resizeMode: 'contain',
},
closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
},
images: {
    width: width * 0.9,
    height: height * 0.6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
});

export default Schemes;
