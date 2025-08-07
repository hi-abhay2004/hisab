import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  BackHandler,
  Image,
} from 'react-native';
import WorkForm from '../components/WorkForm';
import WorkItem from '../components/WorkItem';
import { storageService } from '../services/storageService';
import { pdfService } from '../services/pdfService';
import { generateId, formatCurrency } from '../utils/helpers';

const InvoiceScreen = ({ navigation, route }) => {
  const [billName, setBillName] = useState('');
  const [headerName, setHeaderName] = useState('');
  const [headers, setHeaders] = useState([]);
  const [currentBill, setCurrentBill] = useState(null);
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [currentHeader, setCurrentHeader] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    // Check if editing existing bill
    const editBill = route?.params?.editBill;
    if (editBill) {
      loadExistingBill(editBill);
    } else {
      resetBill();
    }

    // Handle Android back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, [route?.params?.editBill]);

  const loadExistingBill = (bill) => {
    setCurrentBill(bill);
    setBillName(bill.billName);
    setHeaders(bill.headers || []);
    setAdvanceAmount((bill.advanceAmount || 0).toString());
  };

  const resetBill = () => {
    setCurrentBill({
      id: generateId(),
      billName: '',
      headers: [],
      advanceAmount: 0,
      createdAt: new Date().toISOString(),
    });
    setBillName('');
    setHeaderName('');
    setHeaders([]);
    setAdvanceAmount('');
  };

  const addHeader = () => {
    if (!headerName.trim()) {
      Alert.alert('Error', 'Please enter a header name');
      return;
    }

    const newHeader = {
      id: generateId(),
      name: headerName.trim(),
      workItems: [],
    };

    const newHeaders = [...headers, newHeader];
    setHeaders(newHeaders);
    setCurrentBill(prev => ({
      ...prev,
      headers: newHeaders,
    }));
    setHeaderName('');
  };

  const openWorkForm = (headerId) => {
    const header = headers.find(h => h.id === headerId);
    setCurrentHeader(header);
    setEditingItem(null);
    setShowWorkForm(true);
  };

  const editWorkItem = (headerId, item) => {
    const header = headers.find(h => h.id === headerId);
    setCurrentHeader(header);
    setEditingItem(item);
    setShowWorkForm(true);
  };

  const handleWorkSubmit = (workItem) => {
    const updatedHeaders = headers.map(header => {
      if (header.id === currentHeader.id) {
        let updatedItems;
        if (editingItem) {
          // Update existing item
          updatedItems = header.workItems.map(item =>
            item.id === editingItem.id ? workItem : item
          );
        } else {
          // Add new item
          updatedItems = [...header.workItems, workItem];
        }
        return { ...header, workItems: updatedItems };
      }
      return header;
    });

    setHeaders(updatedHeaders);
    setCurrentBill(prev => ({
      ...prev,
      headers: updatedHeaders,
    }));
  };

  const deleteWorkItem = (headerId, itemId) => {
    const updatedHeaders = headers.map(header => {
      if (header.id === headerId) {
        return {
          ...header,
          workItems: header.workItems.filter(item => item.id !== itemId),
        };
      }
      return header;
    });

    setHeaders(updatedHeaders);
    setCurrentBill(prev => ({
      ...prev,
      headers: updatedHeaders,
    }));
  };

  const deleteHeader = (headerId) => {
    Alert.alert(
      'Delete Header',
      'Are you sure you want to delete this header and all its work items?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedHeaders = headers.filter(h => h.id !== headerId);
            setHeaders(updatedHeaders);
            setCurrentBill(prev => ({
              ...prev,
              headers: updatedHeaders,
            }));
          },
        },
      ]
    );
  };

  const calculateTotal = () => {
    let total = 0;
    headers.forEach(header => {
      header.workItems.forEach(item => {
        total += item.totalRate;
      });
    });
    return total;
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

    setIsLoading(true);
    const billToSave = {
      ...currentBill,
      billName: billName.trim(),
      headers,
      advanceAmount: parseFloat(advanceAmount) || 0,
    };

    const success = await storageService.saveBill(billToSave);
    setIsLoading(false);    if (success) {
      Alert.alert(
        'Success', 
        'Bill saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      Alert.alert('Error', 'Failed to save bill. Please try again.');
    }
  };

  const exportPDF = async () => {
    if (!billName.trim()) {
      Alert.alert('Error', 'Please enter a bill name');
      return;
    }

    if (headers.length === 0) {
      Alert.alert('Error', 'Please add at least one header with work items');
      return;
    }

    setIsLoading(true);
    const billToExport = {
      ...currentBill,
      billName: billName.trim(),
      headers,
      advanceAmount: parseFloat(advanceAmount) || 0,
    };

    await pdfService.generateInvoicePDF(billToExport);
    setIsLoading(false);
  };

  const newBill = () => {
    Alert.alert(
      'New Bill',
      'Are you sure you want to create a new bill? Any unsaved changes will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: resetBill },
      ]
    );
  };

  const totalAmount = calculateTotal();
  const balanceAmount = totalAmount - (parseFloat(advanceAmount) || 0);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Image
          source={require('../assets/hisab.png')}
          style={styles.appIcon}
          resizeMode="contain"
        />
        <Text style={styles.title}>
          {route?.params?.editBill ? 'Edit Invoice' : 'Create Invoice'}
        </Text>
        <TouchableOpacity style={styles.newBillButton} onPress={newBill}>
          <Text style={styles.newBillButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Bill Name Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bill Name *</Text>
            <TextInput
              style={styles.input}
              value={billName}
              onChangeText={setBillName}
              placeholder="Enter bill name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Advance Amount (₹)</Text>
            <TextInput
              style={styles.input}
              value={advanceAmount}
              onChangeText={setAdvanceAmount}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Add Header Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Header (Room/Section)</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.flex1]}
              value={headerName}
              onChangeText={setHeaderName}
              placeholder="e.g., Bedroom-1, Kitchen"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.addHeaderButton} onPress={addHeader}>
              <Text style={styles.addHeaderButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Headers and Work Items */}
        {headers.map(header => (
          <View key={header.id} style={styles.headerSection}>
            <View style={styles.headerTitle}>
              <Text style={styles.headerName}>{header.name}</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.addWorkButton}
                  onPress={() => openWorkForm(header.id)}
                >
                  <Text style={styles.addWorkButtonText}>+ Add Work</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteHeaderButton}
                  onPress={() => deleteHeader(header.id)}
                >
                  <Text style={styles.deleteHeaderButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>

            {header.workItems.map(item => (
              <WorkItem
                key={item.id}
                item={item}
                onEdit={() => editWorkItem(header.id, item)}
                onDelete={() => deleteWorkItem(header.id, item.id)}
              />
            ))}

            {header.workItems.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No work items added yet</Text>
                <TouchableOpacity
                  style={styles.emptyAddButton}
                  onPress={() => openWorkForm(header.id)}
                >
                  <Text style={styles.emptyAddButtonText}>Add First Work Item</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {/* Totals Section */}
        {headers.length > 0 && (
          <View style={styles.totalsSection}>
            <Text style={styles.totalsTitle}>Bill Summary</Text>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
            </View>
            {parseFloat(advanceAmount) > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Advance Paid:</Text>
                <Text style={styles.totalValue}>{formatCurrency(parseFloat(advanceAmount))}</Text>
              </View>
            )}
            <View style={styles.finalTotalRow}>
              <Text style={styles.finalTotalLabel}>Balance Amount:</Text>
              <Text style={styles.finalTotalValue}>{formatCurrency(balanceAmount)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton]}
          onPress={saveBill}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.actionButtonText}>Save Bill</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.exportButton]}
          onPress={exportPDF}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.actionButtonText}>Export PDF</Text>
          )}
        </TouchableOpacity>
      </View>

      <WorkForm
        visible={showWorkForm}
        onClose={() => setShowWorkForm(false)}
        onSubmit={handleWorkSubmit}
        editItem={editingItem}
        currentHeader={currentHeader?.name}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },  header: {
    backgroundColor: '#2c3e50',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  newBillButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  newBillButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  appIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
  },  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
    marginRight: 10,
  },
  addHeaderButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addHeaderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSection: {
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
  headerTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
  },
  addWorkButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    marginRight: 8,
  },
  addWorkButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteHeaderButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  deleteHeaderButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  emptyAddButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalsSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  totalsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 40, // Extra padding for phone navigation
    gap: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#27ae60',
  },
  exportButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InvoiceScreen;
