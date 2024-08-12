import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView } from 'react-native';
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
      if(role) setStoredRole(role);
      if (!token) {
        setMessage('No token found');
        return;
      }

      const response = await axios.get(`${process.env.EXPO_BACKEND}/api/users/kyc/status`, {
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
      // console.error('Error checking KYC status:', error);
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
      panCardFront.trim() !== ''
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
      aspect: [4, 3],
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
      if(role) setStoredRole(role);
      if (!token) {
        setMessage('No token found');
        return;
      }

      const response = await axios.post(`${process.env.EXPO_BACKEND}/api/users/kyc/request`, kycDetails, {
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

  if (!hasGalleryPermission) {
    return <Text style={styles.noAccessText}>No access to internal storage or camera</Text>;
  }

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
    <SafeAreaView style={styles.safeArea}>
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Aadhar Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Aadhar Number"
            value={kycDetails.aadharNumber}
            onChangeText={(text) => setKycDetails({ ...kycDetails, aadharNumber: text })}
            keyboardType='number-pad'
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Name"
            value={kycDetails.name}
            onChangeText={(text) => setKycDetails({ ...kycDetails, name: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Current Address"
            value={kycDetails.currentAddress}
            onChangeText={(text) => setKycDetails({ ...kycDetails, currentAddress: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter City"
            value={kycDetails.city}
            onChangeText={(text) => setKycDetails({ ...kycDetails, city: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>State</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter State"
            value={kycDetails.state}
            onChangeText={(text) => setKycDetails({ ...kycDetails, state: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Phone Number"
            value={kycDetails.phoneNumber}
            onChangeText={(text) => setKycDetails({ ...kycDetails, phoneNumber: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Email Address"
            value={kycDetails.emailAddress}
            onChangeText={(text) => setKycDetails({ ...kycDetails, emailAddress: text })}
          />
        </View>

        <Text style={styles.label}>Aadhar Front</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={() => uploadImage('aadharFront')}>
          {imageUris.aadharFront ? (
            <Image source={{ uri: imageUris.aadharFront }} style={styles.image} />
          ) : (
            <FontAwesome name="image" size={24} color="gray" />
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Aadhar Back</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={() => uploadImage('aadharBack')}>
          {imageUris.aadharBack ? (
            <Image source={{ uri: imageUris.aadharBack }} style={styles.image} />
          ) : (
            <FontAwesome name="image" size={24} color="gray" />
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Pan Card Front</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={() => uploadImage('panCardFront')}>
          {imageUris.panCardFront ? (
            <Image source={{ uri: imageUris.panCardFront }} style={styles.image} />
          ) : (
            <FontAwesome name="image" size={24} color="gray" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, isFormValid ? styles.submitButtonEnabled : styles.submitButtonDisabled]}
          onPress={handleKycSubmit}
          disabled={!isFormValid}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
        {message && <Text style={styles.error}>{message}</Text>}
      </ScrollView>
    </SafeAreaView>
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
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ced4da',
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
  statusMessage: {
    fontSize: 16,
    textAlign: 'center',
  },
  messagekyc: {
    color: 'green',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default TestS3Kyc;