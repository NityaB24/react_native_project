import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView,Animated,Easing,TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { Link } from 'expo-router';
import CustomDrawer from './CustomDrawer';

// Define a type for the user object
interface User {
    _id: string;
    username: string;
    email: string;
    points: number;
}

const RetailerUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
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
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem('token');
                const retailerId = await AsyncStorage.getItem('retailerId');
                if (!token || !retailerId) {
                    setMessage('No token or retailerId found');
                    return;
                }
                const response = await axios.get('http://192.0.0.2:3000/api/retailer/users', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUsers(response.data.users);
            } catch (error) {
                setMessage('Error fetching users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <>
    <TouchableOpacity style={styles.drawerButton} onPress={openDrawer}>
        <Text style={styles.buttonText}>Menu</Text>
      </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Plumbers</Text>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {message ? (
                <View style={styles.messageContainer}>
                    <Text style={styles.message}>{message}</Text>
                </View>
            ) : (
                users.map(user => (
                    <View key={user._id} style={styles.userCard}>
                        <Text style={styles.username}>{user.username}</Text>
                        <Text style={styles.userInfo}>
                            <Text style={styles.label}>Email:</Text> {user.email}
                        </Text>
                        <Text style={styles.userInfo}>
                            <Text style={styles.label}>Points:</Text> {user.points}
                        </Text>
                        <Link href={`/components/TransferPointsToUser/${user._id}`}>
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

export default RetailerUsers;
