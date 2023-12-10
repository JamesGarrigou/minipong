import React from 'react';
import { board, paddle } from '../../shared/config/pong.config.ts';
import './Board.css';

/* DVD logo color palette*/
const colors = [
	'#7682EB',
	'#809C9D',
	'#D3D591',
	'#B8A377',
	'#7EAC8A',
	'#A3BEE5',
	'#AB7594',
	'#BB8577',
	'#5F985F',
	'#B0A796'
];

/*DVD logo previous color*/
let previousColor = null;

export default class Board extends React.Component {
	constructor(props) {
		super(props);
		var raf;
	}

	norm(x, y) {
		return (Math.sqrt(x * x + y * y));
	}

	ballTouchPaddle(ball, player) {
		const	oldX = ball.x - 3 * ball.vx;
		var		boundedLeft;
		var		boundedRight;
		const	boundedUp = ball.y - ball.r <= player.y + paddle.height;
		const	boundedDown = ball.y + ball.r >= player.y

		if (player.position === 0)
			boundedLeft = oldX >= paddle.margin,
			boundedRight = ball.x - ball.r <= paddle.margin + paddle.width;
		else
			boundedLeft = ball.x + ball.r >= board.width - paddle.margin - paddle.width,
			boundedRight = oldX <= board.width - paddle.margin;
		return (boundedUp && boundedDown && boundedLeft && boundedRight);
	}

	/*DVD logo new color*/
	getRandomColor = () => {
		let randomIndex;
		do {
		  randomIndex = Math.floor(Math.random() * colors.length);
		} while (colors[randomIndex] === previousColor);
		previousColor = colors[randomIndex];
		return colors[randomIndex];
	  };

	reflectBall(ball, player) {
		var v = Math.hypot(ball.vx, ball.vy);
		const relativePos = ball.y - player.y - paddle.height / 2;
		var theta = relativePos / (paddle.height + ball.r) * Math.PI / 2;

		if (player.position === 1)
			theta = -theta + Math.PI;
		if (ball.kickoff)
			v = 4, ball.kickoff = false;
		v *= 1.02;
		ball.vx = v * Math.cos(theta);
		ball.vy = v * Math.sin(theta);
		ball.x += ball.vx;
		ball.y += ball.vy;
		ball.color = this.getRandomColor();
	}

	manageBallTouchPaddle(ball, player1, player2) {
		var theta;

		if (this.ballTouchPaddle(ball, player1)) {
			this.props.ballTouchPaddle("1");
			this.reflectBall(ball, player1);
		}
		if (this.ballTouchPaddle(ball, player2)) {
			this.props.ballTouchPaddle("2");
			this.reflectBall(ball, player2);
		}
	}

	manageBallOffLimits(ball) {
		const offLimitLeft = ball.x + ball.r < 0;
		const offLimitRight = ball.x + ball.r > board.width;
		const offLimitUp = ball.y - ball.r < 0;
		const offLimitDown = ball.y + ball.r > board.height;

		if (offLimitLeft) {
			this.props.ballOffLimit("2");
			ball.x = board.width / 2;
			ball.y = board.height / 2;
			ball.vx = 0;
			ball.vy = 0;
		}
		if (offLimitRight) {
			this.props.ballOffLimit("1");
			ball.x = board.width / 2;
			ball.y = board.height / 2;
			ball.vx = 0;
			ball.vy = 0;
		}
		if (offLimitUp) {
			ball.y = 2 * ball.r - ball.y;
			ball.vy = -ball.vy;
			ball.color = this.getRandomColor();
		}
		if (offLimitDown) {
			ball.y = 2 * (board.height - ball.r) - ball.y;
			ball.vy = -ball.vy;
			ball.color = this.getRandomColor();
		}
	}

	updateBall(ball, player1, player2) {
		ball.x += ball.vx;
		ball.y += ball.vy;
		this.manageBallTouchPaddle(ball, player1, player2);
		this.manageBallOffLimits(ball);
	}

	updatePaddle(player) {
		player.y += player.vy;
		if (player.y < 0) {
			player.y = 0;
			player.vy = 0;
		}
		if (player.y + paddle.height > board.height) {
			player.y = board.height - paddle.height;
			player.vy = 0;
		}
	}

	update() {
		this.updateBall(this.props.ball, this.props.player1, this.props.player2);
		this.updatePaddle(this.props.player1);
		this.updatePaddle(this.props.player2);
	}

	createGradientDragEffect(ball, drag, v, ctx) {
		const lowSpeedFilter = 0.5 * v * v / (200 + v * v) + 0.5 * v / (50 + v);
		const gradient = ctx.createRadialGradient(0, 0, ball.r / 2, 0, 0, drag);

		gradient.addColorStop(0, `rgba(255, 100, 255, ${lowSpeedFilter})`);
		gradient.addColorStop(1, "rgba(255, 100, 255, 0)");
		return (gradient);
	}

