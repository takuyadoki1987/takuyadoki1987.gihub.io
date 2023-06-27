const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
let x = canvas.width / 2;
let y = canvas.height - 10;
let dx = 2;
let dy = -2;
const ballRadius = 3;
const paddleHeight = 5;
const paddleWidth = 50;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;
let spacePressed = false;
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 45;
const brickHeight = 5;
const brickPadding = 2;
const brickOffsetTop = 20;
const brickOffsetLeft = 35;
let score = 0;
let lives = 3;

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

//赤く塗りつぶされた四角を描画
// ctx.beginPath();
// ctx.rect(20, 40, 50, 50);
// ctx.fillStyle = "red";
// ctx.fill();
// ctx.closePath();

//緑に塗りつぶされた丸を描画
// ctx.beginPath();
// ctx.arc(240, 60, 20,0, Math.PI * 2);
// ctx.fillStyle = "green";
// ctx.fill();
// ctx.closePath();

//青い枠の四角を描画
// ctx.beginPath();
// ctx.rect(160, 10, 100, 100);
// ctx.strokeStyle = "blue";
// ctx.stroke();
// ctx.closePath();

// ランダムに色を作る
function randomColor() {
    let color = { r: 0, g: 0, b: 0 };
    for (let i in color) {
        color[i] = Math.floor(Math.random() * 256);
    }
    let myColor = "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
    return myColor;
}

// canvasにボールを描く
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    // ctx.fillStyle = randomColor();
    ctx.fill();
    ctx.closePath();
}

// キャンバスにパドルを描く
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - 15, paddleWidth, paddleHeight);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.closePath();
}

// キャンバスにブロックを描く
function drawBricks() {
    const color = ["#F39800", "#FFF100", "#8FC31F"]
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

// ゲーム開始前のテキストを表示
function drawStartText() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.textAlign = "center"
    ctx.fillText("スペースを押してゲームスタート", canvas.width / 2, canvas.height / 2);
}

// 実際に関数を呼び出してキャンバスに描く
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!spacePressed) {
        drawStartText();
        return;
    }

    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();
    drawScore();
    drawLives();

    x += dx;
    y += dy;
    if (x + dx < ballRadius || x + dx > canvas.width - ballRadius) {
        dx = -dx;
        // ctx.fillStyle = randomColor();
    }
    // ボールがパドルに当たったか判定する
    if (y + dy < ballRadius) {
        dy = - dy;
    } else if (y + dy > canvas.height -10 - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            lives--;
            if (lives === 0) {
                // ctx.fillStyle = "black";
                // ctx.font = "32px Noto Sans JP";
                // ctx.fillText("ゲームオーバー", canvas.width /2, canvas.height /2);
                alert("ゲームオーバー");
                document.location.reload();
            } else {
                x = canvas.width / 2;
                y = canvas.height - 30;
                dx = 2;
                dy = -2;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 3
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 3;
    }
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
        // e.preventDefault();
        // console.log(spacePressed);

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
    const relativeX = e.clientX - canvas.getBoundingClientRect().left//window.innerWidth / 2;
    // console.log(relativeX);
    if (relativeX - paddleWidth / 2 > 0 && relativeX + paddleWidth / 2 < canvas.width) {
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
                    b.status = 0;
                    score++;
                    if (score === brickRowCount * brickColumnCount) {
                        alert("ゲームクリア！");
                        document.location.reload();
                        clearInterval(interval);
                    }
                }
            }
        }
    }
}

//キャンバスにスコアを表示する
function drawScore() {
    ctx.font = "10px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(`スコア: ${score}`, 8, 15);
}

// ライフをキャンバスに表示する
function drawLives() {
    ctx.font = "10px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(`ライフ: ${lives}`, canvas.width - 50, 15);
}

// draw関数を10msごとに実行する
// draw();
// clearInterval(interval);
