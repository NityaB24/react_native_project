import React, { useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/context/Auth';
import { Drawer } from 'expo-router/drawer';
import { FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { View,Image } from 'react-native';
import CustomDrawerContent from '../../components/custom';
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isEnabled, setIsEnabled] = useState(true);

  return (
    <AuthProvider>
      <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />}>
        <Drawer.Screen
          name="index"
          options={{
            title: 'Dashboard',
            drawerIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={20} />
            ),
          }}
        />
        <Drawer.Screen
          name="RetailerRedeem"
          options={{
            title: 'Redeem Points',
            drawerIcon: ({ color, focused }) => (
              <MaterialIcons name={focused ? 'redeem' : 'redeem'} color={color} size={20} />
            ),
          }}
        />
        <Drawer.Screen
          name="CouponCodes"
          options={{
            title: 'Coupon Codes',
            drawerIcon: ({ color, focused }) => (
              <FontAwesome name={focused ? 'ticket' : 'ticket'} color={color} size={20} />
            ),
          }}
        />
        <Drawer.Screen
          name="RetailerUsers"
          options={{
            title: 'Transfer Points',
            drawerIcon: ({ color, focused }) => (
              <FontAwesome6 name={focused ? 'arrow-right-arrow-left' : 'arrow-right-arrow-left'} color={color} size={20} />
            ),
          }}
        />
        <Drawer.Screen
          name="pointsHistory"
          options={{
            title: 'Points History',
            drawerIcon: ({ color, focused }) => (
              <MaterialCommunityIcons name={focused ? 'history' : 'history'} color={color} size={20} />
            )
          }}
        />
        <Drawer.Screen
          name="RedeemHistory"
          options={{
            title: 'Redeem History',
            drawerIcon: ({ color, focused }) => (
              <MaterialCommunityIcons name={focused ? 'history' : 'history'} color={color} size={20} />
            )
          }}
        />
       
        <Drawer.Screen
          name="S3_kyc"
          options={{
            title: 'KYC',
            drawerIcon: ({ color, focused }) => (
              <FontAwesome name={focused ? 'id-card' : 'id-card-o'} color={color} size={20} />
            )
          }}
        />
        <Drawer.Screen
          name="Scheme"
          options={{
            title: 'Scheme',
            drawerIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'document-text' : 'document-text-outline'} color={color} size={20} />
            ),
          }}
        />
         <Drawer.Screen
          name="Profile_full"
          options={{
            title: 'Profile',
            drawerIcon: ({ color, focused }) => (
              <FontAwesome name={focused ? 'user-circle' : 'user-circle-o'} color={color} size={20} />
            )
          }}
        />
        <Drawer.Screen
            name="TransferPointsToUser/[userId]"
            options={{
              title: 'User Id',
              drawerLabel: () => null,
              drawerIcon: () => null,
              unmountOnBlur: false,
              freezeOnBlur:true,
            }}
          />
          
      </Drawer>
    </AuthProvider>
  );
}
