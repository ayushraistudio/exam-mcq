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

// 🔹 DOM Elements
const waitMessage = document.getElementById('waitMessage');
const examContainer = document.getElementById('examContainer');
const questionsContainer = document.getElementById('questionsContainer');
const examForm = document.getElementById('examForm');
const examResult = document.getElementById('examResult');
const scoreText = document.getElementById('scoreText');
const timerDiv = document.getElementById('timer');

let timerInterval;

// 🔹 Load Exam in Real-time
function loadExamRealtime() {
    db.collection('exams').doc('currentExam')
      .onSnapshot(async (doc) => {
          if(doc.exists) {
              const examData = doc.data();
              if(examData.status === 'started') {
                  waitMessage.style.display = 'none';
                  examContainer.style.display = 'block';
                  loadQuestions();
                  startTimer(examData.duration || 600); // default 10 min
              } else {
                  waitMessage.style.display = 'block';
                  examContainer.style.display = 'none';
              }
          } else {
              waitMessage.style.display = 'block';
              examContainer.style.display = 'none';
          }
      });
}

// 🔹 Load Questions
async function loadQuestions() {
    questionsContainer.innerHTML = '';
    const snapshot = await db.collection('exams')
                             .doc('currentExam')
                             .collection('questions')
                             .get();

    snapshot.forEach((doc, idx) => {
        const q = doc.data();
        const questionId = doc.id; // unique ID for radio group
        const html = `
            <div class="question-block">
                <p><b>Q${idx+1}:</b> ${q.question}</p>
                ${Object.entries(q.options).map(([key,val]) => `
                    <label>
                        <input type="radio" name="q${questionId}" value="${key}" required> ${key}: ${val}
                    </label><br>
                `).join('')}
            </div>
            <hr>
        `;
        questionsContainer.innerHTML += html;
    });
}

// 🔹 Timer
function startTimer(duration) {
    clearInterval(timerInterval);
    let time = duration;
    timerInterval = setInterval(() => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        timerDiv.textContent = `Time Remaining: ${minutes}:${seconds < 10 ? '0'+seconds : seconds}`;
        time--;
        if(time < 0) {
            clearInterval(timerInterval);
            submitExam();
        }
    }, 1000);
}

// 🔹 Submit Exam
examForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitExam();
});

async function submitExam() {
    const snapshot = await db.collection('exams')
                             .doc('currentExam')
                             .collection('questions')
                             .get();
    let score = 0;

    snapshot.forEach((doc) => {
        const q = doc.data();
        const selected = document.querySelector(`input[name="q${doc.id}"]:checked`);
        if(selected && selected.value === q.correct) score++;
    });

    await db.collection('answers').doc(auth.currentUser.uid).set({
        username: auth.currentUser.email,
        score
    });

    examContainer.style.display = 'none';
    examResult.style.display = 'block';
    scoreText.textContent = `Your Score: ${score} / ${snapshot.size}`;
}

// 🔹 Initialize Real-time Exam Load
loadExamRealtime();
