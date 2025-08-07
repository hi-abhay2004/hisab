import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Modal, ScrollView, Alert,
} from 'react-native';
import Dropdown from './Dropdown';
import { UNITS, convertToSqft, validateWorkItem, generateId } from '../utils/helpers';
import { WORK_TEMPLATES } from '../utils/demoData';

const WorkForm = ({ visible, onClose, onSubmit, editItem, currentHeader }) => {
  const [workName, setWorkName] = useState('');
  const [width, setWidth] = useState('');
  const [widthUnit, setWidthUnit] = useState('ft');
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState('ft');
  const [rate, setRate] = useState('');
  const [errors, setErrors] = useState({});
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (editItem) {
      setWorkName(editItem.workName);
      setWidth(editItem.width.toString());
      setWidthUnit(editItem.widthUnit);
      setHeight(editItem.height.toString());
      setHeightUnit(editItem.heightUnit);
      setRate(editItem.rate.toString());
    } else {
      resetForm();
    }
  }, [editItem, visible]);

  const resetForm = () => {
    setWorkName('');
    setWidth('');
    setWidthUnit('ft');
    setHeight('');
    setHeightUnit('ft');
    setRate('');
    setErrors({});
  };

  const selectTemplate = (template) => {
    setWorkName(template.name);
    setRate(template.rate.toString());
    setShowTemplates(false);
  };

  const handleSubmit = () => {
    const workItem = {
      id: editItem ? editItem.id : generateId(),
      workName: workName.trim(),
      width: parseFloat(width),
      widthUnit,
      height: parseFloat(height),
      heightUnit,
      rate: parseFloat(rate),
    };

    const validation = validateWorkItem(workItem);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    workItem.totalSqft = convertToSqft(workItem.width, workItem.widthUnit, workItem.height, workItem.heightUnit);
    workItem.totalRate = workItem.totalSqft * workItem.rate;

    onSubmit(workItem);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const sqft = convertToSqft(parseFloat(width) || 0, widthUnit, parseFloat(height) || 0, heightUnit);
  const total = sqft * (parseFloat(rate) || 0);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{editItem ? 'Edit Work Item' : 'Add New Work'}</Text>
          {currentHeader && <Text style={styles.subHeader}>Room: {currentHeader}</Text>}
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.rowSpace}>
            <Text style={styles.label}>Work Name *</Text>
            <TouchableOpacity style={styles.templateBtn} onPress={() => setShowTemplates(true)}>
              <Text style={styles.templateBtnText}>Use Template</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.input, errors.workName && styles.inputError]}
            value={workName}
            onChangeText={setWorkName}
            placeholder="e.g. Ceiling Design"
            placeholderTextColor="#aaa"
          />
          {errors.workName && <Text style={styles.error}>{errors.workName}</Text>}

          <View style={styles.duo}>
            <View style={styles.half}>
              <Text style={styles.label}>Width *</Text>
              <TextInput
                style={[styles.input, errors.width && styles.inputError]}
                value={width}
                onChangeText={setWidth}
                placeholder="Width"
                keyboardType="numeric"
              />
              {errors.width && <Text style={styles.error}>{errors.width}</Text>}
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Unit</Text>
              <Dropdown data={UNITS} value={widthUnit} onSelect={setWidthUnit} />
            </View>
          </View>

          <View style={styles.duo}>
            <View style={styles.half}>
              <Text style={styles.label}>Height *</Text>
              <TextInput
                style={[styles.input, errors.height && styles.inputError]}
                value={height}
                onChangeText={setHeight}
                placeholder="Height"
                keyboardType="numeric"
              />
              {errors.height && <Text style={styles.error}>{errors.height}</Text>}
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Unit</Text>
              <Dropdown data={UNITS} value={heightUnit} onSelect={setHeightUnit} />
            </View>
          </View>

          <Text style={styles.label}>Rate (₹ per sqft) *</Text>
          <TextInput
            style={[styles.input, errors.rate && styles.inputError]}
            value={rate}
            onChangeText={setRate}
            placeholder="e.g. 200"
            keyboardType="numeric"
          />
          {errors.rate && <Text style={styles.error}>{errors.rate}</Text>}

          {/* Live Preview */}
          <View style={styles.preview}>
            <Text style={styles.previewLine}>📐 Area: {sqft.toFixed(2)} sqft</Text>
            <Text style={styles.previewLine}>💰 Total: ₹{total.toFixed(2)}</Text>
          </View>
        </ScrollView>

        {/* Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
            <Text style={styles.saveText}>{editItem ? 'Update' : 'Add'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Template Modal */}
      <Modal visible={showTemplates} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setShowTemplates(false)}>
          <View style={styles.templateBox}>
            <Text style={styles.templateTitle}>📋 Choose Template</Text>
            <ScrollView>
              {WORK_TEMPLATES.map((template, idx) => (
                <TouchableOpacity key={idx} style={styles.templateItem} onPress={() => selectTemplate(template)}>
                  <Text style={styles.templateItemName}>{template.name}</Text>
                  <Text style={styles.templateItemRate}>₹{template.rate}/sqft</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfdfd' },
  header: { paddingTop: 50, padding: 20, backgroundColor: '#3498db' },
  title: { fontSize: 22, fontWeight: '700', color: '#fff' },
  subHeader: { fontSize: 14, color: '#ecf0f1', marginTop: 4 },
  scroll: { padding: 20 },
  label: { fontWeight: '600', marginBottom: 6, color: '#333' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 10, fontSize: 16, backgroundColor: '#fff', marginBottom: 15,
  },
  inputError: { borderColor: '#e74c3c' },
  error: { color: '#e74c3c', marginBottom: 10, fontSize: 12 },
  rowSpace: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
  },
  templateBtn: {
    backgroundColor: '#8e44ad', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5,
  },
  templateBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  duo: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { flex: 1, marginRight: 10 },
  preview: {
    marginTop: 10, backgroundColor: '#e9f7ef', padding: 12, borderRadius: 8,
    borderLeftColor: '#2ecc71', borderLeftWidth: 4,
  },
  previewLine: { color: '#27ae60', fontWeight: 'bold' },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelBtn: {
    flex: 1, backgroundColor: '#bdc3c7', padding: 14, borderRadius: 8, marginRight: 10,
  },
  saveBtn: {
    flex: 2, backgroundColor: '#27ae60', padding: 14, borderRadius: 8,
  },
  cancelText: { textAlign: 'center', color: '#fff', fontWeight: 'bold' },
  saveText: { textAlign: 'center', color: '#fff', fontWeight: 'bold' },

  // Template Modal
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  templateBox: {
    backgroundColor: '#fff', borderRadius: 10,
    maxHeight: '70%', width: '85%', padding: 20,
  },
  templateTitle: {
    fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 12,
    textAlign: 'center',
  },
  templateItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  templateItemName: { fontSize: 16, color: '#2c3e50' },
  templateItemRate: { fontSize: 14, fontWeight: 'bold', color: '#27ae60' },
});

export default WorkForm;
