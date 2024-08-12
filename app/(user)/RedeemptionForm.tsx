import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, StyleSheet, Alert, TouchableOpacity, ScrollView, ActivityIndicator, Animated, Easing,TextInput } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RadioButton } from 'react-native-paper';
const RedemptionForm = () => {
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [retailerStatus, setRetailerStatus] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('bank'); // 'bank' or 'upi'
    const [holderName, setHolderName] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [upiNumber, setUpiNumber] = useState(''); const [pointsRedeemed, setPointsRedeemed] = useState<number>(0);
    const [pointstobeRedeemed, setPointstobeRedeemed] = useState<number>(0);

    const [pointsInput, setPointsInput] = useState<string>('');
    const [fee, setFee] = useState<number>(0);
    useEffect(() => {
        const checkTokenAndUserId = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const userId = await AsyncStorage.getItem('loggedId');
                if (!token || !userId) {
                    console.error('No token or retailerId found');
                    return;
                }
                const res = await axios.get(`${process.env.EXPO_BACKEND}/api/users/kyc/status`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setRetailerStatus(res.data.status); // Assuming status is returned as a string
            } catch (error) {
                console.error('Error fetching KYC status:', error);
            }
        };

        const fetchPoints = async () => {
            setLoading(true);
            try {
                const token = await AsyncStorage.getItem('token'); // Fetch token from AsyncStorage
                if (!token) {
                    console.error('No token found');
                    return;
                }
                const response = await axios.get(`${process.env.EXPO_BACKEND}/api/users/points`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setPointsRedeemed(response.data.pointsRedeemed);
                setPointstobeRedeemed(response.data.points_to_be_Redeemed);
            } catch (error) {
                // console.error('Error fetching points:', error);
                Alert.alert('Error fetching points');
            } finally {
                setLoading(false);
            }
        };
        checkTokenAndUserId();
        fetchPoints();
    }, []);

    const redeemPoints = async (points:number) => {
        try {
            if (retailerStatus === 'pending' || retailerStatus ==='rejected' ) {
                Alert.alert('Redemption Not Allowed', 'You cannot redeem points while KYC status is pending or rejected');
                return;
            }
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const userId = await AsyncStorage.getItem('loggedId');
            
            if (!token || !userId) {
                console.error('No token or userId found');
                return;
            }

            const res = await axios.post(`${process.env.EXPO_BACKEND}/api/users/request-redemption`, {
                userId,
                points,
                method:selectedMethod,
                holderName: selectedMethod === 'bank' ? holderName : null,
                ifscCode: selectedMethod === 'bank' ? ifscCode : null,
                accountNumber: selectedMethod === 'bank' ? accountNumber : null,
                upiNumber: selectedMethod === 'upi' ? upiNumber : null
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setResponse(res.data);
            setError(null);
            Alert.alert(
                'Redemption Successful',
                `${points} points have been redeemed for ${selectedMethod}`,
                [
                    { text: 'OK', onPress: () => console.log('OK Pressed') }
                ],
                { cancelable: false }
            );
        } catch (err:any) {
            // console.error('Insufficient Points or Something Went Wrong');
            Alert.alert('Insufficient Points or Something Went Wrong');
            setResponse(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = () => {
        const points = parseFloat(pointsInput);

        if (points < 10000) {
            Alert.alert('Invalid Points', 'Please enter points greater than 10,000');
            return;
        }
        if (selectedMethod === 'bank' && (!holderName || !ifscCode || !accountNumber)) {
            Alert.alert('Missing Information', 'Please fill out all bank details');
            return;
        } else if (selectedMethod === 'upi' && !upiNumber) {
            Alert.alert('Missing Information', 'Please fill out the UPI number');
            return;
        }
        Alert.alert(
            'Confirm Redemption',
            `Are you sure you want to redeem ${points} points for Direct Bank Transfer?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'OK', onPress: () => redeemPoints(points) }
            ],
            { cancelable: false }
        );
    };
    const handlePointsChange = (text: string) => {
        const points = parseFloat(text) || 0;
        setPointsInput(text);
        setFee(points * 0.02);
    };


    return (
        <>
            <View style={styles.container}>
                
            <View style={styles.pointsContainer}>
                    <Text style={styles.pointsText}>Total Points Redeemed: {pointsRedeemed}</Text>
                    <Text style={styles.pointsText}>Points to be Redeemed: {pointstobeRedeemed}</Text>
                </View>

                <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.radioContainer}>
                        <View style={styles.radioButton}>
                            <RadioButton
                                value="bank"
                                status={selectedMethod === 'bank' ? 'checked' : 'unchecked'}
                                onPress={() => setSelectedMethod('bank')}
                            />
                            <Text style={styles.radioLabel}>Bank Details</Text>
                        </View>
                        <View style={styles.radioButton}>
                            <RadioButton
                                value="upi"
                                status={selectedMethod === 'upi' ? 'checked' : 'unchecked'}
                                onPress={() => setSelectedMethod('upi')}
                            />
                            <Text style={styles.radioLabel}>UPI</Text>
                        </View>
                    </View>

                    {selectedMethod === 'bank' && (
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Account Holder Name"
                                value={holderName}
                                onChangeText={setHolderName}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="IFSC Code"
                                value={ifscCode}
                                onChangeText={setIfscCode}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Account Number"
                                value={accountNumber}
                                onChangeText={setAccountNumber}
                                keyboardType="numeric"
                                maxLength={12}
                            />
                        </View>
                    )}

                    {selectedMethod === 'upi' && (
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="UPI Number"
                                value={upiNumber}
                                onChangeText={setUpiNumber}
                                keyboardType="numeric"
                                maxLength={10}
                            />
                        </View>
                    )}


<Animated.View style={styles.optionCard}>
                <Image source={require('@/app/images/bank.png')} style={styles.optionImage} />
                </Animated.View>

                <View style={styles.pointsInputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Points"
                        value={pointsInput}
                        onChangeText={handlePointsChange}
                        keyboardType="numeric"
                    />
                    <Text style={styles.feeText}>{pointsInput} Points Worth: ₹{fee.toFixed(2)}</Text>
                </View>

                <TouchableOpacity style={styles.redeemButton} onPress={handleRedeem}>
                    <Text style={styles.redeemButtonText}>Redeem</Text>
                </TouchableOpacity>

                {loading && <ActivityIndicator size="large" color="#0000ff" />}
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
        backgroundColor: '#1F2937',
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
    },
    radioContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        borderColor: 'lightgrey',
        borderWidth: 1,
        borderRadius: 10,
        padding: 8,
    },
    radioLabel: {
        fontSize: 16,
        color: '#333',
    },
    inputContainer: {
        width: '90%',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 5,
        marginBottom: 10,
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    pointsContainer: {
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#1f2937',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: 10,
    },
    pointsText: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    pointsInputContainer: {
        width: '90%',
        marginBottom: 20,
    },
    feeText: {
        fontSize: 16,
        color: '#333',
        marginTop: 5,
        textAlign: 'center',
    },
});
export default RedemptionForm;
