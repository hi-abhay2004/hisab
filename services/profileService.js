import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = 'user_profile';

export const profileService = {
  // Save user profile
  async saveProfile(profile) {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  },

  // Get user profile
  async getProfile() {
    try {
      const profile = await AsyncStorage.getItem(PROFILE_KEY);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  },

  // Check if profile exists
  async hasProfile() {
    try {
      const profile = await this.getProfile();
      return profile !== null;
    } catch (error) {
      return false;
    }
  }
};
