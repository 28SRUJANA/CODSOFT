const questionText =
document.getElementById("question");

const optionButtons =
document.querySelectorAll(".option");

const quizResult =
document.getElementById("quizResult");

const quizPopup =
document.getElementById("quizPopup");

const popup =
document.getElementById("gamePopup");

const popupTitle =
document.getElementById("popupTitle");

const popupMessage =
document.getElementById("popupMessage");

const popupBtn =
document.getElementById("popupBtn");

const bgMusic =
document.getElementById("bgMusic");

const cells =
document.querySelectorAll(".cell");

const statusText =
document.getElementById("status");

const xBtn =
document.getElementById("xBtn");

const oBtn =
document.getElementById("oBtn");

const easyBtn =
document.getElementById("easyBtn");

const mediumBtn =
document.getElementById("mediumBtn");

const hardBtn =
document.getElementById("hardBtn");

const playerScoreText =
document.getElementById("playerScore");

const aiScoreText =
document.getElementById("aiScore");

const drawScoreText =
document.getElementById("drawScore");

let difficulty = "easy";

let playerScore = 0;

let aiScore = 0;

let drawScore = 0;

let currentQuestion;

let board =
["","","","","","","","",""];

let human = "X";

let ai = "O";

let playing = true;

const patterns = [

[0,1,2],
[3,4,5],
[6,7,8],

[0,3,6],
[1,4,7],
[2,5,8],

[0,4,8],
[2,4,6]

];

window.onload = ()=>{

    bgMusic.volume = 1;

    document.body.addEventListener(
    "click",
    ()=>{

        bgMusic.play();

    },
    {once:true}
    );
};

function loadQuestion(){

    const categories =
    Object.keys(questions);

    const randomCategory =
    categories[
        Math.floor(
            Math.random() *
            categories.length
        )
    ];

    const categoryQuestions =
    questions[randomCategory];

    currentQuestion =
    categoryQuestions[
        Math.floor(
            Math.random() *
            categoryQuestions.length
        )
    ];

    questionText.innerHTML =

    `📚 ${randomCategory.toUpperCase()}
    <br><br>
    ${currentQuestion.question}`;

    quizResult.innerHTML = "";

    optionButtons.forEach((btn,index)=>{

        btn.innerHTML =
        currentQuestion.options[index];

        btn.onclick = ()=>{

            if(
                btn.innerHTML ===
                currentQuestion.answer
            ){

                quizResult.innerHTML =
                "🎉 Correct Answer!";

                setTimeout(()=>{

                    quizPopup.style.display =
                    "none";

                },1000);

            }else{

                quizResult.innerHTML =

                `❌ Correct Answer:
                ${currentQuestion.answer}`;
            }
        };
    });
}

loadQuestion();

function setDifficulty(button){

    document
    .querySelectorAll(".difficulty")
    .forEach(btn=>{

        btn.classList.remove(
        "active-level"
        );
    });

    button.classList.add(
    "active-level"
    );
}

easyBtn.onclick = ()=>{

    difficulty = "easy";

    setDifficulty(easyBtn);

    resetGame();

    if(human === "O"){

        setTimeout(aiMove,500);
    }
};

mediumBtn.onclick = ()=>{

    difficulty = "medium";

    setDifficulty(mediumBtn);

    resetGame();

    if(human === "O"){

        setTimeout(aiMove,500);
    }
};

hardBtn.onclick = ()=>{

    difficulty = "hard";

    setDifficulty(hardBtn);

    resetGame();

    if(human === "O"){

        setTimeout(aiMove,500);
    }
};

xBtn.onclick = ()=>{

    human = "X";

    ai = "O";

    xBtn.classList.add("active");

    oBtn.classList.remove("active");

    resetGame();
};

oBtn.onclick = ()=>{

    human = "O";

    ai = "X";

    oBtn.classList.add("active");

    xBtn.classList.remove("active");

    resetGame();

    setTimeout(aiMove,500);
};

cells.forEach(cell=>{

    cell.addEventListener(
    "click",
    playerMove
    );
});

