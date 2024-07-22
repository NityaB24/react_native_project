import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Animated, ScrollView, Alert, } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RetailerRedeem = () => {
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [retailerStatus, setRetailerStatus] = useState('');

    useEffect(() => {
        const checkTokenAndUserId = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const retailerId = await AsyncStorage.getItem('loggedId');
                if (!token || !retailerId) {
                    console.error('No token or retailerId found');
                    return;
                }
                const res = await axios.get(`${process.env.EXPO_BACKEND}/api/retailer/kyc/status`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setRetailerStatus(res.data.status); // Assuming status is returned as a string
            } catch (error:any) {
                console.error('Error fetching KYC status:', error);
            }
        };
        checkTokenAndUserId();
    }, []);
    

    const redeemPoints = async (points:number, method:string) => {
        try {
            if (retailerStatus === 'pending' || retailerStatus ==='rejected' ) {
                Alert.alert('Redemption Not Allowed', 'You cannot redeem points while KYC status is pending or rejected');
                return;
            }
    
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const retailerId = await AsyncStorage.getItem('loggedId');
            if (!token || !retailerId) {
                console.error('No token or retailerId found');
                return;
            }
            const res = await axios.post(`${process.env.EXPO_BACKEND}/api/retailer/request-redemption`, {
                retailerId,
                points,
                method
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setResponse(res.data);
            setError(null);
            Alert.alert(
                'Redemption Successful',
                `${points} points have been redeemed for ${method}`,
                [{ text: 'OK' }]
            );
        } catch (err:any) {
            // console.error('Redemption error:', err);
            Alert.alert('Insufficient Points or Something Went Wrong');
            setResponse(null);
        } finally {
            setLoading(false);
        }
    };
    

    const handleRedeem = (points:number, method:string) => {
        Alert.alert(
            'Confirm Redemption',
            `Are you sure you want to redeem ${points} points for ${method}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'OK', onPress: () => redeemPoints(points, method) }
            ],
            { cancelable: false }
        );
    };

    const redemptionOptions = [
        { method: 'Amazon', points: 1000, image: require('@/app/images/Amazon.png') },
        { method: 'Google', points: 500, image: require('@/app/images/Google.png') },
        { method: 'Xbox', points: 300, image: require('@/app/images/Xbox_2.jpg') }
    ];

    return (
        <>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Redeem Points</Text>
                </View>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <View style={styles.optionsContainer}>
                        {redemptionOptions.map((option, index) => (
                            <Animated.View key={index} style={styles.optionCard}>
                                <Image source={option.image} style={styles.optionImage} />
                                <View style={styles.optionDetails}>
                                    <Text style={styles.optionMethod}>{option.method}</Text>
                                    <Text style={styles.optionPoints}>Points: {option.points}</Text>
                                    <TouchableOpacity style={styles.redeemButton} onPress={() => handleRedeem(option.points, option.method)}>
                                        <Text style={styles.redeemButtonText}>Redeem</Text>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        ))}
                    </View>
                    {loading && <ActivityIndicator size="large" color="#0000ff" />}
                    {error && <Text style={styles.errorMessage}>{error}</Text>}
                </ScrollView>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    contentContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    header: {
        padding: 16,
        backgroundColor: '#1f2937',
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom:10,

    },
    headerTitle: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
        marginBottom: 20,
    },
    optionsContainer: {
        width: '100%',
        alignItems: 'center',
    },
    optionCard: {
        width: '90%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    optionImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        marginBottom: 15,
    },
    optionDetails: {
        alignItems: 'center',
    },
    optionMethod: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 10,
    },
    optionPoints: {
        fontSize: 18,
        color: '#1f2937',
        marginBottom: 20,
    },
    redeemButton: {
        backgroundColor: '#1f2937',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 5,
    },
    redeemButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    errorMessage: {
        marginTop: 20,
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    }
});

export default RetailerRedeem;
