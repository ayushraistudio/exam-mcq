// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyDljpilurzSWtwZIYg2BnUP45Jb5htMdVI",
    authDomain: "exam-portal-e252b.firebaseapp.com",
    projectId: "exam-portal-e252b",
    storageBucket: "exam-portal-e252b.appspot.com",
    messagingSenderId: "783160042929",
    appId: "1:783160042929:web:f0a19a6ce1333c5af10990"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

window.auth = auth;
window.db = db;

// 🔹 Login Button
document.getElementById('loginBtn').addEventListener('click', async () => {
    const role = document.querySelector('input[name="role"]:checked').value;
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    errorMsg.textContent = "";

    try {
        // Login
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Fixed Admin UID
        const adminUID = "KNEyWMy1owVLokO5MfaUsnB0vOR2"; // Firebase console se admin UID copy karo

        // Role check
        if(role === 'admin') {
            if(user.uid !== adminUID) {
                errorMsg.textContent = "Not authorized as admin";
                auth.signOut();
                return;
            }
            window.location.href = "admin.html"; // Admin dashboard
        } else {
            window.location.href = "student.html"; // Student dashboard
        }

    } catch (error) {
        errorMsg.textContent = error.message;
    }
});
