// Offline storage utilities using IndexedDB for data persistence

const DB_NAME = 'medical-records-db'
const DB_VERSION = 1

export interface PendingSync {
  id: string
  type: 'patient' | 'lab' | 'medical-exam' | 'xray' | 'ecg' | 'utz'
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: number
  retries: number
}

let db: IDBDatabase | null = null

export async function initDB(): Promise<IDBDatabase> {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // Store for offline patient data
      if (!database.objectStoreNames.contains('patients')) {
        const patientStore = database.createObjectStore('patients', { keyPath: 'id' })
        patientStore.createIndex('last_name', 'last_name', { unique: false })
        patientStore.createIndex('updated_at', 'updated_at', { unique: false })
      }

      // Store for lab reports
      if (!database.objectStoreNames.contains('lab_reports')) {
        const labStore = database.createObjectStore('lab_reports', { keyPath: 'id' })
        labStore.createIndex('patient_id', 'patient_id', { unique: false })
        labStore.createIndex('updated_at', 'updated_at', { unique: false })
      }

      // Store for medical exams
      if (!database.objectStoreNames.contains('medical_exams')) {
        const examStore = database.createObjectStore('medical_exams', { keyPath: 'id' })
        examStore.createIndex('patient_id', 'patient_id', { unique: false })
      }

      // Store for radiology reports
      if (!database.objectStoreNames.contains('radiology')) {
        const radioStore = database.createObjectStore('radiology', { keyPath: 'id' })
        radioStore.createIndex('patient_id', 'patient_id', { unique: false })
      }

      // Store for pending sync operations
      if (!database.objectStoreNames.contains('pending_sync')) {
        const syncStore = database.createObjectStore('pending_sync', { keyPath: 'id' })
        syncStore.createIndex('timestamp', 'timestamp', { unique: false })
        syncStore.createIndex('type', 'type', { unique: false })
      }

      // Store for file attachments (images, etc.)
      if (!database.objectStoreNames.contains('attachments')) {
        const attachStore = database.createObjectStore('attachments', { keyPath: 'id' })
        attachStore.createIndex('patient_id', 'patient_id', { unique: false })
        attachStore.createIndex('report_id', 'report_id', { unique: false })
      }
    }
  })
}

// Generic CRUD operations
export async function saveToStore<T extends { id: string }>(storeName: string, data: T): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.put({ ...data, updated_at: Date.now() })
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function getFromStore<T>(storeName: string, id: string): Promise<T | undefined> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.get(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function deleteFromStore(storeName: string, id: string): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.delete(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const index = store.index(indexName)
    const request = index.getAll(value)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// Pending sync operations
export async function addPendingSync(sync: Omit<PendingSync, 'id' | 'timestamp' | 'retries'>): Promise<void> {
  const pendingSync: PendingSync = {
    ...sync,
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    retries: 0,
  }
  await saveToStore('pending_sync', pendingSync)
}

export async function getPendingSyncs(): Promise<PendingSync[]> {
  return getAllFromStore<PendingSync>('pending_sync')
}

export async function removePendingSync(id: string): Promise<void> {
  await deleteFromStore('pending_sync', id)
}

export async function incrementSyncRetry(id: string): Promise<void> {
  const sync = await getFromStore<PendingSync>('pending_sync', id)
  if (sync) {
    sync.retries += 1
    await saveToStore('pending_sync', sync)
  }
}

// Sync status
export function isOnline(): boolean {
  return navigator.onLine
}

export function onOnlineStatusChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)
  
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

// File attachment handling
export interface Attachment {
  id: string
  patient_id: string
  report_id?: string
  filename: string
  type: string
  size: number
  data: ArrayBuffer
  created_at: number
}

export async function saveAttachment(file: File, patientId: string, reportId?: string): Promise<string> {
  const id = `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const arrayBuffer = await file.arrayBuffer()
  
  const attachment: Attachment = {
    id,
    patient_id: patientId,
    report_id: reportId,
    filename: file.name,
    type: file.type,
    size: file.size,
    data: arrayBuffer,
    created_at: Date.now(),
  }
  
  await saveToStore('attachments', attachment)
  return id
}

export async function getAttachment(id: string): Promise<Attachment | undefined> {
  return getFromStore<Attachment>('attachments', id)
}

export async function getPatientAttachments(patientId: string): Promise<Attachment[]> {
  return getByIndex<Attachment>('attachments', 'patient_id', patientId)
}

export function attachmentToBlob(attachment: Attachment): Blob {
  return new Blob([attachment.data], { type: attachment.type })
}

export function attachmentToURL(attachment: Attachment): string {
  const blob = attachmentToBlob(attachment)
  return URL.createObjectURL(blob)
}

// Clear old data (for storage management)
export async function clearOldData(daysOld: number = 30): Promise<void> {
  const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000)
  const database = await initDB()
  
  const stores = ['patients', 'lab_reports', 'medical_exams', 'radiology']
  
  for (const storeName of stores) {
    const transaction = database.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const index = store.index('updated_at')
    const range = IDBKeyRange.upperBound(cutoff)
    
    const request = index.openCursor(range)
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      }
    }
  }
}
