// services/firebaseService.ts
import { User, UserRole, Trip, TripStatus, PaymentMethod, Message, Passenger, Location } from '../types';

// Add password to the internal user type for mock authentication
type MockUser = User & { password?: string };

// --- localStorage Keys ---
const USERS_KEY = 'rideshare_users';
const TRIPS_KEY = 'rideshare_trips';
const NEXT_TRIP_ID_KEY = 'rideshare_nextTripId';

// --- Default Data (for first-time use) ---
const defaultUsers: MockUser[] = [
  { id: '1', name: 'Lufuno Netshifhefhe', email: '23012345@mvula.univen.ac.za', role: UserRole.CUSTOMER, profilePictureUrl: 'https://picsum.photos/seed/1/200', password: '1234567' },
  { id: '2', name: 'Tendani Mudau', email: '23023456@mvula.univen.ac.za', role: UserRole.DRIVER, profilePictureUrl: 'https://picsum.photos/seed/2/200', ratings: [4, 5, 5], password: '1234567' },
  { id: '3', name: 'Khathutshelo Ramabulana', email: '23034567@mvula.univen.ac.za', role: UserRole.ADMIN, profilePictureUrl: 'https://picsum.photos/seed/3/200', password: '1234567' },
  { id: '4', name: 'Mulalo Ndou', email: '23045678@mvula.univen.ac.za', role: UserRole.DRIVER, profilePictureUrl: 'https://picsum.photos/seed/4/200', ratings: [5, 5, 5], password: '1234567' },
  { id: '5', name: 'Naledi Tshivhase', email: '23056789@mvula.univen.ac.za', role: UserRole.CUSTOMER, profilePictureUrl: 'https://picsum.photos/seed/5/200', password: '1234567' },
  { id: '6', name: 'Azwianewi Makhado', email: '23067890@mvula.univen.ac.za', role: UserRole.CUSTOMER, profilePictureUrl: 'https://picsum.photos/seed/6/200', password: '1234567' },
];

// --- Data storage (in-memory, hydrated from localStorage) ---
let mockUsers: MockUser[] = [];
let mockTrips: Trip[] = [];
let nextTripId: number = 1;

// --- Data persistence functions ---
const saveUsersToStorage = () => {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(mockUsers));
    } catch (e) {
        console.error("Failed to save users to localStorage", e);
    }
};

const saveTripsToStorage = () => {
    try {
        // Handle Date objects for proper JSON serialization
        const tripsToSave = mockTrips.map(trip => ({
            ...trip,
            createdAt: trip.createdAt.toISOString(),
            messages: trip.messages?.map(msg => ({...msg, createdAt: msg.createdAt.toISOString()}))
        }));
        localStorage.setItem(TRIPS_KEY, JSON.stringify(tripsToSave));
        localStorage.setItem(NEXT_TRIP_ID_KEY, String(nextTripId));
    } catch (e) {
        console.error("Failed to save trips to localStorage", e);
    }
};

const loadDataFromStorage = () => {
    try {
        // Load users
        const storedUsers = localStorage.getItem(USERS_KEY);
        if (storedUsers) {
            mockUsers = JSON.parse(storedUsers);
        } else {
            mockUsers = defaultUsers;
            saveUsersToStorage();
        }

        // Load trips
        const storedTrips = localStorage.getItem(TRIPS_KEY);
        if (storedTrips) {
            const parsedTrips = JSON.parse(storedTrips);
            // Rehydrate Date objects from ISO strings
            mockTrips = parsedTrips.map((trip: any) => ({
                ...trip,
                createdAt: new Date(trip.createdAt),
                messages: trip.messages?.map((msg: any) => ({...msg, createdAt: new Date(msg.createdAt)}))
            }));
        } else {
            mockTrips = [];
        }

        // Load nextTripId
        const storedTripId = localStorage.getItem(NEXT_TRIP_ID_KEY);
        if (storedTripId) {
            nextTripId = parseInt(storedTripId, 10);
        } else {
            nextTripId = mockTrips.length > 0 ? Math.max(...mockTrips.map(t => parseInt(t.id, 10))) + 1 : 1;
        }

    } catch (e) {
        console.error("Failed to load data from localStorage, using defaults.", e);
        mockUsers = defaultUsers;
        mockTrips = [];
        nextTripId = 1;
    }
};

