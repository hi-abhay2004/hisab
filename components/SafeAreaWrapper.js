import React from 'react';
import { View, StyleSheet } from 'react-native';

const SafeAreaWrapper = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 30, // Safe area for navigation buttons
  },
});

export default SafeAreaWrapper;
