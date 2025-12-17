import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { auth } from './firebase'

export async function uploadSubmissionFile(assignmentId: string, file: File) {
  if (!auth) return null
  try {
    const storage = getStorage()
    const uid = auth.currentUser ? auth.currentUser.uid : 'anonymous'
    const path = `assignments/${assignmentId}/submissions/${uid}/${Date.now()}_${file.name}`
    const storageRef = ref(storage, path)
    const snap = await uploadBytesResumable(storageRef, file)
    const url = await getDownloadURL(snap.ref)
    return url
  } catch (err) {
    console.error('uploadSubmissionFile error', err)
    return null
  }
}
