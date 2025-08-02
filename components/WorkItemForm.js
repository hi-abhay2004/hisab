import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert 
} from 'react-native';

const units = ['ft', 'inch', 'mm', 'cm', 'm'];

export default function WorkItemForm({ onSubmit, item, onCancel }) {
  const [name, setName] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [rate, setRate] = useState('');
  const [unit, setUnit] = useState('ft');
  const [sqft, setSqft] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setWidth(String(item.width || ''));
      setHeight(String(item.height || ''));
      setRate(String(item.rate || ''));
      setUnit(item.unit || 'ft');
    } else {
      // Reset form for new item
      setName('');
      setWidth('');
      setHeight('');
      setRate('');
      setUnit('ft');
    }
  }, [item]);

  useEffect(() => {
    // Auto-calculate when values change
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    const r = parseFloat(rate) || 0;
    
    const calculatedSqft = w * h;
    const calculatedTotal = calculatedSqft * r;
    
    setSqft(calculatedSqft);
    setTotal(calculatedTotal);
  }, [width, height, rate]);

  const validateAndSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter work name');
      return;
    }
    if (!width || parseFloat(width) <= 0) {
      Alert.alert('Error', 'Please enter valid width');
      return;
    }
    if (!height || parseFloat(height) <= 0) {
      Alert.alert('Error', 'Please enter valid height');
      return;
    }
    if (!rate || parseFloat(rate) <= 0) {
      Alert.alert('Error', 'Please enter valid rate');
      return;
    }

    const workItem = {
      name: name.trim(),
      width: parseFloat(width),
      height: parseFloat(height),
      rate: parseFloat(rate),
      unit,
      sqft,
      total
    };

    onSubmit(workItem);
    
    // Reset form after successful submission
    if (!item) { // Only reset if adding new item
      setName('');
      setWidth('');
      setHeight('');
      setRate('');
      setUnit('ft');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.formContainer}>
        
        {/* Work Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Work Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Bed Backrest, Kitchen Cabinet"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />
        </View>

        {/* Dimensions Row */}
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Width</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={width}
              onChangeText={setWidth}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
          <Text style={styles.multiplySign}>×</Text>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Height</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Unit Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Unit</Text>
          <View style={styles.unitContainer}>
            {units.map((unitOption) => (
              <TouchableOpacity
                key={unitOption}
                style={[
                  styles.unitButton,
                  unit === unitOption && styles.unitButtonSelected
                ]}
                onPress={() => setUnit(unitOption)}
              >
                <Text style={[
                  styles.unitButtonText,
                  unit === unitOption && styles.unitButtonTextSelected
                ]}>
                  {unitOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rate */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Rate (₹ per sq{unit})</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={rate}
            onChangeText={setRate}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        {/* Auto-calculated Values */}
        <View style={styles.calculationContainer}>
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>Total Area:</Text>
            <Text style={styles.calculationValue}>
              {sqft.toFixed(2)} sq{unit}
            </Text>
          </View>
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>Total Amount:</Text>
            <Text style={styles.calculationValueTotal}>
              ₹{total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={validateAndSubmit}>
            <Text style={styles.submitButtonText}>
              {item ? 'Update Work' : 'Add Work'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
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
    color: '#2c3e50',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
  },
  multiplySign: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7f8c8d',
    paddingHorizontal: 16,
    marginTop: 24,
  },
  unitContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  unitButtonSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  unitButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  unitButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  calculationContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  calculationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  calculationValueTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#95a5a6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
