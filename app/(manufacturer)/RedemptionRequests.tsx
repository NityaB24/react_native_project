import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RedemptionRequest {
  _id: string;
  method: string;
  points: number;
  status: string;
  dateRequested: string;
}

const RedemptionRequests = () => {
  const [requests, setRequests] = useState<RedemptionRequest[]>([]);
  const [message, setMessage] = useState<string>('Loading...');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setMessage('No token or manufacturerId found');
        return;
      }

      const response = await axios.get(`${process.env.EXPO_BACKEND}/api/manufacturer/retailer/all-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const filteredRequests = response.data.requests.filter((request: RedemptionRequest) => request.status === 'pending');
      setRequests(filteredRequests);
      setMessage('');
    } catch (error:any) {
      // console.error('Error fetching redemption requests:', error);
      setMessage('Error fetching redemption requests');
    }
    finally {
      setIsRefreshing(false);
    }
  };

  const handleApprove = async (redemptionRequestId: string) => {
    Alert.prompt(
      'Enter coupon code',
      'Enter the coupon code to approve the redemption:',
      async (couponCode) => {
        if (!couponCode) return;

        try {
          const token = await AsyncStorage.getItem('token');
          const response = await axios.post(
            `${process.env.EXPO_BACKEND}/api/manufacturer/approve-redemption`,
            {
              redemptionRequestId,
              couponCode,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.status === 200) {
            setSuccessMessage('Redemption Successful');
          } else {
            setSuccessMessage('Redemption Failed');
          }

          fetchRequests();
        } catch (error:any) {
          // console.error('Error approving redemption:', error);
          setMessage('Error approving redemption');
        }
      }
    );
  };

  const format12Hour = (dateString: string) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutesStr + ' ' + ampm;
    const month = date.toLocaleString('en-us', { month: 'short' });
    const formattedDate = `${date.getDate()} ${month} ${date.getFullYear()}`;
    return `${formattedDate}, ${strTime}`;
  };

  const onRefresh = () => {
    setIsRefreshing(true); // Set refreshing indicator
    fetchRequests(); // Fetch data again
};

  return (
    <>
      <View style={styles.container} >
        {successMessage && <Text style={styles.successMessage}>{successMessage}</Text>}
        <ScrollView style={styles.innerContainer} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#34D399']} />}>
          <Text style={styles.title}>Retailer Redeem Requests</Text>
          {message ? (
            <View style={styles.messageContainer}>
              <Text style={styles.message}>{message}</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.list}>
              {requests.map((request) => (
                <View key={request._id} style={styles.requestItem}>
                  <Text style={styles.methodText}>{request.method}</Text>
                  <Text style={styles.pointsText}>Points: {request.points}</Text>
                  <Text style={styles.dateText}>Date Requested: {format12Hour(request.dateRequested)}</Text>
                  <TouchableOpacity style={styles.approveButton} onPress={() => handleApprove(request._id)}>
                    <Text style={styles.approveButtonText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: 10,
    textAlign: 'center',
    marginBottom: 10,
    borderRadius: 5,
  },
  innerContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 20,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  messageContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f8d7da',
  },
  message: {
    textAlign: 'center',
    color: '#721c24',
    fontSize: 16,
  },
  list: {
    paddingVertical: 10,
  },
  requestItem: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  methodText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  pointsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  approveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  }
});

export default RedemptionRequests;
