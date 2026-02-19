import { Trip } from '../types';

const STORAGE_KEY = 'travel_split_trips';

export const storage = {
  getAllTrips(): Trip[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading trips:', error);
      return [];
    }
  },

  getTrip(id: string): Trip | undefined {
    const trips = this.getAllTrips();
    return trips.find(trip => trip.id === id);
  },

  saveTrip(trip: Trip): void {
    const trips = this.getAllTrips();
    const index = trips.findIndex(t => t.id === trip.id);
    
    if (index >= 0) {
      trips[index] = trip;
    } else {
      trips.push(trip);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  },

  updateTrip(trip: Trip): void {
    this.saveTrip(trip);
  },

  deleteTrip(id: string): void {
    const trips = this.getAllTrips();
    const filtered = trips.filter(trip => trip.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};
