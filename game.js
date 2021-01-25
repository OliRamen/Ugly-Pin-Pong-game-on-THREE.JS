/* ============ ВАЖНО 

    *   Сцена
    *   Рендер (отвечает за отрисовку объектов)
    *   Камера
    *   Меш (объект, состоящий из треугольников, с наложенной на них текстурой)
    *   Свет
    *   Материал

    Камера, меш и свет добавляются в сцену с помощью функции scene.add().
============ */


//размеры сцены
const WIDTH = 1040;
const HEIGHT = 560;

const fieldWidth = 400, fieldHeight = 200;

// переменные с очками каждого игрока
let score1 = 0, score2 = 0;
// игра завершится, когда кто-то наберет 7 очков
let maxScore = 7;

// сложность (0 - очень легая, 1 - самая сложная)
let difficulty = 0.2;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( WIDTH, HEIGHT );
document.body.appendChild( renderer.domElement );

//в блок gameCanvas запихиваем рендер
const canvas = document.getElementById('gameCanvas');
canvas.appendChild(renderer.domElement);

//параметры для камеры
const VIEW_ANGLE = 50,
ASPECT = WIDTH / HEIGHT,
NEAR = 0.1,
FAR = 10000;

const camera =
	  new THREE.PerspectiveCamera(
		VIEW_ANGLE,
		ASPECT,
		NEAR,
        FAR);

const scene = new THREE.Scene();

//характеристики шара
const   radius = 5,
        segments = 6,
        rings = 6;

//создаем материал сферы
const sphereMaterial = new THREE.MeshLambertMaterial(  {color: 0xD43001}   );
//создаем геометрию
const geometry = new THREE.SphereGeometry(radius, segments, rings);
//создаем шар
const ball = new THREE.Mesh(geometry, sphereMaterial);

//добавляем сферу на сцену
scene.add(ball);

camera.position.z = 320;


// создаем точечный свет
const pointLight =
new THREE.PointLight(0xF8D898);

// позиционируем
pointLight.position.x = -1000;
pointLight.position.y = 0;
pointLight.position.z = 1000;
pointLight.intensity = 2.9;
pointLight.distance = 10000;
// добавляем на сцену
scene.add(pointLight);

/* ======================== Добавляем объекты игры и рисуем плоскость для игры ======================== */
const planeMaterial = new THREE.MeshLambertMaterial({color: 0x006262});

const   planeWidth = fieldWidth,
		planeHeight = fieldHeight,
        planeQuality = 10;
        
const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight, planeQuality);

//создаем игровое поле
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

//рисуем дощечки (paddles)
const paddleWidth = 10; 
const paddleHeight = 30;
const paddleDepth = 10;
const paddleQuality = 1;

let paddle1DirY = 0, paddle2DirY = 0, paddleSpeed = 3;

//дощечка №1
const paddle1Material = new THREE.MeshLambertMaterial({color: 0x1B32C0});
const paddle1 = new THREE.Mesh(new THREE.CubeGeometry(paddleWidth, paddleHeight, paddleDepth, paddleQuality, paddleQuality), paddle1Material);
scene.add(paddle1);

//дощечка №2
const paddle2Material = new THREE.MeshLambertMaterial({color: 0xFF4045});
const paddle2 = new THREE.Mesh(new THREE.CubeGeometry(paddleWidth, paddleHeight, paddleDepth, paddleQuality, paddleQuality), paddle2Material);
scene.add(paddle2);

//размещаем доски напротив друг друга
paddle1.position.x = -fieldWidth/2 + paddleWidth;
paddle2.position.x = fieldWidth/2 - paddleWidth;
//поднимаем их над поверхностью доски
paddle1.position.z = paddleDepth;
paddle2.position.z = paddleDepth;

ball.position.z = paddleDepth;

/* ======================== ДВИЖЕНИЕ ШАРА, ОТСКОК ОТ СТЕН ======================== */
//движение шара по X, Y и его скорость пишем через let т.к. данные их будут меняться
let ballDirX = 1;
let ballDirY = 1;
let ballSpeed = 2;

