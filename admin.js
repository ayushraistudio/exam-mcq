// 🔹 Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyDljpilurzSWtwZIYg2BnUP45Jb5htMdVI",
    authDomain: "exam-portal-e252b.firebaseapp.com",
    projectId: "exam-portal-e252b",
    storageBucket: "exam-portal-e252b.appspot.com",
    messagingSenderId: "783160042929",
    appId: "1:783160042929:web:f0a19a6ce1333c5af10990"
};


// 🔹 Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();


// 🔹 Add Student
document.getElementById('addStudentBtn').addEventListener('click', async () => {
    const email = document.getElementById('studentEmail').value;
    const password = document.getElementById('studentPassword').value;
    const msg = document.getElementById('addStudentMsg');
    msg.textContent = "";
    msg.style.color = "green";

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Set role as student
        await db.collection('users').doc(user.uid).set({
            email: email,
            role: 'student',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        msg.textContent = "Student added successfully!";
        document.getElementById('studentEmail').value = "";
        document.getElementById('studentPassword').value = "";

    } catch (error) {
        msg.style.color = "red";
        msg.textContent = error.message;
    }
});


// 🔹 Add Question
document.getElementById('addQuestionBtn').addEventListener('click', async () => {
    const qText = document.getElementById('questionText').value;
    const optionA = document.getElementById('optionA').value;
    const optionB = document.getElementById('optionB').value;
    const optionC = document.getElementById('optionC').value;
    const optionD = document.getElementById('optionD').value;
    const correct = document.getElementById('correctOption').value;
    const msg = document.getElementById('addQuestionMsg');

    msg.textContent = "";
    msg.style.color = "green";

    if (!qText || !optionA || !optionB || !optionC || !optionD || !correct) {
        msg.style.color = "red";
        msg.textContent = "All fields are required!";
        return;
    }

    try {
        await db.collection('exams').doc('currentExam').collection('questions').add({
            question: qText,
            options: { A: optionA, B: optionB, C: optionC, D: optionD },
            correct: correct,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        msg.textContent = "Question added successfully!";
        document.getElementById('questionText').value = "";
        document.getElementById('optionA').value = "";
        document.getElementById('optionB').value = "";
        document.getElementById('optionC').value = "";
        document.getElementById('optionD').value = "";
        document.getElementById('correctOption').value = "";
    } catch (error) {
        msg.style.color = "red";
        msg.textContent = error.message;
    }
});


// 🔹 Exam Controls
const examStatusMsg = document.getElementById('examStatusMsg');

document.getElementById('startExamBtn').addEventListener('click', async () => {
    try {
        await db.collection('exams').doc('currentExam').set({
            status: 'started',
            startTime: firebase.firestore.FieldValue.serverTimestamp()
        });
        examStatusMsg.style.color = "green";
        examStatusMsg.textContent = "Exam started successfully!";
    } catch (error) {
        examStatusMsg.style.color = "red";
        examStatusMsg.textContent = error.message;
    }
});


document.getElementById('endExamBtn').addEventListener('click', async () => {
    try {
        // 1️⃣ Update exam status
        await db.collection('exams').doc('currentExam').update({
            status: 'ended',
            endTime: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 2️⃣ Delete all questions
        const questionsSnapshot = await db.collection('exams').doc('currentExam').collection('questions').get();
        const batch = db.batch();
        questionsSnapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        // 3️⃣ Reset all scores in answers collection to zero
        const answersSnapshot = await db.collection('answers').get();
        const batchAnswers = db.batch();
        answersSnapshot.forEach(doc => {
            batchAnswers.update(doc.ref, { score: 0 });
        });
        await batchAnswers.commit();

        examStatusMsg.style.color = "green";
        examStatusMsg.textContent = "Exam ended, questions cleared, and leaderboard reset!";
    } catch (error) {
        examStatusMsg.style.color = "red";
        examStatusMsg.textContent = error.message;
    }
});


// 🔹 Load Leaderboard
async function loadLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboardBody');
    leaderboardBody.innerHTML = "";

    try {
        const snapshot = await db.collection('answers').orderBy('score', 'desc').get();
        snapshot.forEach(doc => {
            const data = doc.data();
            const row = `<tr>
                <td>${data.username}</td>
                <td>${data.score}</td>
            </tr>`;
            leaderboardBody.innerHTML += row;
        });
    } catch (error) {
        console.error(error);
    }
}

// Auto refresh leaderboard every 10 sec
setInterval(loadLeaderboard, 10000);
loadLeaderboard();
