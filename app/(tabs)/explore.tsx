import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link } from 'expo-router';
import { NavigationAction } from '@react-navigation/native';
export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="code-slash" style={styles.headerImage} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>
      <ThemedText>This app includes example code to help you get started.</ThemedText>
      <Collapsible title="User Routes">
      
        <Link href="/components/User/userpoints">
          <ThemedText type="link">Check User Points</ThemedText>
        </Link>
        <Link href="/components/User/RedeemptionForm">
          <ThemedText type="link">Redeem Points</ThemedText>
        </Link>
      </Collapsible>
      <Collapsible title="Retailer Routes">

        <Link href="/components/Retailer/retailer">
          <ThemedText type="link">Login retailer</ThemedText>
        </Link>
        <Link href="/components/Retailer/retailerpoints">
          <ThemedText type="link">Check points</ThemedText>
        </Link>
        <Link href="/components/Retailer/RetailerRedeem">
          <ThemedText type="link">Redeem points</ThemedText>
        </Link>
        <Link href="/components/Retailer/AddUserToRetailer">
          <ThemedText type="link">Add New User</ThemedText>
        </Link>
        <Link href="/components/Retailer/RetailerUsers">
          <ThemedText type="link">All users</ThemedText>
        </Link>
       
      </Collapsible>

      <Collapsible title="Manufacturer Routes">

        <Link href="/components/Manufacturer/login">
          <ThemedText type="link">Login manufacturer</ThemedText>
        </Link>
        <Link href="/components/Manufacturer/Dashboard">
          <ThemedText type="link">Dashboard</ThemedText>
        </Link>
        <Link href="/components/Manufacturer/RedemptionRequests">
          <ThemedText type="link">Approve Redeem</ThemedText>
        </Link>
        <Link href="/components/Manufacturer/User_redemption_request">
          <ThemedText type="link">Approve User Redeem</ThemedText>
        </Link>
        <Link href="/components/Manufacturer/App">
          <ThemedText type="link">App</ThemedText>
        </Link>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
