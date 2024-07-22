import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl, Easing, TouchableOpacity, Image, Modal, Alert, TextInput } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
interface KYCRequest {
    _id: string;
    retailer: string;
    aadharNumber: string;
    aadharFront: string;
    aadharBack: string;
    panCardFront: string;
    address: {
        name: string;
        currentAddress: string;
        city: string;
        state: string;
        phoneNumber: string;
        emailAddress: string;
    };
    status: string;
}

const KYCRequests: React.FC = () => {
    const [kycRequests, setKycRequests] = useState<KYCRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [message, setMessage] = useState<string>('');
    const [token, setToken] = useState<string | null>(null);
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
    const [comment, setComment] = useState<string>('');
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);


    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const fetchedToken = await AsyncStorage.getItem('token');
            setToken(fetchedToken);

            if (fetchedToken) {
                const response = await axios.get(`${process.env.EXPO_BACKEND}/api/kyc/requests`, {
                    headers: {
                        Authorization: `Bearer ${fetchedToken}`,
                    },
                });

                const pendingRequests = response.data.filter((item: KYCRequest) => item.status === 'pending' );
                setKycRequests(pendingRequests);
            } else {
                setMessage('Token is missing');
            }
        } catch (error:any) {
            // console.error('Error fetching KYC requests:', error);
            setMessage('Failed to fetch KYC requests');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };


    const openFullScreenImage = (uri: string | null) => {
        setFullScreenImage(uri);
    };

    const closeFullScreenImage = () => {
        setFullScreenImage(null);
    };

    const handleApproval = async (id: string) => {
        try {
            const fetchedToken = await AsyncStorage.getItem('token');
            if (!fetchedToken) {
                Alert.alert('Error', 'Token is missing');
                return;
            }
            const response = await axios.post(`${process.env.EXPO_BACKEND}/api/kyc/approve`, { id }, {
                headers: {
                    Authorization: `Bearer ${fetchedToken}`,
                },
            });
            if (response.status === 200) {
                Alert.alert('Success', 'KYC request approved successfully');
                fetchRequests();
            } else {
                Alert.alert('Error', 'Failed to approve KYC request');
            }
        } catch (error:any) {
            // console.error('Error approving KYC request:', error);
            Alert.alert('Error', 'Failed to approve KYC request');
        }
    };

    const handleRejection = async (id: string, comment: string) => {
        try {
            const fetchedToken = await AsyncStorage.getItem('token');
            if (!fetchedToken) {
                Alert.alert('Error', 'Token is missing');
                return;
            }
            const response = await axios.post(`${process.env.EXPO_BACKEND}/api/kyc/reject`, { id, comment }, {
                headers: {
                    Authorization: `Bearer ${fetchedToken}`,
                },
            });
            if (response.status === 200) {
                Alert.alert('Success', 'KYC request rejected successfully');
                fetchRequests();
            } else {
                Alert.alert('Error', 'Failed to reject KYC request');
            }
        } catch (error:any) {
            // console.error('Error rejecting KYC request:', error);
            Alert.alert('Error', 'Failed to reject KYC request');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4caf50" />
            </View>
        );
    }
    const onRefresh = () => {
        setIsRefreshing(true); // Set refreshing indicator
        fetchRequests(); // Fetch data again
    };

    return (
        <>
            <ScrollView contentContainerStyle={styles.scrollViewContainer} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#34D399']} />}>
                <Text style={styles.title}>KYC Requests</Text>
                {message ? (
                    <View style={styles.messageContainer}>
                        <Text style={styles.message}>{message}</Text>
                    </View>
                ) : (
                    kycRequests.map(request => (
                        <View key={request._id} style={styles.card}>
                            <Text style={styles.cardTitle}>{request.address.name}</Text>
                            <View style={styles.cardContent}>
                                <Text style={styles.label}>Aadhar Number:</Text>
                                <Text style={styles.value}>{request.aadharNumber}</Text>
                                <Text style={styles.label}>Current Address:</Text>
                                <Text style={styles.value}>{request.address.currentAddress}</Text>
                                <Text style={styles.label}>City:</Text>
                                <Text style={styles.value}>{request.address.city}</Text>
                                <Text style={styles.label}>State:</Text>
                                <Text style={styles.value}>{request.address.state}</Text>
                                <Text style={styles.label}>Phone Number:</Text>
                                <Text style={styles.value}>{request.address.phoneNumber}</Text>
                                <Text style={styles.label}>Email Address:</Text>
                                <Text style={styles.value}>{request.address.emailAddress}</Text>
                                <Text style={styles.label}>Status:</Text>
                                <Text style={styles.value}>{request.status}</Text>
                            </View>
                            <View style={styles.imageRow}>
                                <TouchableOpacity onPress={() => openFullScreenImage(request.aadharFront)}>
                                    <Image source={{ uri: request.aadharFront || 'https://via.placeholder.com/150' }} style={styles.image} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => openFullScreenImage(request.aadharBack)}>
                                    <Image source={{ uri: request.aadharBack || 'https://via.placeholder.com/150' }} style={styles.image} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => openFullScreenImage(request.panCardFront)}>
                                    <Image source={{ uri: request.panCardFront || 'https://via.placeholder.com/150' }} style={styles.image} />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Enter comment"
                                value={comment}
                                onChangeText={setComment}
                            />
                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={[styles.button, styles.approveButton]} onPress={() => handleApproval(request._id)}>
                                    <Text style={styles.buttonText}>Approve</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={() => handleRejection(request._id, comment)}>
                                    <Text style={styles.buttonText}>Reject</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    scrollViewContainer: {
        paddingVertical: 20,
        paddingHorizontal: 10,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    messageContainer: {
        padding: 20,
        backgroundColor: '#f8d7da',
        borderRadius: 10,
        marginHorizontal: 20,
    },
    message: {
        fontSize: 16,
        color: '#721c24',
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    cardContent: {
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#555',
    },
    value: {
        fontSize: 14,
        color: '#777',
        marginBottom: 5,
    },
    imageRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
        marginBottom: 10,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    commentInput: {
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    button: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    approveButton: {
        backgroundColor: '#4caf50',
    },
    rejectButton: {
        backgroundColor: '#f44336',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
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

export default KYCRequests;
