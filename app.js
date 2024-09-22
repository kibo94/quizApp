

(function () {
    // App elements
    const question = document.getElementById("question");
    const nextQuestionEl = document.getElementById("nextQuestion")
    const startAQuizBtn = document.querySelector(".startAQuiz")
    const playAgain = document.querySelector(".playAgain")
    const quizPanel = document.querySelector('.quizPanel')
    const answersWrapper = document.querySelector('.answers')
    const quizEnd = document.querySelector('.quizEnd')
    const totalPts = document.getElementById("totalPoints");
    const timerElement = document.querySelector(".timer");

    // App menagers
    const quizMn = quizMenager();
    const uiMn = uiMenager();
    const eventMn = eventMenager();

    function uiMenager() {
        const populateQuestion = questionVal => {
            question.textContent = questionVal.question;
        }
        const populateTimer = (timer) => {
            timerElement.textContent = timer;
        }
        const populateStageOfApp = (stage) => {
            quizEnd.style.display = "none"
            startAQuizBtn.style.display = "none";
            quizPanel.style.display = "none"
            switch (stage) {
                case 1: {
                    startAQuizBtn.style.display = "block";
                    break;
                }
                case 2: {

                    quizPanel.style.display = "flex";
                    break;

                }
                case 3: {
                    console.log(stage)
                    quizEnd.style.display = "block";
                    break;
                }
            }
        }
        const populateAnswers = (answers) => {
            answersWrapper.innerHTML = "";
            answers.forEach(answer => {
                const answerHtmlElement = document.createElement('button');
                answerHtmlElement.className = "button answer";
                answerHtmlElement.textContent = answer.answer;
                answersWrapper.appendChild(answerHtmlElement)
                answerHtmlElement.onclick = () => {
                    const isAnswerCorrect = quizMn.checkAnswer(answer);
                    nextQuestionEl.disabled = true;

                    if (isAnswerCorrect) {
                        setTimeout(() => { answerHtmlElement.classList.add("success") }, 1000)

                        setTimeout(() => {
                            nextQuestionEl.disabled = false;
                            quizMn.nextQuestion();

                        }, 3000)
                        return;
                    }
                    setTimeout(() => { answerHtmlElement.classList.add("wrong") }, 2000)
                    setTimeout(() => {
                        nextQuestionEl.disabled = false;
                        quizMn.nextQuestion();
                    }, 3000)
                }
            })
        }
        const endOfQuiz = (points) => {
            totalPts.textContent = points;

        }
        return { populateQuestion, setAnswers: populateAnswers, endOfQuiz, populateStageOfApp, populateTimer }
    }

    function quizMenager() {
        let timer = 15;
        let timerInterval;
        let stageOfApp = 1;
        let totalPoints = 0;
        let currentQuestionIndex = 0;
        let question = "";
        let questions = [
            {
                question: "koji je glavni grad Srbije ?",
                answer: { id: 1 },
                answers: [{ answer: "Beograd", id: 1, }, { answer: "Nis", id: 2, }, { answer: "Cacak", id: 3, }, { answer: "Novi sad", id: 4, }]
            },
            {
                question: "Boja neba je ? ",
                answer: { id: 2 },
                answers: [{ answer: "Crvena", id: 1, }, { answer: "Plava", id: 2, }, { answer: "Crna", id: 3, }, { answer: "Bela", id: 4, }]
            },
            {
                question: "Koliko slova ima azbuka  ? ",
                answer: { id: 4 },
                answers: [{ answer: "12", id: 1, }, { answer: "40", id: 2, }, { answer: "17", id: 3, }, { answer: "30", id: 4, }]
            },
            {
                question: "Grad Visoko se nalazi u ?",
                answer: { id: 2 },
                answers: [{ answer: "Srbiji", id: 1, }, { answer: "BIH", id: 2, }, { answer: "Hrvatska", id: 3, }, { answer: "Crna Gora", id: 4, }]
            },
            {
                question: "Jedinica za struju je ?",
                answer: { id: 1 },
                answers: [{ answer: "Amper", id: 1, }, { answer: "Volt", id: 2, }, { answer: "Om", id: 3, }, { answer: "Vat", id: 4, }]
            }
        ]


        const startQuiz = () => {
            stageOfApp = 2;
            uiMn.populateStageOfApp(stageOfApp)
            uiMn.populateTimer(timer)
            setQuestion();
            setAnswers()
            runTimer();
        }
        const nextQuestion = () => {
            cleanTimer();
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                setQuestion()
                setAnswers()
                runTimer();
            }
            else {
                stageOfApp = 3;
                uiMn.populateStageOfApp(stageOfApp)
                uiMn.endOfQuiz(totalPoints);
            }
        };

        const checkAnswer = (answer) => {
            freezTime();
            let isCorrectAnswer = false;
            // Check is answer is correct
            if (answer.id == questions[currentQuestionIndex].answer.id) {
                isCorrectAnswer = true;
                totalPoints += 5;
            }
            return isCorrectAnswer;
        }

        const setQuestion = () => {
            question = questions[currentQuestionIndex]
            // populate ui
            uiMn.populateQuestion(question)
        }

        const setAnswers = () => {
            let answers = questions[currentQuestionIndex].answers;
            uiMn.setAnswers(answers)

        }
        const playAgain = () => {
            totalPoints = 0;
            currentQuestionIndex = 0;
            stageOfApp = 2;
            uiMn.populateStageOfApp(stageOfApp);
            setQuestion()
            setAnswers()
        }
        const runTimer = () => {
            timerInterval = setInterval(() => {
                timer--;
                if (timer > 0) {
                    uiMn.populateTimer(timer)
                }
                else {
                    nextQuestion()
                }

            }, 1000);
        }
        const cleanTimer = () => {
            timer = 15;
            clearInterval(timerInterval);
            uiMn.populateTimer(timer);
        }
        const freezTime = () => {
            clearInterval(timerInterval);
            uiMn.populateTimer(timer);
        }

        const initApp = () => {
            eventMn.playAgainEvent()
            eventMn.nextQuestionEvent()
            eventMn.startAQuizEvent();
            uiMn.populateStageOfApp(stageOfApp)
        }
        return { nextQuestion, setQuestion, startQuiz, setAnswers, checkAnswer, initApp, playAgain, runTimer, cleanTimer, freezTime }
    }


    function eventMenager() {
        const startAQuizEvent = () => {
            startAQuizBtn.onclick = () => {
                quizMn.startQuiz();
            }

        }
        const playAgainEvent = () => {
            playAgain.onclick = () => {
                quizMn.playAgain();
            }
        }

        const nextQuestionEvent = () => {
            nextQuestion.onclick = () => {
                quizMn.nextQuestion();
            }

        }
        return { startAQuizEvent, playAgainEvent, nextQuestionEvent, }
    }
    quizMn.initApp()

}())



