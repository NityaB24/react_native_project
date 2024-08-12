import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AWS from 'aws-sdk';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

const TestS3Kyc = () => {
  const [kycDetails, setKycDetails] = useState({
    aadharNumber: '',
    name: '',
    currentAddress: '',
    city: '',
    state: '',
    phoneNumber: '',
    emailAddress: '',
    aadharFront: '',
    aadharBack: '',
    panCardFront: '',
    gst: ''
  });

  const [imageUris, setImageUris] = useState({
    aadharFront: '',
    aadharBack: '',
    panCardFront: '',
  });

  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasGalleryPermission, setHasGalleryPermission] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [kycComment, setKycComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [storedRole, setStoredRole] = useState('');

  useEffect(() => {
    (async () => {
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === 'granted');
    })();
    validateForm();
  }, [kycDetails]);

  useEffect(() => {
    checkKycStatus();
  }, []);

  const checkKycStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const role = await AsyncStorage.getItem('role');
      if (role) setStoredRole(role);
      if (!token) {
        setMessage('No token found');
        return;
      }
      let endpoint = '';
      if (role === 'user') {
        endpoint = `${process.env.EXPO_BACKEND}/api/users/kyc/status`;
      } else if (role === 'retailer') {
        endpoint = `${process.env.EXPO_BACKEND}/api/retailer/kyc/status`;
      } else {
        console.error('Invalid role');
        return;
      }

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const { status, comment, details } = response.data;
        setKycStatus(status);
        setKycComment(comment);
        if (status === 'rejected') {
          setKycDetails({
            ...kycDetails,
            ...details.address,
            aadharNumber: details.aadharNumber,
            aadharFront: details.aadharFront,
            aadharBack: details.aadharBack,
            panCardFront: details.panCardFront,
          });
          setImageUris({
            aadharFront: details.aadharFront,
            aadharBack: details.aadharBack,
            panCardFront: details.panCardFront,
          });
        }
      } else {
        setMessage('Failed to check KYC status');
      }
    } catch (error) {
      setMessage('Error checking KYC status');
    }
  };

  const validateForm = () => {
    const {
      aadharNumber,
      name,
      currentAddress,
      city,
      state,
      phoneNumber,
      emailAddress,
      aadharFront,
      aadharBack,
      panCardFront,
      gst,
    } = kycDetails;

    if (
      aadharNumber.trim() !== '' &&
      name.trim() !== '' &&
      currentAddress.trim() !== '' &&
      city.trim() !== '' &&
      state.trim() !== '' &&
      phoneNumber.trim() !== '' &&
      emailAddress.trim() !== '' &&
      aadharFront.trim() !== '' &&
      aadharBack.trim() !== '' &&
      panCardFront.trim() !== '' &&
      gst.trim() !== ''
    ) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  };

  const uploadImage = async (imageType: keyof typeof imageUris) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const filePath = result.assets[0].uri;
      const phoneNumber = kycDetails.phoneNumber.replace(/[^a-zA-Z0-9]/g, '');
      const email = kycDetails.emailAddress;
      const timestamp = new Date().toISOString();
      const fileName = `${email}/${timestamp}_${imageType}.jpg`;
      const bucketName = 'verification-files-project';

      try {
        const response = await fetch(filePath);
        const filedata = await response.blob();
        await uploadFilestoS3(bucketName, fileName, filedata);
        const fileUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;
        setKycDetails({ ...kycDetails, [imageType]: fileUrl });
        setImageUris({ ...imageUris, [imageType]: fileUrl });
      } catch (error) {
        console.log('upload error', error);
      }
    }
  };

  const handleKycSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const role = await AsyncStorage.getItem('role');
      if (role) setStoredRole(role);
      if (!token) {
        setMessage('No token found');
        return;
      }
      let endpoint = `${process.env.EXPO_BACKEND}/api/retailer/kyc/request`;

      const response = await axios.post(endpoint, kycDetails, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setSuccessMessage('KYC request submitted successfully');
        setIsSubmitted(true); // Set the submitted status to true
      } else {
        setMessage('Failed to submit KYC request');
      }
    } catch (error) {
      setMessage('error');
    }
  };

  if (kycStatus === 'approved') {
    return <Text style={styles.success}>Your KYC is approved</Text>;
  }

  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.success}>{successMessage}</Text>
          <Text style={styles.statusMessage}>KYC Status: Pending</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient colors={['#f8f9fa', '#e0e0e0']} style={styles.safeArea}>
      {successMessage && <Text style={styles.success}>{successMessage}</Text>}
      {kycStatus === 'approved' && (
        <Text style={styles.messagekyc}>Your KYC is approved</Text>
      )}
      {kycStatus === 'rejected' && (
        <View>
          <Text style={styles.error}>KYC was Rejected {'\n'} Please correct the ({kycComment}) then resubmit:</Text>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>KYC Submission</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Aadhar Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Aadhar Number"
            value={kycDetails.aadharNumber}
            onChangeText={(text) => setKycDetails({ ...kycDetails, aadharNumber: text })}
            keyboardType='number-pad'
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Name"
            value={kycDetails.name}
            onChangeText={(text) => setKycDetails({ ...kycDetails, name: text })}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Current Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Address"
            value={kycDetails.currentAddress}
            onChangeText={(text) => setKycDetails({ ...kycDetails, currentAddress: text })}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter City"
            value={kycDetails.city}
            onChangeText={(text) => setKycDetails({ ...kycDetails, city: text })}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>State</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter State"
            value={kycDetails.state}
            onChangeText={(text) => setKycDetails({ ...kycDetails, state: text })}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Phone Number"
            value={kycDetails.phoneNumber}
            onChangeText={(text) => setKycDetails({ ...kycDetails, phoneNumber: text })}
            keyboardType='phone-pad'
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Email Address"
            value={kycDetails.emailAddress}
            onChangeText={(text) => setKycDetails({ ...kycDetails, emailAddress: text })}
            keyboardType='email-address'
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Aadhar Front Image</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => uploadImage('aadharFront')}
          >
            <FontAwesome name="cloud-upload" size={24} color="white" />
            <Text style={styles.uploadButtonText}>Upload Aadhar Front</Text>
          </TouchableOpacity>
          {imageUris.aadharFront ? (
            <Image source={{ uri: imageUris.aadharFront }} style={styles.image} />
          ) : (
            <Text style={styles.noImageText}>No Image Uploaded</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Aadhar Back Image</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => uploadImage('aadharBack')}
          >
            <FontAwesome name="cloud-upload" size={24} color="white" />
            <Text style={styles.uploadButtonText}>Upload Aadhar Back</Text>
          </TouchableOpacity>
          {imageUris.aadharBack ? (
            <Image source={{ uri: imageUris.aadharBack }} style={styles.image} />
          ) : (
            <Text style={styles.noImageText}>No Image Uploaded</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>PAN Card Front Image</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => uploadImage('panCardFront')}
          >
            <FontAwesome name="cloud-upload" size={24} color="white" />
            <Text style={styles.uploadButtonText}>Upload PAN Card Front</Text>
          </TouchableOpacity>
          {imageUris.panCardFront ? (
            <Image source={{ uri: imageUris.panCardFront }} style={styles.image} />
          ) : (
            <Text style={styles.noImageText}>No Image Uploaded</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>GST Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter GST Number"
            value={kycDetails.gst}
            onChangeText={(text) => setKycDetails({ ...kycDetails, gst: text })}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, !isFormValid && styles.disabledButton]}
          onPress={handleKycSubmit}
          disabled={!isFormValid}
        >
          <LinearGradient colors={['#2a4853', '#72d9ff']} style={styles.gradientButton}>
            <Text style={styles.submitButtonText}>Submit KYC</Text>
          </LinearGradient>
        </TouchableOpacity>

        {message && <Text style={styles.message}>{message}</Text>}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  submitButton: {
    backgroundColor: '#ff7e5f',
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  gradientButton: {
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#d3d3d3',
  },
  success: {
    color: 'green',
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 10,
  },
  error: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 10,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  uploadButtonText: {
    color: '#fff',
    marginLeft: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 5,
  },
  noImageText: {
    marginTop: 10,
    color: '#777',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  message: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  messagekyc: {
    color: 'green',
    textAlign: 'center',
    marginTop: 20,
  },
  statusMessage: {
    color: 'blue',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default TestS3Kyc;