function playerMove(e){

    const index =
    e.target.dataset.index;

    if(
        board[index] !== "" ||
        !playing
    ){
        return;
    }

    makeMove(index,human);

    if(
        checkWinner(board,human)
    ){

        finishGame(human);

        return;
    }

    if(checkDraw()){

        finishDraw();

        return;
    }

    aiMove();
}

function aiMove(){

    if(!playing) return;

    statusText.innerHTML =
    "🤖 AI Thinking...";

    setTimeout(()=>{

        let move;

        if(difficulty === "easy"){

            move = randomMove();

        }else if(
            difficulty === "medium"
        ){

            if(Math.random() < 0.5){

                move = randomMove();

            }else{

                move =
                minimax(board,ai).index;
            }

        }else{

            move =
            minimax(board,ai).index;
        }

        makeMove(move,ai);

        if(
            checkWinner(board,ai)
        ){

            finishGame(ai);

            return;
        }

        if(checkDraw()){

            finishDraw();

            return;
        }

        statusText.innerHTML =
        "🎯 Your Turn";

    },700);
}

function randomMove(){

    let empty =

    board
    .map((value,index)=>

    value === ""
    ? index
    : null)

    .filter(value=>
    value !== null);

    return empty[
        Math.floor(
            Math.random() *
            empty.length
        )
    ];
}

function makeMove(index,player){

    board[index] = player;

    cells[index].textContent =
    player;

    cells[index].style.color =

    player === "X"
    ? "#00c6ff"
    : "#ff4d4d";

    cells[index].style.transform =
    "scale(1.15)";

    setTimeout(()=>{

        cells[index].style.transform =
        "scale(1)";

    },200);
}

function checkWinner(
currentBoard,
player
){

    return patterns.some(pattern=>{

        return pattern.every(index=>{

            return (
                currentBoard[index]
                === player
            );
        });
    });
}

function checkDraw(){

    return board.every(cell=>
    cell !== "");
}

function finishDraw(){

    playing = false;

    drawScore++;

    drawScoreText.innerHTML =
    drawScore;

    popup.style.display =
    "flex";

    popupTitle.innerHTML =
    "🤝 MATCH DRAW";

    popupMessage.innerHTML =
    "Amazing Match 🔥";

    popupBtn.innerHTML =
    "Play Again";

    popupBtn.onclick = ()=>{

        popup.style.display =
        "none";

        resetGame();

        quizPopup.style.display =
        "flex";

        loadQuestion();
    };
}

function finishGame(player){

    playing = false;

    patterns.forEach(pattern=>{

        if(
            pattern.every(index=>
            board[index] === player)
        ){

            pattern.forEach(i=>{

                cells[i]
                .classList
                .add("winner");

                if(player === human){

                    createBlast(
                    cells[i]
                    );
                }
            });
        }
    });

    popup.style.display =
    "flex";

    if(player === human){

        playerScore++;

        playerScoreText.innerHTML =
        playerScore;

        popupTitle.innerHTML =
        "🎉 YOU WON!";

        if(difficulty === "easy"){

            popupMessage.innerHTML =
            "🔥 Medium Level Unlocked!";

            popupBtn.innerHTML =
            "Play Medium Level";

            popupBtn.onclick = ()=>{

                popup.style.display =
                "none";

                difficulty =
                "medium";

                setDifficulty(
                mediumBtn
                );

                resetGame();

                quizPopup.style.display =
                "flex";

                loadQuestion();
            };

        }else if(
            difficulty === "medium"
        ){

            popupMessage.innerHTML =
            "🚀 Hard Level Unlocked!";

            popupBtn.innerHTML =
            "Play Hard Level";

            popupBtn.onclick = ()=>{

                popup.style.display =
                "none";

                difficulty =
                "hard";

                setDifficulty(
                hardBtn
                );

                resetGame();

                quizPopup.style.display =
                "flex";

                loadQuestion();
            };

        }else{

            popupMessage.innerHTML =
            "🏆 You Beat Hard Mode!";

            popupBtn.innerHTML =
            "Play Again";

            popupBtn.onclick = ()=>{

                popup.style.display =
                "none";

                resetGame();

                quizPopup.style.display =
                "flex";

                loadQuestion();
            };
        }

    }else{

        aiScore++;

        aiScoreText.innerHTML =
        aiScore;

        const quotes = [

        "💪 Never Give Up!",

        "🌟 Practice Makes Perfect!",

        "🔥 You Can Win Next Time!",

        "🚀 Keep Trying Superstar!",

        "😊 Champions Never Quit!"

        ];

        popupTitle.innerHTML =
        "😔 YOU LOST";

        popupMessage.innerHTML =

        quotes[
            Math.floor(
                Math.random() *
                quotes.length
            )
        ];

        popupBtn.innerHTML =
        "Try Again";

        popupBtn.onclick = ()=>{

            popup.style.display =
            "none";

            resetGame();

            quizPopup.style.display =
            "flex";

            loadQuestion();
        };
    }
}

