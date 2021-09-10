const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;


// khai báo toàn cục
const cellSize = 100; //kích thước ô
const cellGap = 3; //khoảng cách giữa các ô
const gameGrid = []; //lưới, chua thong tin tung o rieng le trong luoi 
const defenders = []; //mang doi tuong bao ve
const enemies = []; // mang ke thu
const enemyPositions = []; //mang vi tri ke thu
const projectiles = []; //mang dan ban ra
const resources = []; //mang tai nguyen

let enemiesInterval = 600; //khoang time ke thu xuat hien
let numberOfResources = 300; //so luong tai nguyen 
let frame = 0; //khung hinh
let gameOver = false; //ket thuc game
let score = 0;
const winningScore = 50; //diem chien thang

//chuot
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
}
let canvasPosition = canvas.getBoundingClientRect(); //tra ve doi tuong hcn dom
canvas.addEventListener('mousemove', function (e) { //su kien di chuyen chuot
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener('mouseleave', function () { //su kien roi khoi doi tuong
    mouse.y = undefined; //todo lưu ý
    mouse.y = undefined; //todo lưu ý
});

// ve canvas chua diem so hien thi cua dieu khien game
// thanh điều khiển
const controlBar = {
    width: canvas.width,
    height: cellSize,
}
class Cell {
    constructor(x, y) { //thiet lap toa do x,y
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw() {
        if (mouse.x && mouse.y && collision(this, mouse)) {
            ctx.strokeStyle = 'black'; // net vien mau den
            ctx.strokeRect(this.x, this.y, this.width, this.height); //lay chieu rong chieu cao ve 1 hinh chu cn tại toa do xy
        }
    }
}

// tao di chuyen cho doi tuong
function createGrid() {
    for (let y = cellSize; y < canvas.height; y += cellSize) {
        for (let x = 0; x < canvas.width; x += cellSize) {
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();

//ham xu ly voi o
function handleGameGrid() {
    for (let i = 0; i < gameGrid.length; i++) {
        gameGrid[i].draw(); //truy cap den ham draw()
    }
}

//* lop doi tuong bao ve
class Defender {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2; //khoang cach 2 ben trai va phai de tranh cac doi tuong gap nhau o dau nhon
        this.height = cellSize - cellGap * 2; //khoang cach 2 ben tren va duoi de tranh cac doi tuong gap nhau o dau nhon
        this.shooting = false; //thuoc tinh ban khi phat hien doi tuong 
        this.health = 100;
        this.projectiles = []; // thong tin duong dan ma defender dang ban
        this.timer = 0; //bo dem time, khi object ban tu bo dem tang de kich hoat cu the 1 su kien nao do

    }

    // ve hinh khi nhap chuot vao grid
    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'violet';
        ctx.font = '30px Orbitron';
        ctx.fillText(Math.floor(this.health), this.x + 20, this.y + 30);
    }
    update() {
        if (this.shooting) {
            this.timer++;
            if (this.timer % 100 === 0) {
                projectiles.push(new Projectiles(this.x + 70, this.y + 49));
            }
        } else {
            this.timer = 0;
        }
    }

}
canvas.addEventListener('click', function () {
    //truoc tien lay toa do chuot hien tai va gan vao vi tri trong luoi
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
    if (gridPositionY < cellSize) return;
    for (let i = 0; i < defenders.length; i++) {
        if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY)
            return;
    }
    let defenderCost = 50;
    if (numberOfResources >= defenderCost) {
        defenders.push(new Defender(gridPositionX, gridPositionY));
        numberOfResources -= defenderCost;
    }
});


//ham xu ly bao ve
function handlesDefenders() {
    for (let i = 0; i < defenders.length; i++) {
        defenders[i].draw();
        defenders[i].update();
        if (enemyPositions.indexOf(defenders[i].y) !== -1) {
            defenders[i].shooting = true;
        } else {
            defenders[i].shooting = false;
        }
        //duyen mang ke thu cham vao thap bao ve mat mau
        for (let j = 0; j < enemies.length; j++) {
            if (defenders[i] && collision(defenders[i], enemies[j])) {
                enemies[j].movement = 0; //? dung lai khi va cham
                defenders[i].health -= 1;
            }
            if (defenders[i] && defenders[i].health <= 0) {
                defenders.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
    }
}
// console.log(gameGrid)
//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*end

//todo ham xu ly dan ban (projectiles)
class Projectiles {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.power = 20;
        this.speed = 5;
    }
    update() {
        this.x += this.speed;
    }
    draw() {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2) //ve hinh tron dan defender
        ctx.fill();
    }
}

function handleProjectiles() {
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].update();
        projectiles[i].draw();

        for (let j = 0; j < enemies.length; j++) {
            if (enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j])) { //neu ke thi j ton tai va ke thu x[j] ton tai
                enemies[j].health -= projectiles[i].power //mau cua ke thu j -= suc manh dan i=20
                projectiles.splice(i, 1);
                i--;
            }
        }

        if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
            projectiles.splice(i, 1);
            i--;
        }
    }
}
//todo //todo//todo//todo//todo//todo//todo end

