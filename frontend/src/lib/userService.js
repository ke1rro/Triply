import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export const createUserDocument = async (user) => {
  if (!user) return null

  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)

  // Only create if user document doesn't exist
  if (!userSnap.exists()) {
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      likedTrips: [],
      visiting: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    try {
      await setDoc(userRef, userData)
      return userData
    } catch (error) {
      console.error('Error creating user document:', error)
      throw error
    }
  }

  return userSnap.data()
}

export const getUserDocument = async (userId) => {
  if (!userId) return null

  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting user document:', error)
    throw error
  }
}

export const updateUserProfile = async (userId, updates) => {
  if (!userId) return

  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

export const addLikedTrip = async (userId, tripId) => {
  if (!userId || !tripId) return

  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      likedTrips: arrayUnion(tripId),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error adding liked trip:', error)
    throw error
  }
}

export const removeLikedTrip = async (userId, tripId) => {
  if (!userId || !tripId) return

  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      likedTrips: arrayRemove(tripId),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error removing liked trip:', error)
    throw error
  }
}

export const addVisitingTrip = async (userId, tripId) => {
  if (!userId || !tripId) return

  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      visiting: arrayUnion(tripId),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error adding visiting trip:', error)
    throw error
  }
}

export const removeVisitingTrip = async (userId, tripId) => {
  if (!userId || !tripId) return

  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      visiting: arrayRemove(tripId),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error removing visiting trip:', error)
    throw error
  }
}
