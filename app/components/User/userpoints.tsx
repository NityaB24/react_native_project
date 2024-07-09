import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, SafeAreaView,TouchableOpacity,Animated,Easing } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomDrawer from './CustomDrawer';


// Define the transaction type
interface Transaction {
    date: string;
    type: string;
    points: number;
}

const userpoints = () => {
    const [username, setUsername] = useState<string | null>(null);
    const [coupon, setCoupon] = useState<string | null>(null);
    const [points, setPoints] = useState<number | null>(null);
    const [pointsRedeemed, setPointsRedeemed] = useState<number | null>(null);
    const [pointsReceived, setPointsReceived] = useState<number | null>(null);
    const [last5Transactions, setLast5Transactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
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
        fetchPoints();
    }, []);

    const fetchPoints = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token'); // Fetch token from AsyncStorage
            if (!token) {
                console.error('No token found');
                return;
            }
            const response = await axios.get('http://192.0.0.2:3000/api/users/points', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsername(response.data.username);
            setCoupon(response.data.couponCodes)
            setPoints(response.data.points);
            setPointsRedeemed(response.data.pointsRedeemed);
            setPointsReceived(response.data.pointsReceived);
            setLast5Transactions(response.data.last5Entries);
        } catch (error) {
            console.error('Error fetching points:', error);
        } finally {
            setLoading(false);
        }
    };
    const format12Hour = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

    const renderItem = ({ item }: { item: Transaction }) => (
        <View style={styles.transactionItem}>
            <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()} , {format12Hour(item.date)}</Text>
            <Text style={styles.transactionDetails}>{item.type} {item.points} points</Text>
        </View>
    );

    return (
        <>
    <TouchableOpacity style={styles.drawerButton} onPress={openDrawer}>
        <Text style={styles.buttonText}>Menu</Text>
      </TouchableOpacity>
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Welcome: {username}</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    points !== null ? (
                        <View style={styles.pointsContainer}>
                            <View style={styles.pointBox}>
                                <Text style={styles.pointValue}>
                                    {(pointsReceived !== null && pointsRedeemed !== null) ? (pointsReceived - pointsRedeemed) : 0}
                                </Text>
                                <Text style={[styles.pointLabel, { color: '#3b82f6' }]}>Points Left</Text>
                            </View>
                            <View style={styles.pointBox}>
                                <Text style={styles.pointValue}>{pointsRedeemed}</Text>
                                <Text style={[styles.pointLabel, { color: '#10b981' }]}>Points Redeemed</Text>
                            </View>
                            <View style={styles.pointBox}>
                                <Text style={styles.pointValue}>{pointsReceived}</Text>
                                <Text style={[styles.pointLabel, { color: '#ef4444' }]}>Points Received</Text>
                            </View>
                            {/* <View style={styles.pointBox}>
                                <Text style={styles.pointValue}>{coupon}</Text>
                                <Text style={[styles.pointLabel, { color: '#ef4444' }]}>Coupon Codes</Text>
                            </View> */}
                            <View style={styles.transactionsContainer}>
                                <Text style={styles.transactionsTitle}>Last 5 Transactions:</Text>
                                <FlatList
                                    data={last5Transactions}
                                    renderItem={renderItem}
                                    keyExtractor={(item, index) => index.toString()}
                                />
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.noPointsText}>No points available</Text>
                    )
                )}
            </View>
        </SafeAreaView>
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderRadius: 8,
        padding: 16,
        width: '90%',
        maxWidth: 400,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    pointsContainer: {
        width: '100%',
        alignItems: 'center',
    },
    pointBox: {
        backgroundColor: '#262525',
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    pointValue: {
        fontSize: 24,
        color: '#d1d5db',
    },
    pointLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    transactionsContainer: {
        backgroundColor: '#252525',
        padding: 16,
        marginTop: 16,
        borderRadius: 8,
        width: '100%',
    },
    transactionsTitle: {
        fontSize: 18,
        color: '#a855f7',
        marginBottom: 8,
    },
    transactionItem: {
        marginBottom: 8,
    },
    transactionDate: {
        fontSize: 14,
        color: '#d1d5db',
    },
    transactionDetails: {
        fontSize: 16,
        color: '#d1d5db',
    },
    noPointsText: {
        fontSize: 18,
        color: 'red',
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

export default userpoints;