//! ham tao ke thu(enemies)
class Enemy {
    constructor(verticalPosition) {
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = Math.random() * 0.2 + 1;
        this.movement = this.speed;
        this.health = 100;
        this.maxHealth = this.health;
    }
    update() {
        this.x -= this.movement;
    }
    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '30px Orbitron';
        ctx.fillText(Math.floor(this.health), this.x + 20, this.y + 30);
    }
}

// ham xu ly ke thu 
function handleEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
        enemies[i].draw();
        if (enemies[i].x < 0) {
            gameOver = true;
        }
        if (enemies[i].health <= 0) {
            let gainedResources = enemies[i].maxHealth / 10; //tai nguyen thu duoc
            numberOfResources += gainedResources
            score += gainedResources;
            const findThisIndex = enemyPositions.indexOf(enemies[i].y); //tra ve vi tri cua ke thu thu i
            enemyPositions.splice(findThisIndex, 1);
            // enemyPositions.push(verticalPosition);
            enemies.splice(i, 1);
            i--;
            // console.log(enemyPositions);
        }
    }
    if (frame % enemiesInterval === 0 && score < winningScore) {
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap; //doc ngau nhien 100-500
        enemies.push(new Enemy(verticalPosition));
        enemyPositions.push(verticalPosition); //them mang vi tri ke thu
        if (enemiesInterval > 120) enemiesInterval -= 50;
        // console.log(enemyPositions);
    }
}
//!//!//!//!//!//!//!//!//!//!//!//! end

//?ham tai nguyen de dung mua defenders (resources)
const amounts = [20, 30, 40];
class Resource {
    constructor() {
        this.x = Math.random() * (canvas.width - cellSize);
        this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
        this.width = cellSize * 0.6;
        this.height = cellSize * 0.6;
        this.amount = amounts[Math.floor(Math.random() * amounts.length)];
    }
    draw() {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Orbitron';
        ctx.fillText(this.amount, this.x, this.x + 15, this.y + 25);
    }
}

function handleResources() {
    if (frame % 500 === 0 && score < winningScore) {
        resources.push(new Resource());
    }
    for (let i = 0; i < resources.length; i++) {
        resources[i].draw();
        if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)) {
            numberOfResources += resources[i].amount;
            resources.splice(i, 1);
            i--;
        }
    }
}
//?//?//?//?//?//?//?//?//?//?//?//?//?//?//?end

// ham xu ly trang thai tai nguyen(ultilities)
function handleGameStatus() {
    ctx.fillStyle = 'black';
    ctx.font = '30px Orbitron';
    ctx.fillText('Resources: ' + numberOfResources, 11, 45);
    ctx.fillText('Score: ' + score, 11, 80);
    if (gameOver) {
        // ctx.fillStyle = 'yellow'
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '90px Orbitron';
        ctx.fillText('Game Over', 150, 300);
    }
    if (score >= winningScore && enemies.length === 0) { //xu ly khi win
        ctx.fillStyle = 'red';
        ctx.font = '60px Orbitron';
        ctx.fillText('Level Complete', 141, 300);
        ctx.font = '30px Orbitron';
        ctx.fillText('You win with ' + score + ' points!', 150, 340);
    }
}

//ham hoat dong game
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // xoa doi tuong cu khi chuot di qua
    ctx.fillStyle = 'yellow';
    ctx.fillRect(0, 0, controlBar.width, controlBar.height);
    handleGameGrid();
    handlesDefenders();
    handleResources();
    handleProjectiles();
    handleEnemies();
    handleGameStatus();
    // ctx.fillText('Resources: ' + numberOfResources, 11, 55)
    frame++;
    if (!gameOver)
        requestAnimationFrame(animate); //ham de quy, dam bao hoat anh chay di chay lai
}
animate();

//ham va cham
function collision(first, second) {
    if (!(first.x > second.x + second.width ||
            first.x + first.width < second.x ||
            first.y > second.y + second.height ||
            first.y + first.height < second.y)) {
        return true;
    };
};

//* trinh xu ly su kien vi tri di chuot tren trinh duyet
window.addEventListener('resize', function () {
    canvasPosition = canvas.getBoundingClientRect();
});