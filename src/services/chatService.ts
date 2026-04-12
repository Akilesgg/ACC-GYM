import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  getDocs,
  limit,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Message, UserProfile } from '../types';

export const chatService = {
  // Update user status
  updateUserStatus: async (uid: string, status: 'online' | 'offline' | 'invisible') => {
    const userRef = doc(db, 'users', uid);
    try {
      await setDoc(userRef, {
        status,
        lastSeen: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  },

  // Get all users (excluding current user if needed, but here we show all)
  subscribeToUsers: (callback: (users: UserProfile[]) => void) => {
    const q = query(collection(db, 'users'), orderBy('username', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      callback(users);
    });
  },

  // Send a message
  sendMessage: async (senderId: string, receiverId: string, text: string) => {
    const messageData = {
      senderId,
      receiverId,
      text,
      timestamp: serverTimestamp(),
      read: false,
      participants: [senderId, receiverId].sort()
    };
    await addDoc(collection(db, 'messages'), messageData);
  },

  // Subscribe to messages between two users
  subscribeToMessages: (userA: string, userB: string, callback: (messages: Message[]) => void) => {
    const participants = [userA, userB].sort();
    const q = query(
      collection(db, 'messages'),
      where('participants', '==', participants),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate()?.toISOString() || new Date().toISOString()
        } as Message;
      });
      callback(messages);
    });
  }
};
