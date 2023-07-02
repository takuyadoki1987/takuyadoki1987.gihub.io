const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
let dx = 2;
let dy = -2;
const ballRadius = 3;
const paddleHeight = 5;
const paddleWidth = 50;
let paddleX = (canvas.width - paddleWidth) / 2;
let x = canvas.width / 2;
let y = canvas.height - 18;
let rightPressed = false;
let leftPressed = false;
let spacePressed = false;
const brickRowCount = 5;
const brickColumnCount = 5;
const brickWidth = 45;
const brickHeight = 5;
const brickPadding = 2;
const brickOffsetTop = 20;
const brickOffsetLeft = 35;
let score = 0;
let lives = 3;

//空の二次元配列を作成
const bricks = [];
for (var c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (var r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}
//キーボード操作のイベントリスナー
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

//マウス操作のイベントリスナー
document.addEventListener("mousemove", mouseMoveHandler)

// ランダムに色を作る 16進数ver
// function randomColor() {
//     return Math.random().toString(16).slice(-6);
// }

// canvasにボールを描く
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.closePath();
}
// キャンバスにパドルを描く
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - 15, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0066FF";
    ctx.fill();
    ctx.closePath();
}

// キャンバスにブロックを描く
function drawBricks() {
    const color = ["#1E98B9", "#3EBA2B", "#FFEA2A", "#D04255", "#8858AA"]
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = color[r];
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}


// 実際に関数を呼び出してキャンバスに描く
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();
    drawScore();
    drawLives();

    if (!spacePressed) {
        return;
    }


    //ボールと横壁の衝突判定
    x += dx;
    y += dy;
    if (x + dx < ballRadius || x + dx > canvas.width - ballRadius) {
        dx = -dx;
    }
    // ボールと上の壁の衝突判定
    if (y + dy < ballRadius) {
        dy = - dy;
        //ボールが下壁に当たったらライフが減る
    } else if (y + dy > canvas.height - 15) {
        //ボールがパドルの幅の範囲にあれば跳ね返す
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
            //そうでなければライフをマイナス１する
        } else {
            lives--;
            spacePressed = false;
            //ライフが0になったらゲームオーバーを表示する
            if (lives === 0) {
                gameOver();
                return;
                //そうでなければパドルの位置とボールの位置、移動量を初期値に戻す
            } else {
                x = canvas.width / 2;
                y = canvas.height - 18;
                dx = 2;
                dy = -2;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }
    //右キーが押されればパドルのX座標をプラス3する
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 3
    //左キーが押されればパドルのX座標をマイナス３する
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 3;
    }
    gameReload();
    requestAnimationFrame(draw);
}

// キーが押されたときに変数をtrueに変える
function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    } else if (e.key === " ") {
        if (!spacePressed) {
            spacePressed = true;
            draw();
        }
    }
}

// キーをはなしたときに変数をfalseに変える
function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

// マウス操作でパドルを動かす
function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > paddleWidth / 2 && relativeX < canvas.width - paddleWidth / 2) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

// ボールとブロックの衝突検知
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    // ブロックを消すたびにボールの速度を上げる
                    if (dy > 0) {
                        dy += 0.1;
                    } else {
                        dy -= 0.1;
                    }
                    if (dx > 0) {
                        dx += 0.1;
                    } else {
                        dx -= 0.1;
                    }

                    b.status = 0;
                    score++;
                    if (score === brickRowCount * brickColumnCount) {
                        gameClear();
                        return;
                    }
                }
            }
        }
    }
}

//キャンバスにスコアを表示する
function drawScore() {
    ctx.font = "10px Noto Sans JP";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText(`スコア: ${score}`, 8, 15);
}

// ライフをキャンバスに表示する
function drawLives() {
    ctx.font = "10px Noto Sans JP";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    if (lives >= 0) {
        ctx.fillText("ライフ：" + "❤".repeat(lives), canvas.width - 50, 15);
    } else {
        document.location.reload();
    }
}

// ゲーム開始前のテキストを表示
function drawStartText() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "white ";
    ctx.textAlign = "center"
    ctx.fillText("press the space key", canvas.width / 2, canvas.height / 2);
}

// ゲームオーバー時のテキスト表示
function gameOver() {
    ctx.font = "24px Noto Sans JP";
    ctx.fillStyle = "red";
    // ctx.textAlign = "left";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    spacePressed = false;
}

//ゲームクリア時のテキスト表示
function gameClear() {
    ctx.font = "24px Noto Sans JP";
    ctx.fillStyle = "yellow";
    ctx.fillText("CONGRATULATIONS!!", canvas.width / 2, canvas.height / 2);
    spacePressed = false;
}

// ゲームクリア後初期状態に戻す
console.log(spacePressed)
function gameReload() {
    if  (score === brickRowCount * brickColumnCount && spacePressed === true) {
        document.location.reload();
        clearInterval(interval);
    }
}

drawBricks();
drawBall();
drawPaddle();
drawScore();
drawLives();
drawStartText();