function moveBall() {
   
    if (ballDirY > ballSpeed * 2)
        {
            ballDirY = ballSpeed * 2;
        }
        else if (ballDirY < -ballSpeed * 2)
        {
            ballDirY = -ballSpeed * 2;
		}   
		
	/* ======================== ОТСКОК ШАРА ======================== */
	
	// если шар двигается слева (со стороны игрока)
	if (ball.position.x <= -fieldWidth/2)
	{	
		// компьютер получает очко
		score2++;
		// обновляем таблицу с результатами
		document.getElementById("scores").innerHTML = score1 + "-" + score2;
		// устанавливаем новый шар в центр стола
		resetBall(2);
		// проверяем, закончился ли матч (набрано требуемое количество очков)
		matchScoreCheck();	
	}
	
	// если шар двигается справа (со стороны компьютера)
	if (ball.position.x >= fieldWidth/2)
	{	
		// игрок получает очко
		score1++;
		// обновляем таблицу с результатами
		document.getElementById("scores").innerHTML = score1 + "-" + score2;
		// устанавливаем новый шар в центр стола
		resetBall(1);
		// проверяем, закончился ли матч (набрано требуемое количество очков)
		matchScoreCheck();	
	}

	// Если шар двигается сверху
	if (ball.position.y <= -fieldHeight/2)
	{
		ballDirY = -ballDirY;
	}	
	// Если шар двигается снизу
	if (ball.position.y >= fieldHeight/2)
	{
		ballDirY = -ballDirY;
	}
/* ======================================================================== */
    ball.position.x += ballDirX * ballSpeed;
    ball.position.y += ballDirY * ballSpeed;
}
/* ======================================================================== */

/* ======================== УПРАВЛЕНИЕ ДОСКАМИ С КЛАВИАТУРЫ ======================== */
function playerPaddleMovement()
{
	// движение влево
	if (Key.isDown(Key.A))		
	{
		// двигаем дощечку пока она не коснется стенки
		if (paddle1.position.y < fieldHeight * 0.45)
		{
			paddle1DirY = paddleSpeed * 0.5;
		}
		// в противном случае мы прекращаем движение и растягиваем
		// дощечку чтобы показать, что дальше двигаться нельзя
		else
		{
			paddle1DirY = 0;
			paddle1.scale.z += (10 - paddle1.scale.z) * 0.2;
		}
	}	
	// движение вправо
	else if (Key.isDown(Key.D))
	{
		// двигаем дощечку пока она не коснется стенки
		if (paddle1.position.y > -fieldHeight * 0.45)
		{
			paddle1DirY = -paddleSpeed * 0.5;
		}
		// в противном случае мы прекращаем движение и растягиваем
		// дощечку чтобы показать, что дальше двигаться нельзя
		else
		{
			paddle1DirY = 0;
			paddle1.scale.z += (10 - paddle1.scale.z) * 0.2;
		}
	}
	// мы не можем дальше двигаться
	else
	{
		// прекращаем движение
		paddle1DirY = 0;
	}
	
	paddle1.scale.y += (1 - paddle1.scale.y) * 0.2;	
	paddle1.scale.z += (1 - paddle1.scale.z) * 0.2;	
	paddle1.position.y += paddle1DirY;
}
/* ======================================================================== */

/* ======================== ДВИЖЕНИЕ КОМПЬЮТЕРА ======================== */
function opponentPaddleMovement() {
	paddle2DirY = (ball.position.y - paddle2.position.y) * difficulty;

	// если функция Lerp вернет значение, которое больше скорости движения дощечки, мы ограничим его
	if (Math.abs(paddle2DirY) <= paddleSpeed)
	{	
		paddle2.position.y += paddle2DirY;
	}
	// если значение функции Lerp слишком большое, мы ограничиваем скорость paddleSpeed
	else
	{
		// если дощечка движется в положительном направлении
		if (paddle2DirY > paddleSpeed)
		{
			paddle2.position.y += paddleSpeed;
		}
		// если дощечка движется в отрицательном направлении
		else if (paddle2DirY < -paddleSpeed)
		{
			paddle2.position.y -= paddleSpeed;
		}
	}
	// Мы возвращаем значение функции Lerp обратно в 1
	// это нужно, потому что мы растягиваем дощечку в нескольких случаях:
	// когда дощечка прикасается к стенкам стола или ударяется о шарик.
	// Так мы гарантируем, что она всегда вернется к своему исходному размеру
	paddle2.scale.y += (1 - paddle2.scale.y) * 0.2;

}
/* ======================================================================== */

