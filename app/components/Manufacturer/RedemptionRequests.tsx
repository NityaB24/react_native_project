import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity,Animated, Easing } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomDrawer from './CustomDrawer';
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
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerAnim] = useState(new Animated.Value(-250));

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    setMessage('No token or manufacturerId found');
                    return;
                }

                const response = await axios.get(`http://192.0.0.2:3000/api/manufacturer/retailer/all-requests`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const filteredRequests = response.data.requests.filter((request: RedemptionRequest) => request.status === 'pending');
                setRequests(filteredRequests);
                setMessage('');
            } catch (error) {
                console.error('Error fetching redemption requests:', error);
                setMessage('Error fetching redemption requests');
            }
        };

        fetchRequests();
    }, []);

    const handleApprove = async (redemptionRequestId: string) => {
        Alert.prompt(
            'Enter coupon code',
            'Enter the coupon code to approve the redemption:',
            async (couponCode) => {
                if (!couponCode) {
                    return;
                }

                try {
                    const token = await AsyncStorage.getItem('token');
                    const response = await axios.post(
                        'http://192.0.0.2:3000/api/manufacturer/approve-redemption',
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

                    setMessage(response.data.message);
                    setRequests(requests.filter((request) => request._id !== redemptionRequestId));
                } catch (error) {
                    console.error('Error approving redemption:', error);
                    setMessage('Error approving redemption');
                }
            }
        );
    };

    const updateRequestList = (redemptionRequestId: string) => {
        setRequests(requests.filter(request => request._id !== redemptionRequestId));
    };

    const format12Hour = (dateString: string) => {
        const date = new Date(dateString);
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        const strTime = hours + ':' + minutesStr + ' ' + ampm;
        const month = date.toLocaleString('en-us', { month: 'short' });
        const formattedDate = `${date.getDate()} ${month} ${date.getFullYear()}`;
        return `${formattedDate}, ${strTime}`;
    };

    const renderActionButton = (request: RedemptionRequest) => {
        if (request.status === 'pending') {
            return (
                <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => handleApprove(request._id)}
                >
                    <Text style={styles.approveButtonText}>Approve</Text>
                </TouchableOpacity>
            );
        }
        return null;
    };

    const openDrawer = () => {
        setIsDrawerOpen(true);
        Animated.timing(drawerAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }).start();
      };
    
      const closeDrawer = () => {
        Animated.timing(drawerAnim, {
          toValue: -250,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }).start(() => setIsDrawerOpen(false));
      };
    return (
        <>
        <TouchableOpacity style={styles.drawerButton} onPress={openDrawer}>
        <Text style={styles.buttonText}>Menu</Text>
      </TouchableOpacity>
        <View style={styles.container}>
            <View style={styles.innerContainer}>
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
                                {renderActionButton(request)}
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>
        </View>
        <Animated.View style={[styles.drawerWrapper, { transform: [{ translateX: drawerAnim }] }]}>
        <CustomDrawer isOpen={isDrawerOpen} closeDrawer={closeDrawer} />
      </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f7f8fa',
        padding: 20,
    },
    innerContainer: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 16,
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
        width: '100%',
        maxWidth: 600,
        borderWidth:1,
        borderColor:'black',
        marginTop:30,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333333',
    },
    messageContainer: {
        marginTop: 20,
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#ffe3e3',
    },
    message: {
        textAlign: 'center',
        color: '#d9534f',
        fontSize: 16,
    },
    list: {
        paddingVertical: 10,
        
    },
    requestItem: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingVertical: 16,
        paddingHorizontal: 20,

        backgroundColor: '#fafafa',
        borderRadius: 12,
        marginBottom: 10,
        borderWidth:1,
        borderColor:'grey',
    },
    methodText: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 5,
        color: '#555555',
    },
    pointsText: {
        fontSize: 16,
        color: '#777777',
        marginBottom: 5,
    },
    dateText: {
        fontSize: 16,
        color: '#777777',
        marginBottom: 10,
    },
    approveButton: {
        backgroundColor: '#1f2937',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    approveButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    drawerButton: {
        backgroundColor: 'white',
        padding: 15,
        borderBottomWidth:1,
        borderColor:'black',
        alignItems: 'center',
        marginTop: 0,
      },
      drawerWrapper: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: 250,
        zIndex: 1000,
      },
      buttonText: {
        color: 'black',
        fontWeight: 'bold',
      },
});

export default RedemptionRequests;
