

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
                answerHtmlElement.textContent = answer;
                answersWrapper.appendChild(answerHtmlElement)
                answerHtmlElement.onclick = () => {
                    const { isAnswerCorrect, correct_answer } = quizMn.checkAnswer(answer);
                    nextQuestionEl.disabled = true;

                    if (isAnswerCorrect) {
                        setTimeout(() => { answerHtmlElement.classList.add("success") }, 1000)

                        setTimeout(() => {
                            nextQuestionEl.disabled = false;
                            quizMn.nextQuestion();

                        }, 3000)
                        return;
                    }
                    setTimeout(() => {
                        document.querySelectorAll(".answers .button").forEach(ans => {
                            if (ans.textContent == correct_answer) {
                                ans.classList.add("success")
                            }
                        })
                        answerHtmlElement.classList.add("wrong")

                    }, 2000)
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
        ]
        const fetchQuestions = async () => {
            var data = await fetch("https://opentdb.com/api.php?amount=10");
            var questionsData = await data.json();
            questions = questionsData.results
        }

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
            if (answer == questions[currentQuestionIndex].correct_answer) {
                isCorrectAnswer = true;
                totalPoints += 5;
            }
            return { isCorrectAnswer, correct_answer: questions[currentQuestionIndex].correct_answer };
        }

        const setQuestion = () => {
            question = questions[currentQuestionIndex]
            // populate ui
            uiMn.populateQuestion(question)
        }

        const setAnswers = () => {
            const allAnswers = [questions[currentQuestionIndex].correct_answer, ...questions[currentQuestionIndex].incorrect_answers]
            let randomizedQuestions = allAnswers.sort(() => Math.random() - 0.5)
            uiMn.setAnswers(randomizedQuestions)

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
            fetchQuestions()
            eventMn.playAgainEvent()
            eventMn.nextQuestionEvent()
            eventMn.startAQuizEvent();
            uiMn.populateStageOfApp(stageOfApp)
        }
        return { nextQuestion, setQuestion, startQuiz, setAnswers, checkAnswer, initApp, playAgain, runTimer, cleanTimer, freezTime, fetchQuiz: fetchQuestions }
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