function createBlast(cell){

    const rect =
    cell.getBoundingClientRect();

    const centerX =
    rect.left + rect.width / 2;

    const centerY =
    rect.top + rect.height / 2;

    const colors = [

    "#ff0",
    "#00f260",
    "#00c6ff",
    "#ff0080",
    "#ff5722",
    "#ffffff",
    "#7c4dff"

    ];

    for(let i=0;i<220;i++){

        const blast =
        document.createElement("div");

        blast.classList.add("blast");

        blast.style.left =
        `${centerX}px`;

        blast.style.top =
        `${centerY}px`;

        blast.style.background =

        colors[
            Math.floor(
                Math.random() *
                colors.length
            )
        ];

        const angle =
        Math.random() *
        Math.PI * 2;

        const distance =
        Math.random() * 1000;

        const x =
        Math.cos(angle) * distance;

        const y =
        Math.sin(angle) * distance;

        blast.style.setProperty(
        "--x",
        `${x}px`
        );

        blast.style.setProperty(
        "--y",
        `${y}px`
        );

        const size =
        Math.random() * 16 + 6;

        blast.style.width =
        `${size}px`;

        blast.style.height =
        `${size}px`;

        document.body.appendChild(
        blast
        );

        setTimeout(()=>{

            blast.remove();

        },2000);
    }
}

function minimax(newBoard,player){

    let emptySpots =

    newBoard
    .map((value,index)=>

    value === ""
    ? index
    : null)

    .filter(value=>
    value !== null);

    if(
        checkWinner(
        newBoard,
        human
        )
    ){

        return {score:-10};
    }

    if(
        checkWinner(
        newBoard,
        ai
        )
    ){

        return {score:10};
    }

    if(
        emptySpots.length === 0
    ){

        return {score:0};
    }

    let moves = [];

    for(
        let i=0;
        i<emptySpots.length;
        i++
    ){

        let move = {};

        move.index =
        emptySpots[i];

        newBoard[
        emptySpots[i]
        ] = player;

        if(player === ai){

            move.score =
            minimax(
            newBoard,
            human
            ).score;

        }else{

            move.score =
            minimax(
            newBoard,
            ai
            ).score;
        }

        newBoard[
        emptySpots[i]
        ] = "";

        moves.push(move);
    }

    let bestMove;

    if(player === ai){

        let bestScore =
        -Infinity;

        for(
            let i=0;
            i<moves.length;
            i++
        ){

            if(
                moves[i].score >
                bestScore
            ){

                bestScore =
                moves[i].score;

                bestMove = i;
            }
        }

    }else{

        let bestScore =
        Infinity;

        for(
            let i=0;
            i<moves.length;
            i++
        ){

            if(
                moves[i].score <
                bestScore
            ){

                bestScore =
                moves[i].score;

                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function resetGame(){

    board =
    ["","","","","","","","",""];

    playing = true;

    popup.style.display =
    "none";

    cells.forEach(cell=>{

        cell.textContent = "";

        cell.classList.remove(
        "winner"
        );
    });

    statusText.innerHTML =

    human === "X"
    ? "🎯 Your Turn"
    : "🤖 AI Turn";

    if(human === "O"){

        setTimeout(aiMove,500);
    }
}