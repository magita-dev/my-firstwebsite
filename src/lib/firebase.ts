import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  collection, 
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ConfirmedBooking } from '../types';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass databaseId from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection to Firestore
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline notice. Verify connection settings.');
    }
  }
}

// Sign In with Google Popup
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user) {
      await recordUserLogin(user);
    }
    return user;
  } catch (err) {
    console.error('Sign-in failed', err);
    throw err;
  }
}

// Sign Out
export async function logOut() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign-out failed', err);
    throw err;
  }
}

// Record User Login in Firestore
export async function recordUserLogin(user: FirebaseUser) {
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const existingSnap = await getDoc(userRef);
    const now = new Date().toISOString();

    const userData = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Holiday Traveler',
      photoURL: user.photoURL || '',
      lastLoginAt: now,
      createdAt: existingSnap.exists() ? (existingSnap.data().createdAt || now) : now
    };

    await setDoc(userRef, userData, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Save confirmed booking in Firestore under user document
export async function syncBookingToFirestore(userId: string, booking: ConfirmedBooking) {
  const path = `users/${userId}/bookings/${booking.id}`;
  try {
    const bookingRef = doc(db, 'users', userId, 'bookings', booking.id);
    await setDoc(bookingRef, {
      id: booking.id,
      userId,
      packageId: booking.packageItem.id,
      packageName: booking.packageItem.name,
      startDate: booking.startDate,
      endDate: booking.endDate,
      durationDays: booking.durationDays,
      adults: booking.adults,
      children: booking.children,
      grandTotal: booking.grandTotal,
      leadName: booking.travelerInfo.leadName,
      email: booking.travelerInfo.email,
      phone: booking.travelerInfo.phone,
      status: booking.status,
      createdAt: booking.createdAt,
      fullDetails: JSON.stringify(booking)
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Fetch user bookings from Firestore
export async function fetchUserBookingsFromFirestore(userId: string): Promise<ConfirmedBooking[]> {
  const path = `users/${userId}/bookings`;
  try {
    const colRef = collection(db, 'users', userId, 'bookings');
    const snapshot = await getDocs(colRef);
    const results: ConfirmedBooking[] = [];

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.fullDetails) {
        try {
          results.push(JSON.parse(data.fullDetails));
        } catch {
          // parse fallback
        }
      }
    });

    return results;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}