// --- Initialize data on module load ---
loadDataFromStorage();


let listeners: { [key: string]: any } = {
    rideRequests: [],
    tripUpdates: {},
};

// --- Real-time Location Simulation ---

export const LOCATIONS_COORDS: { [key: string]: Location } = {
  "University of Venda Main Gate": { lat: -22.9845, lng: 30.4990 },
  "Thavhani Mall": { lat: -22.9730, lng: 30.4780 },
  "Khoroni Hotel & Casino": { lat: -22.9650, lng: 30.4800 },
  "Sibasa Shopping Centre": { lat: -22.9560, lng: 30.4880 },
  "University of Venda Sports Hall": { lat: -22.9860, lng: 30.4950 },
  "Univen Library": { lat: -22.9855, lng: 30.4975 },
  "Golgotta": { lat: -22.9780, lng: 30.4910 },
  "Makwarela": { lat: -22.9480, lng: 30.4950 },
  "Shayandima": { lat: -22.9690, lng: 30.4570 },
  "Bernard Ncube Residence": { lat: -22.9870, lng: 30.4980 },
  "Riverside Residence": { lat: -22.9820, lng: 30.5050 },
};
const DRIVER_START_LOCATION: Location = { lat: -22.955, lng: 30.485 }; // Start in Sibasa
const tripSimulators: { [tripId: string]: any } = {};

const startTripSimulator = (trip: Trip) => {
    const simulatorId = setInterval(() => {
        const currentTrip = mockTrips.find(t => t.id === trip.id);
        if (!currentTrip || !currentTrip.driverLocation) {
            stopTripSimulator(trip.id);
            return;
        }

        const targetLocationKey = currentTrip.status === TripStatus.ACCEPTED 
            ? currentTrip.pickupLocation 
            : currentTrip.dropoffLocation;
        
        const target = LOCATIONS_COORDS[targetLocationKey];
        const currentLoc = currentTrip.driverLocation;

        if (target && currentLoc) {
            // Move 10% closer to the target
            const newLat = currentLoc.lat + (target.lat - currentLoc.lat) * 0.1;
            const newLng = currentLoc.lng + (target.lng - currentLoc.lng) * 0.1;

            const dist = Math.sqrt(Math.pow(target.lat - newLat, 2) + Math.pow(target.lng - newLng, 2));
            
            // Only update if not already at destination to avoid jitter
            if (dist > 0.00001) {
                currentTrip.driverLocation = { lat: newLat, lng: newLng };
                notifyListeners('tripUpdates', trip.id, currentTrip);
            }
        }
    }, 2000); // Update location every 2 seconds
    tripSimulators[trip.id] = simulatorId;
};

const stopTripSimulator = (tripId: string) => {
    if (tripSimulators[tripId]) {
        clearInterval(tripSimulators[tripId]);
        delete tripSimulators[tripId];
    }
};

// --- End Simulation ---


const notifyListeners = (type: 'rideRequests' | 'tripUpdates', tripId?: string, data?: any) => {
    if (type === 'rideRequests') {
        listeners.rideRequests.forEach((cb: Function) => cb(mockTrips.filter(t => t.status === TripStatus.REQUESTED)));
    } else if (type === 'tripUpdates' && tripId && listeners.tripUpdates[tripId]) {
        listeners.tripUpdates[tripId].forEach((cb: Function) => cb(data));
    }
};


