import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView,Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AWS from 'aws-sdk';
import { FontAwesome } from '@expo/vector-icons';

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

const Schemes = () => {
  const [kycDetails, setKycDetails] = useState({
    retailerScheme: '',
    userScheme: '',
  });

  const [imageUris, setImageUris] = useState({
    retailerScheme: '',
    userScheme: '',
  });
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasGalleryPermission, setHasGalleryPermission] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === 'granted');
    })();
    if (isSubmitted) {
      fetchSchemes(); // Refetch schemes after submission to update UI
    }
  }, [isSubmitted]);

  useEffect(() => {
    fetchSchemes(); // Initial fetch of schemes on component mount
  }, []);

  const uploadImage = async (imageType: keyof typeof imageUris) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
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
        
        console.log(`Uploaded ${imageType}: ${fileUrl}`); // Debugging statement

        // Update state only if the image URL has changed
        if (imageUris[imageType] !== fileUrl) {
          setKycDetails((prevDetails) => ({ ...prevDetails, [imageType]: fileUrl }));
          setImageUris((prevUris) => ({ ...prevUris, [imageType]: fileUrl }));
        }
      } catch (error:any) {
        console.log('upload error', error);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setMessage('No token found');
        return;
      }

      const response = await axios.post(`${process.env.EXPO_BACKEND}/api/manufacturer/scheme`, kycDetails, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setSuccessMessage('Schemes Uploaded');
        setIsSubmitted(true); // Set the submitted status to true
      } else {
        setMessage('Failed to upload Schemes');
      }
    } catch (error:any) {
      setMessage('Error uploading Scheme');
    }
  };

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
            userScheme: userScheme || '',
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

  if (!hasGalleryPermission) {
    return <Text style={styles.noAccessText}>No access to internal storage or camera</Text>;
  }
  const openFullScreenImage = (uri: string | null) => {
    setFullScreenImage(uri);
};
const closeFullScreenImage = () => {
    setFullScreenImage(null);
};

  return (
    <>
    <SafeAreaView style={styles.safeArea}>
      {successMessage && <Text style={styles.success}>{successMessage}</Text>}
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Upload Schemes</Text>

        <Text style={styles.label}>Retailer Scheme</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={() => uploadImage('retailerScheme')}>
          {imageUris.retailerScheme ? (
            <Image source={{ uri: imageUris.retailerScheme }} style={styles.image} />
          ) : (
            <FontAwesome name="image" size={24} color="gray" />
          )}
        </TouchableOpacity>

        <Text style={styles.label}>User Scheme</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={() => uploadImage('userScheme')}>
          {imageUris.userScheme ? (
            <Image source={{ uri: imageUris.userScheme }} style={styles.image} />
          ) : (
            <FontAwesome name="image" size={24} color="gray" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, styles.submitButtonEnabled]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Schemes</Text>
        {imageUris.retailerScheme || imageUris.userScheme ? (
          <View style={styles.previewContainer}>
            {imageUris.retailerScheme ? (
                <TouchableOpacity onPress={() => openFullScreenImage(imageUris.retailerScheme)}>
              <Image source={{ uri: imageUris.retailerScheme }} style={styles.previewImage} />
              </TouchableOpacity>
            ) : null}
            {imageUris.userScheme ? (
                <TouchableOpacity onPress={() => openFullScreenImage(imageUris.userScheme)}>
              <Image source={{ uri: imageUris.userScheme }} style={styles.previewImage} />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {message && <Text style={styles.error}>{message}</Text>}
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
  label: {
    fontSize: 16,
    marginBottom: 5,
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
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  submitButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonEnabled: {
    backgroundColor: '#007bff',
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noAccessText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#dc3545',
  },
  success: {
    color: '#28a745',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
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
});

export default Schemes;
