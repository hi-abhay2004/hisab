import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { profileService } from './services/profileService';

import DashboardScreen from './screens/DashboardScreen';
import InvoiceScreen from './screens/InvoiceScreen';
import ProfileScreen from './screens/ProfileScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Dashboard');
  const [screenParams, setScreenParams] = useState({});
  const [profileChecked, setProfileChecked] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      const exists = await profileService.hasProfile();
      setProfileExists(exists);
      setCurrentScreen(exists ? 'Dashboard' : 'Profile');
      setProfileChecked(true);
    };
    checkProfile();
  }, []);

  const navigate = (screen, params = {}) => {
    setCurrentScreen(screen);
    setScreenParams(params);
  };

  const goBack = () => {
    setCurrentScreen('Dashboard');
    setScreenParams({});
  };

  const navigation = {
    navigate,
    goBack,
    addListener: () => () => {}, // Mock listener for compatibility
  };

  const route = {
    params: screenParams,
  };

  const handleProfileSaved = () => {
    setProfileExists(true);
    setCurrentScreen('Dashboard');
  };

  const renderScreen = () => {
    if (!profileChecked) return null;
    if (!profileExists) {
      return <ProfileScreen navigation={navigation} onProfileSaved={handleProfileSaved} />;
    }
    switch (currentScreen) {
      case 'Dashboard':
        return <DashboardScreen navigation={navigation} />;
      case 'Invoice':
        return <InvoiceScreen navigation={navigation} route={route} />;
      case 'Profile':
        return <ProfileScreen navigation={navigation} onProfileSaved={handleProfileSaved} />;
      default:
        return <DashboardScreen navigation={navigation} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#2c3e50" />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});
