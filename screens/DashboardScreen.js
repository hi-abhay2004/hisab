import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
  BackHandler,
  TextInput, // <-- Add TextInput import
  Image,
} from 'react-native';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { storageService } from '../services/storageService';
import { formatCurrency } from '../utils/helpers';
import { createDemoBills } from '../utils/demoHelper';

const DashboardScreen = ({ navigation }) => {
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(''); // <-- Add search state

  useEffect(() => {
    loadBills();
    
    // Handle Android back button - prevent app exit
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', onPress: () => BackHandler.exitApp() },
        ]
      );
      return true;
    });

    // Focus listener to refresh bills when returning to dashboard
    const unsubscribe = navigation.addListener('focus', () => {
      loadBills();
    });

    return () => {
      backHandler.remove();
      unsubscribe();
    };
  }, [navigation]);

  const loadBills = async () => {
    try {
      const allBills = await storageService.getAllBills();
      // Sort by creation date (newest first)
      const sortedBills = allBills.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setBills(sortedBills);
    } catch (error) {
      console.error('Error loading bills:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateBillTotal = (bill) => {
    let total = 0;
    bill.headers.forEach(header => {
      header.workItems.forEach(item => {
        total += item.totalRate || 0;
      });
    });
    return total;
  };

  const handleCreateNewBill = () => {
    navigation.navigate('Invoice');
  };

  const handleEditBill = (bill) => {
    navigation.navigate('Invoice', { editBill: bill });
  };

  const handleDeleteBill = (billId, billName) => {
    Alert.alert(
      'Delete Bill',
      `Are you sure you want to delete "${billName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await storageService.deleteBill(billId);
            if (success) {
              loadBills(); // Refresh the list
              Alert.alert('Success', 'Bill deleted successfully');
            } else {
              Alert.alert('Error', 'Failed to delete bill');
            }
          },
        },
      ]
    );
  };

  const handleCreateDemo = async () => {
    Alert.alert(
      'Create Demo Data',
      'This will add sample bills for testing. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async () => {
            const count = await createDemoBills();
            loadBills();
            Alert.alert('Success', `Created ${count} demo bills`);
          },
        },
      ]
    );
  };

  // Filter bills by search
  const filteredBills = bills.filter(bill =>
    bill.billName.toLowerCase().includes(search.toLowerCase())
  );

  const renderBillItem = ({ item }) => {
    const total = calculateBillTotal(item);
    const balance = total - (item.advanceAmount || 0);
    const itemCount = item.headers.reduce((count, header) => 
      count + header.workItems.length, 0
    );

    return (
      <View style={styles.billCard}>
        <View style={styles.billHeader}>
          <Text style={styles.billName}>{item.billName}</Text>
          <Text style={styles.billDate}>
            {new Date(item.createdAt).toLocaleDateString('en-IN')}
          </Text>
        </View>
        
        <View style={styles.billDetails}>
          <Text style={styles.billInfo}>
            {item.headers.length} sections • {itemCount} work items
          </Text>
          <Text style={styles.billAmount}>{formatCurrency(balance)}</Text>
        </View>

        <View style={styles.billActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditBill(item)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteBill(item.id, item.billName)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={require('../assets/hisab.png')}
              style={styles.appIcon}
              resizeMode="contain"
            />
            <Text style={styles.title}>Dashboard</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateNewBill}
          >
            <Text style={styles.createButtonText}>+ Create New Bill</Text>
          </TouchableOpacity>

          {/* Search Bar */}
          {bills.length > 0 && (
            <TextInput
              style={styles.searchBar}
              placeholder="Search bills by name..."
              placeholderTextColor="#888"
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
          )}

          <View style={styles.billsSection}>
            <Text style={styles.sectionTitle}>
              Saved Bills ({filteredBills.length})
            </Text>
            {filteredBills.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No bills found</Text>
                <Text style={styles.emptySubText}>
                  Try a different search or tap "Create New Bill"
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredBills}
                renderItem={renderBillItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.billsList}
              />
            )}
          </View>
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2c3e50',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileButton: {
    width: 40,
    height: 40,
    backgroundColor: '#3498db',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  createButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  billsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  billsList: {
    paddingBottom: 80, // Add padding to avoid phone navigation buttons
  },
  billCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  billName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  billDate: {
    fontSize: 14,
    color: '#666',
  },
  billDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  billInfo: {
    fontSize: 14,
    color: '#666',
  },
  billAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  billActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 15,
    color: '#222',
  },
  appIcon: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
});

export default DashboardScreen;
