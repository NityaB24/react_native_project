import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Sidebar = () => {
    return (
        <View style={styles.sidebar}>
            <TouchableOpacity style={styles.overlay}></TouchableOpacity>
            <View style={styles.sidebarContent}>
                <TouchableOpacity style={styles.closeButton}>
                    {/* Close button icon */}
                </TouchableOpacity>
                <View style={styles.menuItems}>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text>Check Points</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text>Redeem Points</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text>Services</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text>Contact</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sidebar: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 250,
        height: '100%',
        backgroundColor: '#f8f9fa',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.1,
        zIndex: 2,
    },
    sidebarContent: {
        flex: 1,
        paddingTop: 20,
        paddingLeft: 10,
    },
    closeButton: {
        // Close button styles
    },
    menuItems: {
        // Menu items styles
    },
    menuItem: {
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
    },
});

export default Sidebar;