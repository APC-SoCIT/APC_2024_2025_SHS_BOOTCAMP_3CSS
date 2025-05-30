// Challenges.js
const level1 = document.querySelector('.level1');

const popupInfo = document.querySelector('.popup-info');
const popupInfo1 = document.querySelector('.popup-info1');
const popupInfo2 = document.querySelector('.popup-info2');

const exitBtn = document.querySelector('.exit-btn');
const exitBtn1 = document.querySelector('.exit-btn1');
const exitBtn2 = document.querySelector('.exit-btn2');

const home = document.querySelector('.home');
const continueBtn = document.querySelector('.continue-btn');

const quizSection = document.querySelector('.quiz-section');
const quizBox = document.querySelector('.quiz-box');
const resultBox = document.querySelector('.result-box');

const tryAgainBtn = document.querySelector('.tryAgain-btn');
const goHomeBtn = document.querySelector('.goHome-btn');
const closeBtn = document.querySelector('.close-btn');

// --- Quiz State Variables ---
let questionCount = 0;
let questionNumb = 1;
let userScore = 0;
let currentQuizLevel = 0;
let shuffledQuestions = [];

// --- Shuffle questions for each level ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- Level Management Functions ---
function loadLevelsState() {
    const highestUnlockedLevel = parseInt(localStorage.getItem('highestUnlockedLevel') || '1');
    const allLevelElements = document.querySelectorAll('.level');

    allLevelElements.forEach(levelElement => {
        const levelNum = parseInt(levelElement.dataset.level);
        if (levelNum <= highestUnlockedLevel) {
            levelElement.classList.add('active');
        } else {
            levelElement.classList.remove('active');
        }
    });
}
document.addEventListener('DOMContentLoaded', loadLevelsState);

// --- Level Click Handlers ---
const allLevelElements = document.querySelectorAll('.level');
allLevelElements.forEach(levelElement => {
    levelElement.onclick = () => {
        const levelNum = parseInt(levelElement.dataset.level);

        if (levelElement.classList.contains('active')) {

            if (levelNum == 2 && !localStorage.getItem('level2Passed')) {

                popupInfo1.classList.add('active'); 
                home.classList.add('active');
            } else {
                popupInfo.classList.add('active');
                home.classList.add('active');
                currentQuizLevel = levelNum; 
            }
        } else {
            popupInfo2.classList.add('active'); 
            home.classList.add('active');
        }
    };
}); 

// --- Popup Exit Buttons ---
exitBtn.onclick = () => {
    popupInfo.classList.remove('active');
    home.classList.remove('active');
}
exitBtn1.onclick = () => {
    popupInfo1.classList.remove('active');
    home.classList.remove('active');
}
exitBtn2.onclick = () => {
    popupInfo2.classList.remove('active');
    home.classList.remove('active');
}

// --- Continue Button (Start Quiz) ---
continueBtn.onclick = () => {
    quizSection.classList.add('active');
    popupInfo.classList.remove('active');
    home.classList.remove('active');
    quizBox.classList.add('active');

    questionCount = 0;
    questionNumb = 1;
    userScore = 0;

    shuffledQuestions = shuffleArray([...questions]);
    showQuestions(0);
    questionCounter(1);
} 
// --- This function is used by multiple buttons (Go Home, Try Again's Go Home, Close Quiz Btn) ---
const resetQuizAndGoHome = () => {
    quizSection.classList.remove('active');
    quizBox.classList.remove('active');
    resultBox.classList.remove('active');
    home.classList.remove('active');
    const header1 = document.querySelector('.header1');
    if (header1) header1.style.display = 'flex';


    shuffledQuestions = shuffleArray([...questionsForLevel]);

    questionCount = 0;
    questionNumb = 1;
    userScore = 0;

    showQuestions(0);
    questionCounter(1);
    updateQuizProgressBar();
    nextBtn.classList.remove('active'); 
    shuffledQuestions = [];


    updateQuizProgressBar();
    loadLevelsState();
};

// --- Try Again Button ---
tryAgainBtn.onclick = () => {
    quizBox.classList.add('active');
    nextBtn.classList.remove('active');
    resultBox.classList.remove('active');
    const header1 = document.querySelector('.header1');
    if (header1) header1.style.display = 'flex';

    questionCount = 0;
    questionNumb = 1;
    userScore = 0;

    shuffledQuestions = shuffleArray([...questions]);
    showQuestions(questionCount);
    questionCounter(questionNumb);
    

}

// --- Go Home Button (from Result Box) ---
goHomeBtn.onclick = resetQuizAndGoHome;

// --- Close Quiz Button (in Quiz Header) ---
closeBtn.onclick = resetQuizAndGoHome;