	// drawBall(ball, ctx) {
	// 	const theta = Math.atan2(-ball.vy, -ball.vx);
	// 	const v = this.norm(ball.vx, ball.vy);
	// 	const ballColor = "rgb(255,0,255)";
	// 	const drag = ball.r + 3 * v;
	// 	const gradient = this.createGradientDragEffect(ball, drag, v, ctx);

	// 	// Draw drag effect
	// 	ctx.translate(ball.x, ball.y);
	// 	ctx.rotate(theta);
	// 	ctx.fillStyle = gradient;
	// 	ctx.fillRect(0, -ball.r, drag, 2 * ball.r);
	// 	ctx.setTransform(1, 0, 0, 1, 0, 0);

	// 	// Draw ball
	// 	ctx.beginPath();
	// 	ctx.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI, true);
	// 	ctx.closePath();
	// 	ctx.fillStyle = ballColor;
	// 	ctx.fill();
	// }

	drawBall(ball, x, y, ctx) {
		ctx.drawImage(ball, x - ball.width / 2, y - ball.height / 2);
	}

	drawPaddle(player, ctx) {
		const player1Color = "rgb(55, 150, 255)";
		const player2Color = "rgb(175, 91, 0)";

		if (player.position === 0)
			ctx.translate(paddle.margin, 0),
			ctx.fillStyle = player1Color;
		else
			ctx.translate(board.width - paddle.margin - paddle.width, 0),
			ctx.fillStyle = player2Color;
		ctx.fillRect(0, player.y, paddle.width, paddle.height);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
	}


	clearCanvas(ball, ctx) {
		const v = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
		ctx.fillStyle = `rgba(20, 20, 20, ${1 - v / (500 + v)})`;
		ctx.fillRect(0, 0, board.width, board.height);
	}

	draw(ctx) {
		this.clearCanvas(this.props.ball, ctx);
		const svgImage = new Image();
		svgImage.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg width='153' height='69' xmlns='http://www.w3.org/2000/svg'><g><path class='logo' style="fill:${this.props.ball.color};" d='M140.186,63.52h-1.695l-0.692,5.236h-0.847l0.77-5.236h-1.693l0.076-0.694h4.158L140.186,63.52L140.186,63.52z M146.346,68.756h-0.848v-4.545l0,0l-2.389,4.545l-1-4.545l0,0l-1.462,4.545h-0.771l1.924-5.931h0.695l0.924,4.006l2.078-4.006 h0.848V68.756L146.346,68.756z M126.027,0.063H95.352c0,0-8.129,9.592-9.654,11.434c-8.064,9.715-9.523,12.32-9.779,13.02 c0.063-0.699-0.256-3.304-3.686-13.148C71.282,8.7,68.359,0.062,68.359,0.062H57.881V0L32.35,0.063H13.169l-1.97,8.131 l14.543,0.062h3.365c9.336,0,15.055,3.747,13.467,10.354c-1.717,7.24-9.91,10.416-18.545,10.416h-3.24l4.191-17.783H10.502 L4.34,37.219h20.578c15.432,0,30.168-8.13,32.709-18.608c0.508-1.906,0.443-6.67-0.764-9.527c0-0.127-0.063-0.191-0.127-0.444 c-0.064-0.063-0.127-0.509,0.127-0.571c0.128-0.062,0.383,0.189,0.445,0.254c0.127,0.317,0.19,0.57,0.19,0.57l13.083,36.965 l33.344-37.6h14.1h3.365c9.337,0,15.055,3.747,13.528,10.354c-1.778,7.24-9.972,10.416-18.608,10.416h-3.238l4.191-17.783h-14.481 l-6.159,25.976h20.576c15.434,0,30.232-8.13,32.709-18.608C152.449,8.193,141.523,0.063,126.027,0.063L126.027,0.063z M71.091,45.981c-39.123,0-70.816,4.512-70.816,10.035c0,5.59,31.693,10.034,70.816,10.034c39.121,0,70.877-4.444,70.877-10.034 C141.968,50.493,110.212,45.981,71.091,45.981L71.091,45.981z M68.55,59.573c-8.956,0-16.196-1.523-16.196-3.365 c0-1.84,7.239-3.303,16.196-3.303c8.955,0,16.195,1.463,16.195,3.303C84.745,58.05,77.505,59.573,68.55,59.573L68.55,59.573z'/></g></svg>`);
		this.drawBall(svgImage, this.props.ball.x, this.props.ball.y, ctx);
		this.drawPaddle(this.props.player1, ctx);
		this.drawPaddle(this.props.player2, ctx);
	}


	
	renderUpdate = () => {
		const canvas = document.getElementById("BoardCanvas");
		const ctx = canvas.getContext("2d");

		this.update();
		this.draw(ctx);
		this.raf = window.requestAnimationFrame(this.renderUpdate);
	};

	componentDidMount() {
		this.renderUpdate();
	}

	componentWillUnmount() {
	}

	render() {
		return (
			<canvas id="BoardCanvas" width="900" height="500">
			</canvas>
		);
	}
}
