import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  increment 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Posts Management
export const createPost = async (postData) => {
  const docRef = doc(collection(db, 'posts'));
  await setDoc(docRef, {
    ...postData,
    createdAt: new Date()
  });
  return docRef.id;
};

export const getPosts = async () => {
  try {
    const q = query(collection(db, 'posts'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const deletePost = async (postId) => {
  await deleteDoc(doc(db, 'posts', postId));
};

// Candidates Management
export const createCandidate = async (candidateData) => {
  const docRef = doc(collection(db, 'candidates'));
  await setDoc(docRef, {
    ...candidateData,
    voteCount: 0,
    createdAt: new Date()
  });
  return docRef.id;
};

export const getCandidates = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'candidates'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return [];
  }
};

export const getCandidatesByPost = async (postId) => {
  try {
    const q = query(collection(db, 'candidates'), where('postId', '==', postId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching candidates by post:', error);
    return [];
  }
};

export const deleteCandidate = async (candidateId) => {
  await deleteDoc(doc(db, 'candidates', candidateId));
};

// Voting Settings
export const setVotingSettings = async (settings) => {
  await setDoc(doc(db, 'settings', 'voting'), settings);
};

export const getVotingSettings = async () => {
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'voting'));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Error fetching voting settings:', error);
    return null;
  }
};

// Voting Functions
export const submitVote = async (userId, votes) => {
  // Record user's votes
  await setDoc(doc(db, 'votes', userId), votes);
  
  // Update candidate vote counts
  for (const candidateId of Object.values(votes)) {
    await updateDoc(doc(db, 'candidates', candidateId), {
      voteCount: increment(1)
    });
  }
  
  // Mark user as voted
  await updateDoc(doc(db, 'users', userId), {
    hasVoted: true,
    votedAt: new Date()
  });
};

export const getUserVote = async (userId) => {
  const docSnap = await getDoc(doc(db, 'votes', userId));
  return docSnap.exists() ? docSnap.data() : null;
};

export const hasUserVoted = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data().hasVoted || false : false;
  } catch (error) {
    console.error('Error checking if user voted:', error);
    return false;
  }
};

// Reset all voting data
export const resetVoting = async () => {
  try {
    // Delete all candidates
    const candidatesSnapshot = await getDocs(collection(db, 'candidates'));
    const candidateDeletes = candidatesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    
    // Reset all user voting status
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const userUpdates = usersSnapshot.docs.map(doc => 
      updateDoc(doc.ref, { hasVoted: false, votedAt: null })
    );
    
    // Delete all votes
    const votesSnapshot = await getDocs(collection(db, 'votes'));
    const voteDeletes = votesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    
    await Promise.all([...candidateDeletes, ...userUpdates, ...voteDeletes]);
  } catch (error) {
    console.error('Error resetting voting:', error);
    throw error;
  }
};