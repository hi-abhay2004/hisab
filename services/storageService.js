import AsyncStorage from '@react-native-async-storage/async-storage';

const BILLS_KEY = 'carpentry_bills';

export const storageService = {
  // Save a bill
  async saveBill(bill) {
    try {
      const existingBills = await this.getAllBills();
      const billIndex = existingBills.findIndex(b => b.id === bill.id);
      
      if (billIndex >= 0) {
        existingBills[billIndex] = bill;
      } else {
        existingBills.push(bill);
      }
      
      await AsyncStorage.setItem(BILLS_KEY, JSON.stringify(existingBills));
      return true;
    } catch (error) {
      console.error('Error saving bill:', error);
      return false;
    }
  },

  // Get all bills
  async getAllBills() {
    try {
      const bills = await AsyncStorage.getItem(BILLS_KEY);
      return bills ? JSON.parse(bills) : [];
    } catch (error) {
      console.error('Error getting bills:', error);
      return [];
    }
  },

  // Get a specific bill
  async getBill(billId) {
    try {
      const bills = await this.getAllBills();
      return bills.find(bill => bill.id === billId);
    } catch (error) {
      console.error('Error getting bill:', error);
      return null;
    }
  },

  // Delete a bill
  async deleteBill(billId) {
    try {
      const bills = await this.getAllBills();
      const filteredBills = bills.filter(bill => bill.id !== billId);
      await AsyncStorage.setItem(BILLS_KEY, JSON.stringify(filteredBills));
      return true;
    } catch (error) {
      console.error('Error deleting bill:', error);
      return false;
    }
  }
};
