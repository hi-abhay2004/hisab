import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const HeaderSection = ({ 
  header, 
  headerIndex, 
  onAddWork, 
  onEditWork, 
  onDeleteWork, 
  onDeleteHeader 
}) => {
  const getHeaderTotal = () => {
    return header.items.reduce((total, item) => total + item.total, 0);
  };

  return (
    <View style={styles.container}>
      {/* Header Title and Actions */}
      <View style={styles.headerRow}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>📍 {header.name}</Text>
          {header.items.length > 0 && (
            <Text style={styles.headerTotal}>
              Total: ₹{getHeaderTotal().toFixed(2)}
            </Text>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.addWorkButton} onPress={onAddWork}>
            <Text style={styles.addWorkText}>+ Add Work</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteHeaderButton} onPress={onDeleteHeader}>
            <Text style={styles.deleteHeaderText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Work Items List */}
      {header.items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No work items added yet</Text>
          <Text style={styles.emptySubtext}>Tap "Add Work" to get started</Text>
        </View>
      ) : (
        header.items.map((item, itemIndex) => (
          <View key={itemIndex} style={styles.workItem}>
            <View style={styles.workItemHeader}>
              <Text style={styles.workName}>{item.name}</Text>
              <Text style={styles.workTotal}>₹{item.total.toFixed(2)}</Text>
            </View>
            
            <View style={styles.workDetails}>
              <Text style={styles.workDetailText}>
                📏 {item.width} × {item.height} {item.unit} = {item.sqft.toFixed(2)} sq{item.unit}
              </Text>
              <Text style={styles.workDetailText}>
                💰 ₹{item.rate}/sq{item.unit}
              </Text>
            </View>

            <View style={styles.workItemActions}>
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => onEditWork(itemIndex)}
              >
                <Text style={styles.editButtonText}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => onDeleteWork(itemIndex)}
              >
                <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#34495e',
    padding: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTotal: {
    color: '#f39c12',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addWorkButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addWorkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteHeaderButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteHeaderText: {
    fontSize: 12,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 4,
  },
  workItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  workItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  workTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  workDetails: {
    marginBottom: 12,
  },
  workDetailText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  workItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default HeaderSection;