/* ======================== ОТСКОК ШАРА ОТ ДОСКИ ======================== */
function paddlePhysics() {
	if(ball.position.x <= paddle1.position.x + paddleWidth && ball.position.x >= paddle1.position.x){
		// если у шара одинаковые координаты с дощечкой № 1 на плоскости Y
		if (ball.position.y <= paddle1.position.y + paddleHeight/2
			&&  ball.position.y >= paddle1.position.y - paddleHeight/2)
			{
				// если шар движется к игроку (отрицательное направление)
				if (ballDirX < 0)
				{
					// растягиваем дощечку, чтобы показать столкновение
					paddle1.scale.y = 2;
					// меняем направление движения чтобы создать эффект отскакивания шара
					ballDirX = -ballDirX;
					// Меняем угол шара при ударе. Немного усложним игру, позволив скользить шарику
					ballDirY -= paddle1DirY * 0.7;
				}
			}
	}

	// если у шара одинаковые координаты с дощечкой № 2 на плоскости Y
	if(ball.position.x <= paddle2.position.x + paddleWidth && ball.position.x >= paddle2.position.x) {
		if(ball.position.y <= paddle2.position.y + paddleHeight/2 && ball.position.y >= paddle2.position.y - paddleHeight/2) {
			if(ballDirX > 0) {
				paddle2.scale.y = 2;
				ballDirX = -ballDirX;
				ballDirY -= paddle2DirY * 0.7;
			}
		}
	}
}
/* ======================================================================== */


/* ======================== ВОЗВРАЩАЕМ ШАР НА МЕСТО ПОСЛЕ ПОПАДАНИЯ В ВОРОТА ======================== */
function resetBall(loser) {
	ball.position.x = 0;
	ball.position.y = 0;

	//если проиграл ИГРОК, то шар полетит от него компьютеру
	if(loser == 1) {
		ballDirX = -1;
	} else {//если проиграл КОМП то шар полететит от него в сторону игрока
		ballDirX = 1;
	}
	ballDirY = 1;
}
/* ======================================================================== */

/* ======================== СЧЕТ ======================== */
function matchScoreCheck() {
	if(score1 >= maxScore) {
		ballSpeed = 0;
		document.getElementById('scores').innerHTML = 'Победил ИГРОК';
		document.getElementById('winnerBoard').innerHTML = 'Обновите страницу чтобы сыграть снова';
	} else if(score2 >= maxScore) {
		ballSpeed = 0;
		document.getElementById('scores').innerHTML = 'Победил КОМП';
		document.getElementById('winnerBoard').innerHTML = 'Обновите страницу чтобы сыграть снова';
	}
}
/* ======================================================================== */

function cameraPhysics() {
	camera.position.x = paddle1.position.x - 100;
	// camera.position.y += (paddle1.position.y - camera.position.y) * 0.05;
	camera.position.z = paddle1.position.z + 100 + 0.04 ;
	
	// rotate to face towards the opponent
	// camera.rotation.x = -0.01 * (ball.position.y) * Math.PI/180;
	camera.rotation.y = -60 * Math.PI/180;
	camera.rotation.z = -90 * Math.PI/180;
}



function setup() {
    draw();
}
setup();

function draw() {
   
    renderer.render(scene, camera);
    requestAnimationFrame(draw);

    moveBall();
    playerPaddleMovement();
	opponentPaddleMovement();
	paddlePhysics();
	cameraPhysics();
}