export const firebaseAuth = {
  signIn: (email: string, passwordInput: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.email === email);
        if (!user) {
          return reject(new Error('No account found with this email. Please register.'));
        }
        if (user.password !== passwordInput) {
            return reject(new Error('Incorrect password. Please try again.'));
        }
        const { password, ...userToReturn } = user;
        resolve(userToReturn);
      }, 500);
    });
  },

  register: (userData: Omit<User, 'id'>): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (mockUsers.some(u => u.email === userData.email)) {
          return reject(new Error('User with this email already exists.'));
        }
        const newUser: MockUser = {
          id: String(mockUsers.length + 1),
          ...userData,
          profilePictureUrl: `https://picsum.photos/seed/${mockUsers.length + 1}/200`,
          password: '1234567',
        };
        mockUsers.push(newUser);
        saveUsersToStorage();
        const { password, ...userToReturn } = newUser;
        resolve(userToReturn);
      }, 500);
    });
  },
  
  changePassword: (email: string, oldPassword: string, newPassword: string): Promise<void> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              const userAccount = mockUsers.find(u => u.email === email);
              if (!userAccount) {
                  return reject(new Error("User not found."));
              }
              if (userAccount.password !== oldPassword) {
                  return reject(new Error("Incorrect current password."));
              }
              userAccount.password = newPassword;
              saveUsersToStorage();
              resolve();
          }, 500);
      });
  },

  sendPasswordResetEmail: (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const userExists = mockUsers.some(u => u.email === email);
        if (userExists) {
          console.log(`(Mock) Password reset link sent to: ${email}`);
          resolve();
        } else {
          reject(new Error('No account found with this email address.'));
        }
      }, 500);
    });
  },

  signOut: (): Promise<void> => {
      return Promise.resolve();
  },

  getAllUsers: (): Promise<User[]> => {
    return new Promise(resolve => {
        const usersToReturn = mockUsers.map(({ password, ...user }) => user);
        setTimeout(() => resolve(usersToReturn), 500);
    });
  },

  updateUser: (userId: string, updates: Partial<Pick<User, 'name' | 'email' | 'profilePictureUrl'>>): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          if (updates.email && mockUsers.some(u => u.email === updates.email && u.id !== userId)) {
            return reject(new Error('Email is already in use by another account.'));
          }
          mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
          saveUsersToStorage();
          const { password, ...updatedUser } = mockUsers[userIndex];
          resolve(updatedUser);
        } else {
          reject(new Error("User not found"));
        }
      }, 500);
    });
  },

  removeUser: (email: string): Promise<void> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              const initialLength = mockUsers.length;
              mockUsers = mockUsers.filter(u => u.email !== email);
              if (mockUsers.length < initialLength) {
                  saveUsersToStorage();
                  resolve();
              } else {
                  reject(new Error("User not found"));
              }
          }, 500);
      });
  }
};

