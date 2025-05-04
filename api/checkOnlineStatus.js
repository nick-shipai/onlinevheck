import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, onValue, update } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyBqgNC5BXxtHMnc-oMhQ0QhLYg18oAG3QA",
    authDomain: "teens-f3fc7.firebaseapp.com",
    databaseURL: "https://teens-f3fc7-default-rtdb.firebaseio.com",
    projectId: "teens-f3fc7",
    storageBucket: "teens-f3fc7.appspot.com",
    messagingSenderId: "828565874604",
    appId: "1:828565874604:web:83ce3266202b4cd4b1fc09"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default async function handler(req, res) {
    try {
        const usersRef = ref(db, 'users');
        const usersSnapshot = await get(usersRef);

        if (!usersSnapshot.exists()) {
            return res.status(404).json({ error: 'No users found' });
        }

        const updates = {};
        const usersData = usersSnapshot.val();

        for (const uid in usersData) {
            // Firebase maintains a special path to detect if connected
            const connectedRef = ref(db, '.info/connected');
            const isConnected = await new Promise((resolve) => {
                onValue(connectedRef, (snap) => {
                    resolve(snap.val() === true);
                }, { onlyOnce: true });
            });

            if (isConnected) {
                updates[`users/${uid}/status`] = 'online';
            }
        }

        await update(ref(db), updates);

        return res.status(200).json({ message: 'User statuses updated.', updates });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
