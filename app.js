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
    const homeBtn = document.querySelector(".home");
    // App menagers
    const quizMn = quizMenager();
    const uiMn = uiMenager();
    const eventMn = eventMenager();

    function uiMenager() {
        const populateQuestion = questionVal => {
            question.innerHTML = questionVal.question;
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
        const handleButtonsClasses = (badAnswerIndex = -1, goodAnswerIndex) => {
            if (badAnswerIndex == -1) {
                setTimeout(() => { document.querySelectorAll(".answers .button")[goodAnswerIndex].classList.add('success') }, 1000)
                setTimeout(() => {
                    nextQuestionEl.disabled = false;
                    quizMn.nextQuestion();
                }, 3000)
            }
            else {
                setTimeout(() => {
                    document.querySelectorAll(".answers .button")[goodAnswerIndex].classList.add('success')
                    document.querySelectorAll(".answers .button")[badAnswerIndex].classList.add('wrong')

                }, 1000)
                setTimeout(() => {
                    nextQuestionEl.disabled = false;
                    quizMn.nextQuestion();
                }, 3000)
            }

        }
        const populateAnswers = (answers) => {
            answersWrapper.innerHTML = "";
            answers.forEach((answer, i) => {
                const answerHtmlElement = document.createElement('button');
                answerHtmlElement.className = "button answer";
                answerHtmlElement.innerHTML = answer;
                answersWrapper.appendChild(answerHtmlElement)
                answerHtmlElement.onclick = () => {
                    const { badAnswerIndex, goodAnswerIndex } = quizMn.checkAnswer(answer)
                    nextQuestionEl.disabled = true;
                    handleButtonsClasses(badAnswerIndex, goodAnswerIndex)
                }
            })
        }
        const endOfQuiz = (points) => {
            totalPts.textContent = points;
        }
        return { populateQuestion, setAnswers: populateAnswers, endOfQuiz, populateStageOfApp, populateTimer, handleButtonsClasses }
    }

    function quizMenager() {
        let timer = 15;
        let timerInterval;
        let stageOfApp = 1;
        let totalPoints = 0;
        let currentQuestionIndex = 0;
        let correctAnswer;
        let questions = [
        ]
        let answers = []
        const fetchQuestions = async () => {
            var data = await fetch("https://opentdb.com/api.php?amount=8")
            var questionsData = await data.json();
            questions = questionsData.results
        }

        const startQuiz = () => {
            stageOfApp = 2;
            uiMn.populateStageOfApp(stageOfApp)
            uiMn.populateTimer(timer)
            setQuestion();

        }
        const nextQuestion = async () => {
            cleanTimer();
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                setQuestion()
            }
            else {
                stageOfApp = 3;
                uiMn.populateStageOfApp(stageOfApp)
                uiMn.endOfQuiz(totalPoints);
            }
        };

        const checkAnswer = (answer) => {
            freezTime();
            let badAnswer = questions[currentQuestionIndex].incorrect_answers.find(a => a == answer)
            let goodAnswerIndex = answers.findIndex(ans => ans == correctAnswer)
            let badAnswerIndex = answers.findIndex(ans => ans == badAnswer)
            // Check is answer is correct
            if (answer == questions[currentQuestionIndex].correct_answer) {
                totalPoints += 5;
            }
            return { badAnswerIndex, goodAnswerIndex };
        }

        const setQuestion = () => {
            uiMn.populateQuestion(questions[currentQuestionIndex])
            setAnswers()
            runTimer();

        }

        const setAnswers = () => {
            correctAnswer = "";
            correctAnswer = questions[currentQuestionIndex].correct_answer;
            const allAnswers = [questions[currentQuestionIndex].correct_answer, ...questions[currentQuestionIndex].incorrect_answers]
            answers = allAnswers;
            let randomizedQuestions = allAnswers.sort(() => Math.random() - 0.5)
            uiMn.setAnswers(randomizedQuestions)

        }
        const playAgain = () => {
            totalPoints = 0;
            currentQuestionIndex = 0;
            stageOfApp = 2;
            uiMn.populateStageOfApp(stageOfApp);
            setQuestion()
        }
        const runTimer = () => {
            timerInterval = setInterval(() => {
                timer--;
                if (timer >= 0) {
                    uiMn.populateTimer(timer)
                }
                else {
                    clearInterval(timerInterval)
                    setTimeout(() => { document.querySelectorAll(".answers .button")[quizMn.getCorrectAnswerIndex()].classList.add('success') }, 1000)
                    setTimeout(() => {
                        nextQuestion()
                    }, 3000)

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
        const backToHome = () => {
            stageOfApp = 1;
            uiMn.populateStageOfApp(stageOfApp)
        }

        const getCorrectAnswerIndex = () => answers.findIndex(ans => ans == correctAnswer)

        const initApp = () => {
            fetchQuestions()
            eventMn.playAgainEvent()
            eventMn.nextQuestionEvent()
            eventMn.startAQuizEvent();
            eventMn.backToHomeEvent()
            uiMn.populateStageOfApp(stageOfApp)
        }
        return {
            nextQuestion, setQuestion, startQuiz,
            setAnswers, checkAnswer, initApp, playAgain, runTimer,
            cleanTimer, freezTime, fetchQuiz: fetchQuestions,
            getCorrectAnswerIndex, backToHome
        }
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
        const backToHomeEvent = () => {
            homeBtn.onclick = () => {
                quizMn.backToHome()
            }
        }
        const nextQuestionEvent = () => {
            nextQuestionEl.onclick = () => {
                setTimeout(() => { document.querySelectorAll(".answers .button")[quizMn.getCorrectAnswerIndex()].classList.add('success') }, 1000)
                setTimeout(() => {
                    quizMn.nextQuestion();
                }, 3000)
            }
        }
        return { startAQuizEvent, playAgainEvent, nextQuestionEvent, backToHomeEvent }
    }
    quizMn.initApp()

}())