export const firestoreDB = {
  requestTrip: (tripData: Omit<Trip, 'id' | 'status' | 'createdAt'>): Promise<Trip> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newTrip: Trip = {
          ...tripData,
          id: String(nextTripId++),
          status: TripStatus.REQUESTED,
          createdAt: new Date(),
          messages: [],
        };
        mockTrips.push(newTrip);
        saveTripsToStorage();
        notifyListeners('rideRequests');
        resolve(newTrip);
      }, 1000);
    });
  },

  sendMessage: (tripId: string, senderId: string, text: string): Promise<Trip> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const tripToUpdate = mockTrips.find(t => t.id === tripId);
        if (tripToUpdate) {
          const newMessage: Message = {
            senderId,
            text,
            createdAt: new Date(),
          };
          if (!tripToUpdate.messages) {
            tripToUpdate.messages = [];
          }
          tripToUpdate.messages.push(newMessage);
          saveTripsToStorage();
          notifyListeners('tripUpdates', tripId, tripToUpdate);
          resolve(tripToUpdate);
        } else {
            reject(new Error("Trip not found"));
        }
      }, 300);
    });
  },

  listenForRideRequests: (callback: (trips: Trip[]) => void): (() => void) => {
    listeners.rideRequests.push(callback);
    callback(mockTrips.filter(t => t.status === TripStatus.REQUESTED));
    return () => {
        listeners.rideRequests = listeners.rideRequests.filter((cb: Function) => cb !== callback);
    };
  },

  acceptTrip: (trip: Trip, driver: User): Promise<Trip> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const tripToUpdate = mockTrips.find(t => t.id === trip.id);
            if (tripToUpdate) {
                tripToUpdate.status = TripStatus.ACCEPTED;
                tripToUpdate.driverId = driver.id;
                tripToUpdate.driverName = driver.name;
                tripToUpdate.driverLocation = { ...DRIVER_START_LOCATION };

                if (tripToUpdate.isShared) {
                    const passengers: Passenger[] = [];
                    const originalCustomer = mockUsers.find(u => u.id === tripToUpdate.customerId);
                    if(originalCustomer && originalCustomer.profilePictureUrl) {
                        passengers.push({
                            id: originalCustomer.id,
                            name: originalCustomer.name,
                            profilePictureUrl: originalCustomer.profilePictureUrl,
                        });
                    }

                    const otherCustomers = mockUsers
                        .filter(u => u.role === UserRole.CUSTOMER && u.id !== tripToUpdate.customerId)
                        .sort(() => 0.5 - Math.random())
                        .slice(0, Math.floor(Math.random() * 2) + 1);

                    otherCustomers.forEach(customer => {
                        if(customer.profilePictureUrl) {
                            passengers.push({
                                id: customer.id,
                                name: customer.name,
                                profilePictureUrl: customer.profilePictureUrl,
                            });
                        }
                    });
                    tripToUpdate.passengers = passengers;
                }
                
                saveTripsToStorage();
                notifyListeners('rideRequests');
                notifyListeners('tripUpdates', trip.id, tripToUpdate);
                startTripSimulator(tripToUpdate);
                resolve(tripToUpdate);
            }
        }, 500);
    });
  },

  updateTripStatus: (tripId: string, status: TripStatus): Promise<Trip> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const tripToUpdate = mockTrips.find(t => t.id === tripId);
        if (tripToUpdate) {
          const originalStatus = tripToUpdate.status;
          tripToUpdate.status = status;

          if (status === TripStatus.CANCELLED || status === TripStatus.COMPLETED) {
             stopTripSimulator(tripId);
             if (status === TripStatus.CANCELLED) {
                mockTrips = mockTrips.filter(t => t.id !== tripId);
                notifyListeners('tripUpdates', tripId, null);
                // If a requested ride is cancelled, we must notify all drivers.
                if (originalStatus === TripStatus.REQUESTED) {
                    notifyListeners('rideRequests');
                }
             }
          }

          saveTripsToStorage();

          if (status !== TripStatus.CANCELLED) {
            notifyListeners('tripUpdates', tripId, tripToUpdate);
          }
          resolve(tripToUpdate);
        } else {
            reject(new Error("Trip not found"));
        }
      }, 500);
    });
  },

  listenForTripUpdates: (tripId: string, callback: (trip: Trip | null) => void): (() => void) => {
    if (!listeners.tripUpdates[tripId]) {
        listeners.tripUpdates[tripId] = [];
    }
    listeners.tripUpdates[tripId].push(callback);
    
    const trip = mockTrips.find(t => t.id === tripId);
    callback(trip || null);

    return () => {
        if(listeners.tripUpdates[tripId]) {
            listeners.tripUpdates[tripId] = listeners.tripUpdates[tripId].filter((cb: Function) => cb !== callback);
            if (listeners.tripUpdates[tripId].length === 0) {
              // Clean up simulator if no one is listening anymore
              stopTripSimulator(tripId);
            }
        }
    };
  },

  rateDriver: (tripId: string, driverId: string, rating: number): Promise<void> => {
      return new Promise(resolve => {
          setTimeout(() => {
              const driver = mockUsers.find(u => u.id === driverId);
              if (driver) {
                  if (!driver.ratings) driver.ratings = [];
                  driver.ratings.push(rating);
                  saveUsersToStorage();
              }
              const trip = mockTrips.find(t => t.id === tripId);
              if (trip) {
                trip.rating = rating;
                saveTripsToStorage();
              }
              resolve();
          }, 300);
      });
  },

  getAllTrips: (): Promise<Trip[]> => {
      return new Promise(resolve => {
          setTimeout(() => resolve(mockTrips), 500);
      });
  }
};