import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, RefreshControl, Alert, TextInput } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';

interface User {
    _id: string;
    name: string;
    phone: string;
    points: number;
}

const RetailerUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchUsers();
        const checkTokenAndUserId = async () => {
            const token = await AsyncStorage.getItem("token");
            const retailerId = await AsyncStorage.getItem('loggedId');
            
            if (!token || !retailerId) {
                console.error('No token or userId found');
            }
        };
        checkTokenAndUserId();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const retailerId = await AsyncStorage.getItem('loggedId');
            if (!token || !retailerId) {
                setMessage('No token or retailerId found');
                return;
            }
            const response = await axios.get(`${process.env.EXPO_BACKEND}/api/retailer/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(response.data.users);
        } catch (error: any) {
            setMessage('Error fetching users');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleAddUser = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const retailerId = await AsyncStorage.getItem('loggedId');
            if (!token || !retailerId) {
                setMessage('No token or retailerId found');
                return;
            }
            const response = await axios.post(`${process.env.EXPO_BACKEND}/api/retailer/addusers`, { retailerId, phone }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            Alert.alert("Plumber Added Successfully");
            setPhone('');
        } catch (error) {
            Alert.alert('Error Occurred:\n Please check the entered Phone Number');
        } finally {
            fetchUsers();
            setLoading(false);
        }
    };

    const handleDelete = async (userId: string) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this plumber?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('token');
                            if (!token) {
                                setMessage('No token found');
                                return;
                            }
                            await axios.delete(`${process.env.EXPO_BACKEND}/api/retailer/users/${userId}`, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            });
                            Alert.alert('Plumber Deleted Successfully');
                            fetchUsers();
                        } catch (error: any) {
                            Alert.alert('Error', 'Failed to delete plumber');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };
    

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchUsers();
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        colors={['#1A73E8']}
                    />
                }
            >
                <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={(text) => setPhone(text)}
                    placeholder="Enter Plumber Phone Number"
                    placeholderTextColor="#999"
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
                    <Text style={styles.addButtonText}>Add Plumber</Text>
                </TouchableOpacity>

                {loading && <ActivityIndicator size="large" color="#6200EE" />}
                {message ? (
                    <View style={styles.messageContainer}>
                        <Text style={styles.message}>{message}</Text>
                    </View>
                ) : (
                    users.map(user => (
                        <View key={user._id} style={styles.userCard}>
                            <Text style={styles.username}>{user.name}</Text>
                            <Text style={styles.userInfo}>
                                <Text style={styles.label}>Phone:</Text> {user.phone}
                            </Text>
                            {/* <Text style={styles.userInfo}>
                                <Text style={styles.label}>Points:</Text> {user.points}
                            </Text> */}
                            <View style={styles.buttonContainer}>
                                <Link href={`/TransferPointsToUser/${user._id}`} style={[styles.button, styles.transferButton]}>
                                    <Text style={styles.buttonText}>Transfer Points</Text>
                                </Link>
                                <TouchableOpacity
                                    style={[styles.button, styles.deleteButton]}
                                    onPress={() => handleDelete(user._id)}
                                >
                                    <Text style={styles.buttonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    scrollViewContent: {
        padding: 20,
    },
    input: {
        width: '100%',
        padding: 15,
        marginBottom: 20,
        borderColor: '#E2E8F0',
        borderWidth: 1,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        fontSize: 16,
    },
    addButton: {
        backgroundColor: '#2a4853',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom:10,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    messageContainer: {
        marginTop: 20,
        padding: 15,
        borderRadius: 12,
        backgroundColor: '#E53E3E',
        alignItems: 'center',
    },
    message: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    userCard: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    username: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    userInfo: {
        fontSize: 16,
        marginBottom: 4,
        color: '#555',
    },
    label: {
        fontWeight: 'bold',
        color: '#4A5568',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        marginRight: 10,
        borderRadius: 8,
    },
    transferButton: {
        backgroundColor: '#2D3748',
    },
    deleteButton: {
        backgroundColor: '#E53E3E',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

export default RetailerUsers;
