import { auth } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const googleProvider = new GoogleAuthProvider()

export const registerWithEmail = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password)
}

export const loginWithEmail = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password)
}

export const logout = async () => {
  return await signOut(auth)
}

export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider)
}
