import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ScrollView, 
  Modal, SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import generatePDF from './utils/generatePDF';
import WorkItemForm from './components/WorkItemForm';
import HeaderSection from './components/HeaderSection';

const SCREEN = {
  DASHBOARD: 'dashboard',
  BILL: 'bill',
};

const PROFILE_KEY = '@profile';

export default function App() {
  const [screen, setScreen] = useState(SCREEN.DASHBOARD);
  const [billName, setBillName] = useState('');
  const [currentHeader, setCurrentHeader] = useState('');
  const [headers, setHeaders] = useState([]); // Array of {name, items: []}
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingHeaderIndex, setEditingHeaderIndex] = useState(-1);
  const [savedBills, setSavedBills] = useState([]); // [{key, billName, date}]
  const [selectedBillKey, setSelectedBillKey] = useState(null);
  const [search, setSearch] = useState('');
  const [profile, setProfile] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({ company: '', phone: '', address: '' });
  const searchInputRef = useRef();

  useEffect(() => {
    loadProfile();
    fetchSavedBills();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await AsyncStorage.getItem(PROFILE_KEY);
      if (data) {
        setProfile(JSON.parse(data));
      } else {
        setShowProfileForm(true);
      }
    } catch {
      setShowProfileForm(true);
    }
  };

  const saveProfile = async () => {
    if (!profileForm.company.trim() || !profileForm.phone.trim() || !profileForm.address.trim()) {
      Alert.alert('Error', 'Please fill all profile fields');
      return;
    }
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profileForm));
    setProfile(profileForm);
    setShowProfileForm(false);
  };

  const fetchSavedBills = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const invoiceKeys = keys.filter(key => key.startsWith('@invoice_'));
      const bills = [];
      for (const key of invoiceKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const bill = JSON.parse(data);
          bills.push({ key, billName: bill.billName, date: new Date(parseInt(key.split('_').pop(), 10)) });
        }
      }
      // Sort by date descending
      bills.sort((a, b) => b.date - a.date);
      setSavedBills(bills);
    } catch (error) {
      setSavedBills([]);
    }
  };

  const startNewBill = () => {
    setBillName('');
    setHeaders([]);
    setCurrentHeader('');
    setEditingItem(null);
    setEditingHeaderIndex(-1);
    setSelectedBillKey(null);
    setScreen(SCREEN.BILL);
  };

  const loadBillForEdit = async (billKey) => {
    try {
      const data = await AsyncStorage.getItem(billKey);
      if (data) {
        const bill = JSON.parse(data);
        setBillName(bill.billName || '');
        setHeaders(bill.headers || []);
        setCurrentHeader('');
        setEditingItem(null);
        setEditingHeaderIndex(-1);
        setSelectedBillKey(billKey);
        setScreen(SCREEN.BILL);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load bill');
    }
  };

  const addHeader = () => {
    if (!currentHeader.trim()) {
      Alert.alert('Error', 'Please enter a header name');
      return;
    }
    if (headers.some(h => h.name.toLowerCase() === currentHeader.toLowerCase())) {
      Alert.alert('Error', 'Header already exists');
      return;
    }
    setHeaders([...headers, { name: currentHeader, items: [] }]);
    setCurrentHeader('');
  };

  const deleteHeader = (headerIndex) => {
    Alert.alert(
      'Delete Header',
      'Are you sure you want to delete this header and all its items?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const newHeaders = headers.filter((_, index) => index !== headerIndex);
            setHeaders(newHeaders);
          }
        }
      ]
    );
  };

  const addOrUpdateWorkItem = (item) => {
    if (editingHeaderIndex === -1) {
      Alert.alert('Error', 'Please select a header first');
      return;
    }
    const newHeaders = [...headers];
    if (editingItem) {
      // Update existing item
      const itemIndex = newHeaders[editingHeaderIndex].items.findIndex(
        (workItem, index) => editingItem.originalIndex === index
      );
      if (itemIndex !== -1) {
        newHeaders[editingHeaderIndex].items[itemIndex] = item;
      }
      setEditingItem(null);
    } else {
      // Add new item
      newHeaders[editingHeaderIndex].items.push(item);
    }
    setHeaders(newHeaders);
    setShowForm(false);
    setEditingHeaderIndex(-1);
  };

  const editWorkItem = (headerIndex, itemIndex) => {
    const item = headers[headerIndex].items[itemIndex];
    setEditingItem({ ...item, originalIndex: itemIndex });
    setEditingHeaderIndex(headerIndex);
    setShowForm(true);
  };

  const deleteWorkItem = (headerIndex, itemIndex) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this work item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newHeaders = [...headers];
            newHeaders[headerIndex].items.splice(itemIndex, 1);
            setHeaders(newHeaders);
          }
        }
      ]
    );
  };

  const openFormForHeader = (headerIndex) => {
    if (headerIndex < 0 || headerIndex >= headers.length) {
      Alert.alert('Error', 'Invalid header selected for adding work item.');
      return;
    }
    setEditingHeaderIndex(headerIndex);
    setEditingItem(null);
    setShowForm(true);
  };

  const saveBill = async () => {
    if (!billName.trim()) {
      Alert.alert('Error', 'Please enter a bill name');
      return;
    }
    if (headers.length === 0) {
      Alert.alert('Error', 'Please add at least one header');
      return;
    }

    try {
      const bill = { billName, headers };
      await AsyncStorage.setItem(`@invoice_${billName}_${Date.now()}`, JSON.stringify(bill));
      Alert.alert('Success', 'Bill saved successfully!');
      fetchSavedBills(); // Refresh saved bills list
    } catch (error) {
      Alert.alert('Error', 'Failed to save bill');
    }
  };

  const exportPDF = async () => {
    if (!billName.trim()) {
      Alert.alert('Error', 'Please enter a bill name');
      return;
    }
    if (headers.length === 0 || headers.every(h => h.items.length === 0)) {
      Alert.alert('Error', 'Please add at least one work item');
      return;
    }
    try {
      await generatePDF(billName, headers, profile);
      Alert.alert('Success', 'PDF generated and shared successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const deleteBill = async (billKey) => {
    Alert.alert(
      'Delete Bill',
      'Are you sure you want to delete this bill? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(billKey);
            fetchSavedBills();
            if (selectedBillKey === billKey) startNewBill();
          }
        }
      ]
    );
  };

  const getTotalAmount = () => {
    return headers.reduce((total, header) => 
      total + header.items.reduce((headerTotal, item) => headerTotal + item.total, 0), 0
    );
  };

  if (showProfileForm) {
    return (
      <SafeAreaView style={styles.container}>
        <ExpoStatusBar style="dark" />
        <Navbar />
        <View style={[styles.section, { marginTop: 40 }]}> 
          <Text style={styles.sectionTitle}>Your Profile</Text>
          <View style={styles.profileFormGroup}>
            <TextInput
              style={[styles.input, styles.profileInput]}
              placeholder="Company Name"
              value={profileForm.company}
              onChangeText={v => setProfileForm(f => ({ ...f, company: v }))}
            />
            <TextInput
              style={[styles.input, styles.profileInput]}
              placeholder="Phone Number"
              value={profileForm.phone}
              onChangeText={v => setProfileForm(f => ({ ...f, phone: v }))}
              keyboardType="phone-pad"
            />
            <TextInput
              style={[styles.input, styles.profileInput, { minHeight: 60 }]}
              placeholder="Address"
              value={profileForm.address}
              onChangeText={v => setProfileForm(f => ({ ...f, address: v }))}
              multiline
            />
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
            <Text style={styles.buttonText}>Save Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Navbar component
  function Navbar() {
    return (
      <View style={styles.navbar}>
        {screen !== SCREEN.DASHBOARD && (
          <TouchableOpacity style={styles.navbarBack} onPress={() => setScreen(SCREEN.DASHBOARD)}>
            <Text style={styles.navbarBackText}>← Dashboard</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.navbarProfile} onPress={() => {
          setProfileForm(profile || { company: '', phone: '', address: '' });
          setShowProfileForm(true);
        }}>
          <Text style={styles.navbarProfileIcon}>👤</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (screen === SCREEN.DASHBOARD) {
    const filteredBills = savedBills.filter(bill =>
      bill.billName.toLowerCase().includes(search.toLowerCase())
    );
    return (
      <SafeAreaView style={styles.container}>
        <ExpoStatusBar style="dark" />
        <Navbar />
        <View style={styles.dashboardHeader}>
          <Text style={styles.appTitle}>🔨 Carpenter Invoice</Text>
        </View>
        <View style={styles.dashboardButtons}>
          <TouchableOpacity style={styles.createButton} onPress={startNewBill}>
            <Text style={styles.buttonText}>Create New Bill</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.editButton, savedBills.length === 0 && { opacity: 0.5 }]}
            disabled={savedBills.length === 0}
            onPress={() => {
              if (savedBills.length > 0) loadBillForEdit(savedBills[0].key);
            }}
          >
            <Text style={styles.buttonText}>Edit Bill</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.savedBillsSection}>
          <Text style={styles.sectionTitle}>Saved Bills</Text>
          <TextInput
            ref={searchInputRef}
            style={styles.input}
            placeholder="Search bills by name..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#666"
          />
          <ScrollView style={{ maxHeight: 300 }}>
            {filteredBills.length === 0 && (
              <Text style={styles.emptyText}>No saved bills found.</Text>
            )}
            {filteredBills.map((bill, idx) => (
              <View key={bill.key} style={styles.billListItemRow}>
                <TouchableOpacity
                  style={styles.billListItem}
                  onPress={() => loadBillForEdit(bill.key)}
                >
                  <Text style={styles.billListTitle}>{bill.billName}</Text>
                  <Text style={styles.billListDate}>{bill.date.toLocaleString()}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editBillButton}
                  onPress={() => loadBillForEdit(bill.key)}
                >
                  <Text style={styles.editBillButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBillButton}
                  onPress={() => deleteBill(bill.key)}
                >
                  <Text style={styles.deleteBillButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === SCREEN.BILL) {
    return (
      <SafeAreaView style={styles.container}>
        <ExpoStatusBar style="dark" />
        <Navbar />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.appTitle}>🔨 Carpenter Invoice</Text>
          </View>
          {/* Bill Name Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill Information</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Bill Name (e.g., John's House Work)"
              value={billName}
              onChangeText={setBillName}
              placeholderTextColor="#666"
            />
          </View>
          {/* Add Header Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Room/Area</Text>
            <View style={styles.addHeaderContainer}>
              <TextInput
                style={[styles.input, styles.headerInput]}
                placeholder="Enter Room Name (e.g., Bedroom-1, Kitchen)"
                value={currentHeader}
                onChangeText={setCurrentHeader}
                placeholderTextColor="#666"
              />
              <TouchableOpacity style={styles.addButton} onPress={addHeader}>
                <Text style={styles.addButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Headers and Work Items */}
          {headers.map((header, headerIndex) => (
            <HeaderSection
              key={headerIndex}
              header={header}
              headerIndex={headerIndex}
              onAddWork={() => openFormForHeader(headerIndex)}
              onEditWork={(itemIndex) => editWorkItem(headerIndex, itemIndex)}
              onDeleteWork={(itemIndex) => deleteWorkItem(headerIndex, itemIndex)}
              onDeleteHeader={() => deleteHeader(headerIndex)}
            />
          ))}
          {/* Total Amount */}
          {headers.length > 0 && (
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>
                Total Amount: ₹{getTotalAmount().toFixed(2)}
              </Text>
            </View>
          )}
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={saveBill}>
              <Text style={styles.buttonText}>💾 Save Bill</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton} onPress={exportPDF}>
              <Text style={styles.buttonText}>📄 Export PDF</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bottomPadding} />
        </ScrollView>
        {/* Work Item Form Modal */}
        <Modal
          visible={showForm}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
              >
                <Text style={styles.closeButtonText}>✕ Close</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Edit Work Item' : 'Add Work Item'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {editingHeaderIndex >= 0 ? headers[editingHeaderIndex]?.name : ''}
              </Text>
            </View>
            <WorkItemForm 
              onSubmit={addOrUpdateWorkItem}
              item={editingItem}
              onCancel={() => {
                setShowForm(false);
                setEditingItem(null);
              }}
            />
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 20,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  addHeaderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  headerInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  totalContainer: {
    margin: 16,
    backgroundColor: '#2c3e50',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  totalText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    margin: 16,
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  exportButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    backgroundColor: '#2c3e50',
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    left: 20,
    top: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    color: '#bdc3c7',
    fontSize: 14,
    marginTop: 4,
  },
  dashboardHeader: {
    backgroundColor: '#2c3e50',
    padding: 20,
    alignItems: 'center',
  },
  dashboardButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 24,
  },
  createButton: {
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  editButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  savedBillsSection: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  billListItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  billListItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  billListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  billListDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  editBillButton: {
    backgroundColor: '#f39c12',
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBillButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteBillButton: {
    backgroundColor: '#e74c3c',
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBillButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#aaa',
    textAlign: 'center',
    marginVertical: 16,
  },
  // Navbar styles
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
  },
  navbarBack: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#34495e',
  },
  navbarBackText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  navbarProfile: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#34495e',
    marginLeft: 8,
  },
  navbarProfileIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileFormGroup: {
    gap: 16,
    marginBottom: 16,
  },
  profileInput: {
    marginBottom: 0,
  },
});