const nextBtn = document.querySelector('.next-btn');

// --- Next Question Button ---
nextBtn.onclick = () => {
    if (questionCount < shuffledQuestions.length - 1) { 
        questionCount++;
        showQuestions(questionCount);

        questionNumb++;
        questionCounter(questionNumb);

        nextBtn.classList.remove('active');
    } else {
        showResultBox();
    }
}

const optionlist = document.querySelector('.option-list');

// --- Function to display questions and options ---
function showQuestions(index) {
    const questionText = document.querySelector('.question-text');
    const currentQuestion = shuffledQuestions[index]; 

    questionText.textContent = `${currentQuestion.question}`; 


    let shuffledOptions = shuffleArray([...currentQuestion.options]); 

    let optionTag = `<div class="option"><span>${shuffledOptions[0]}</span></div>
        <div class="option"><span>${shuffledOptions[1]}</span></div>
        <div class="option"><span>${shuffledOptions[2]}</span></div>
        <div class="option"><span>${shuffledOptions[3]}</span></div>`
        ;

    optionlist.innerHTML = optionTag;

    const option = document.querySelectorAll('.option');
    for (let i = 0; i < option.length; i++) {
        option[i].setAttribute('onclick', 'optionSelected(this)');
    }
    updateQuizProgressBar();
}
const progressBar = document.querySelector('.progress-bar');

function optionSelected(answer) {
    let userAnswer = answer.textContent;
    let correctAnswer = shuffledQuestions[questionCount].answer; 
    let allOptions = optionlist.children.length;

    if (userAnswer == correctAnswer) {
        answer.classList.add('correct');
        userScore += 1;
    } else {
        answer.classList.add('incorrect');

        for (let i = 0; i < allOptions; i++) {
            if (optionlist.children[i].textContent == correctAnswer) {
                optionlist.children[i].setAttribute('class', 'option correct');
            }
        }
    }
    for (let i = 0; i < allOptions; i++) {
        optionlist.children[i].classList.add('disabled');
    }
    nextBtn.classList.add('active');

}

// --- Update Question Counter Display (e.g., "1 of 5 Questions") ---
function questionCounter(index) {
    const questionTotal = document.querySelector('.question-total');
    questionTotal.textContent = `${index} of ${shuffledQuestions.length} Questions` 
}

// --- Update Top Progress Bar ---
function updateQuizProgressBar() {
    const progress = (questionCount / shuffledQuestions.length) * 100; 
    progressBar.style.width = `${progress}%`;
}

// --- Show Quiz Result Box ---
function showResultBox() {
    const header1 = document.querySelector('.header1');
    if (header1) header1.style.display = 'none';

    quizBox.classList.remove('active');
    resultBox.classList.add('active');
    

    const scoreText = document.querySelector('.score-text');
    scoreText.textContent = `Your Score ${userScore} out of ${shuffledQuestions.length}`; 

    // Circular Progress Bar Animation
    const circularProgress = document.querySelector('.circular-progress');
    const progressValue = document.querySelector('.progress-value');
    let progressStartValue = -1;
    let progressEndValue = (userScore / shuffledQuestions.length) * 100; 
    let speed = 20;

    let progress = setInterval(() => {
        progressStartValue++;
        progressValue.textContent = `${progressStartValue}%`;
        circularProgress.style.background = `conic-gradient(#9694FF ${progressStartValue * 3.6}deg, rgba(255, 255, 255, 0.397) 0deg)`;

        if (progressStartValue == progressEndValue) {
            clearInterval(progress);
        }

    }, speed);

    // --- Logic for Next Level / Try Again ---
    if (progressEndValue >= 80) {
        // User passed the quiz!
        scoreText.textContent += " - You Passed! 🎉";
        goHomeBtn.textContent = "Next Level";


        goHomeBtn.onclick = () => {
            const nextLevelNum = currentQuizLevel + 1;
            const highestUnlockedLevel = parseInt(localStorage.getItem('highestUnlockedLevel') || '1');

            if (nextLevelNum <= questions.length && nextLevelNum > highestUnlockedLevel) {
                localStorage.setItem('highestUnlockedLevel', nextLevelNum.toString());
                loadLevelsState();
            } else if (nextLevelNum > questions.length) {

                alert("Congratulations! You've completed all levels!");
                goHomeBtn.textContent = "Go To Home";
            }
            if (currentQuizLevel === 2) {
                localStorage.setItem('level2Passed', 'true');
            }

            resetQuizAndGoHome();
        };
    } else {
        // User failed the quiz
        scoreText.textContent += " - Try Again! 😞";
        goHomeBtn.textContent = "Go To Home";

        goHomeBtn.onclick = resetQuizAndGoHome;
    }
}
