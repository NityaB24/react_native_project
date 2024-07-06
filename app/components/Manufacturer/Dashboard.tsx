import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Animated, Easing, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Link } from 'expo-router';
import CustomDrawer from './CustomDrawer';
import { ThemedText } from '@/components/ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define a type for the retailer object
interface Retailer {
    _id: string;
    name: string;
    email: string;
    pointsReceived: number;
}

const Dashboard = () => {
    const [retailers, setRetailers] = useState<Retailer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [message, setMessage] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerAnim] = useState(new Animated.Value(-250));
    const [token, setToken] = useState<string | null>(null); // Replace with actual token fetching logic
    const [manuId, setManuId] = useState<string | null>(null); // Replace with actual manuId fetching logic

    // mobile hotspot (192.0.0.2)
    // office (192.168.1.4)

    useEffect(() => {
        fetch();
    }, []);

    const fetch = async()=>{
        // Replace the following with your actual token and manuId fetching logic
        const fetchedToken = await AsyncStorage.getItem('token'); // Replace with actual logic
        const fetchedManuId = await AsyncStorage.getItem('manufacturerId'); // Replace with actual logic

        setToken(fetchedToken);
        setManuId(fetchedManuId);

        if (fetchedToken && fetchedManuId) {
            axios.get('http://192.0.0.2:3000/api/retailer', {
                headers: {
                    Authorization: `Bearer ${fetchedToken}`,
                },
            })
            .then(response => {
                setRetailers(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching retailers:', error);
                setLoading(false);
            });
        }
    }
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

    if (loading || !token || !manuId) {
        return <ActivityIndicator size="large" color="#0000ff" style={{flex: 1, justifyContent: 'center'}} />;
    }

    return (
        <>
        <TouchableOpacity style={styles.drawerButton} onPress={openDrawer}>
        <Text style={styles.buttonText}>Menu</Text>
      </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Retailers</Text>
            {message ? (
                <View style={styles.messageContainer}>
                    <Text style={styles.message}>{message}</Text>
                </View>
            ) : (
                retailers.map(retailer => (
                    <View key={retailer._id} style={styles.userCard}>
                        <Text style={styles.username}>{retailer.name}</Text>
                        <Text style={styles.userInfo}>
                            <Text style={styles.label}>Email:</Text> {retailer.email}
                        </Text>
                        <Text style={styles.userInfo}>
                            <Text style={styles.label}>Points:</Text> {retailer.pointsReceived}
                        </Text>
                        <Link href="/components/Manufacturer/TransferPointsToRetailer/${retailer._id}">
                            <ThemedText type="link">Transfer Points</ThemedText>
                        </Link>
                    </View>
                ))
            )}
        </ScrollView>
        <Animated.View style={[styles.drawerWrapper, { transform: [{ translateX: drawerAnim }] }]}>
        <CustomDrawer isOpen={isDrawerOpen} closeDrawer={closeDrawer} />
      </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f3f4f6',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333', // Darkened text color for better contrast
    },
    messageContainer: {
        marginTop: 20,
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    message: {
        textAlign: 'center',
        color: 'red',
    },
    userCard: {
        width: '100%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        // New border style
        borderWidth: 1,
        borderColor: '#000', 
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333', // Darkened text color for better contrast
    },
    userInfo: {
        fontSize: 16,
        marginBottom: 4,
        color: '#555', // Slightly lighter text color
    },
    label: {
        fontWeight: 'bold',
        color: '#555', // Slightly lighter text color
    },
    linkText: {
        color: '#1a73e8', // Google's Material Design link color
        textDecorationLine: 'underline',
        marginTop: 8,
        textAlign: 'center',
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

export default Dashboard;