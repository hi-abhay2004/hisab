import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { formatCurrency } from '../utils/helpers';

const WorkItem = ({ item, onEdit, onDelete }) => {
  const handleDelete = () => {
    Alert.alert(
      'Delete Work Item',
      `Are you sure you want to delete "${item.workName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.workName}>{item.workName}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit}>
            <Text style={styles.actionText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.actionText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <Text style={styles.label}>Size:</Text>
        <Text style={styles.value}>
          {item.width} {item.widthUnit} × {item.height} {item.heightUnit}
        </Text>
      </View>

      <View style={styles.detailsRow}>
        <Text style={styles.label}>Area:</Text>
        <Text style={styles.value}>{item.totalSqft.toFixed(2)} sqft</Text>
      </View>

      <View style={styles.detailsRow}>
        <Text style={styles.label}>Rate:</Text>
        <Text style={styles.value}>₹{item.rate}/sqft</Text>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalValue}>{formatCurrency(item.totalRate)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fdfdfd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  workName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    paddingHorizontal: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  label: {
    fontSize: 13,
    color: '#666',
  },
  value: {
    fontSize: 13,
    color: '#2c3e50',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
  },
});

export default WorkItem;
