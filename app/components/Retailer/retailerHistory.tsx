import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Animated, Easing } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomDrawer from './CustomDrawer';

interface Transaction {
    date: string;
    type: string;
    points: number;
    expiryDate: string;
}

const RetailerHistory = () => {
    const [allEntries, setAllEntries] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerAnim] = useState(new Animated.Value(-300));

    useEffect(() => {
        fetchPoints();
    }, []);

    const fetchPoints = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const retailerId = await AsyncStorage.getItem('retailerId');
            if (!token) {
                console.error('No token found');
                return;
            }
            const response = await axios.get('http://192.0.0.2:3000/api/retailer/allentries', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setAllEntries(response.data.allEntries);
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
            <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()} • {format12Hour(item.date)}</Text>
            <Text style={styles.transactionDate}>Expiry Date: {new Date(item.expiryDate).toLocaleDateString()} • {format12Hour(item.expiryDate)}</Text>
            <Text style={styles.transactionDetails}>{item.type} • {item.points} points</Text>
        </View>
    );

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
            toValue: -300,
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
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Points History</Text>
                </View>
                <View style={styles.content}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#6B7280" />
                    ) : (
                        <FlatList
                            data={allEntries}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={styles.listContainer}
                        />
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
        backgroundColor: '#FFFFFF',
    },
    header: {
        padding: 16,
        backgroundColor: '#1F2937',
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    listContainer: {
        paddingBottom: 20,
    },
    transactionItem: {
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    transactionDate: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    transactionDetails: {
        fontSize: 16,
        color: '#111827',
        fontWeight: 'bold',
    },
    drawerButton: {
        backgroundColor: '#1F2937',
        padding: 15,
        borderBottomWidth: 1,
        borderColor: '#374151',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    drawerWrapper: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: 200,
        backgroundColor: '#FFFFFF',
        zIndex: 1000,
        borderRightWidth: 1,
        borderColor: '#E5E7EB',
    },
});

export default RetailerHistory;
