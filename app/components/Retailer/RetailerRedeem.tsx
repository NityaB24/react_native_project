import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, StyleSheet, Alert,TouchableOpacity,Animated ,ScrollView, ActivityIndicator,Easing } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomDrawer from './CustomDrawer';

const RetailerRedeem = () => {
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerAnim] = useState(new Animated.Value(-250));
  
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

    useEffect(() => {
        const checkTokenAndUserId = async () => {
            const token = await AsyncStorage.getItem("token");
            const retailerId = await AsyncStorage.getItem('retailerId');
            
            if (!token || !retailerId) {
                console.error('No token or userId found');
            }
        };
        checkTokenAndUserId();
    }, []);

    const redeemPoints = async (points:number, method:string) => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const retailerId = await AsyncStorage.getItem('retailerId');
            
            if (!token || !retailerId) {
                console.error('No token or userId found');
                return;
            }

            const res = await axios.post('http://192.0.0.2:3000/api/retailer/request-redemption', {
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
                [
                    { text: 'OK', onPress: () => console.log('OK Pressed') }
                ],
                { cancelable: false }
            );
        } catch (err) {
            console.error(err);
            
            console.error('Insufficient Points or Something Went Wrong');
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
        { method: 'amazon', points: 1000, image: "" },
        { method: 'google', points: 500, image: "" },
        { method: 'Xbox', points: 300, image: "" }
    ];

    return (
        <>
    <TouchableOpacity style={styles.drawerButton} onPress={openDrawer}>
        <Text style={styles.buttonText}>Menu</Text>
      </TouchableOpacity>
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <Text style={styles.title}>Redeem Points</Text>
                <View style={styles.optionsContainer}>
                    {redemptionOptions.map((option, index) => (
                        <View key={index} style={styles.optionCard}>
                            <Image source={require('@/app/images/Booking.png')} style={styles.optionImage} />
                            <View style={styles.optionDetails}>
                                <Text style={styles.optionMethod}>{option.method}</Text>
                                <Text style={styles.optionPoints}>Points: {option.points}</Text>
                                <Button
                                    title="Redeem"
                                    onPress={() => handleRedeem(option.points, option.method)}
                                    color="#1f2937"
                                />
                            </View>
                        </View>
                    ))}
                </View>
                {loading && <ActivityIndicator size="large" color="#0000ff" />}
                {error && <Text style={styles.errorMessage}>Error: {error}</Text>}
            </ScrollView>
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
        backgroundColor: '#f3f4f6',
    },
    contentContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop:30,
        marginBottom: 16,
        textAlign: 'center',
    },
    optionsContainer: {
        width: '100%',
        alignItems: 'center',
    },
    optionCard: {
        width: 200,
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    optionImage: {
        width: '100%',
        height: 120,
        borderRadius: 12,
        marginBottom: 10,
    },
    optionDetails: {
        alignItems: 'center',
    },
    optionMethod: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    optionPoints: {
        fontSize: 16,
        color: '#ef4444',
        marginBottom: 10,
    },
    successMessage: {
        marginTop: 20,
        color: 'green',
        fontSize: 16,
        textAlign: 'center',
    },
    errorMessage: {
        marginTop: 20,
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },

  buttonText: {
    color: 'black',
    fontWeight: 'bold',
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
});

export default RetailerRedeem;