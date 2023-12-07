import React from 'react';
import './Board.css';

const ballRadius = 10;
const paddleWidth = 15;
const paddleHeight = 70;
const paddleMargin = 30;
const ballColor = "rgb(255,0,255)";
const player1Color = "rgb(255,0,0)";
const player2Color = "rgb(0,0,255)";

export default class Board extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			raf: 0,
		}
	}

	updateBallVelocity = (ball, theta) => {
		var v = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
		v *= 1.02;
		ball.vx = v * Math.cos(theta);
		ball.vy = v * Math.sin(theta);
	};

	updateBall = (ball, player1, player2, canvas) => {
		let oldX = ball.x;
		let oldy = ball.y;
		ball.x += ball.vx;
		ball.y += ball.vy;
		if (ball.x - ballRadius < paddleMargin + paddleWidth
			&& oldX - ballRadius > paddleMargin
			&& ball.y + ballRadius >= player1.y
			&& ball.y - ballRadius <= player1.y + paddleHeight) {
			this.props.ballTouched("1");
			if (Math.abs(ball.vy) < 0.001)
				ball.vy = 3;
			this.updateBallVelocity(ball, (ball.y - player1.y - paddleHeight / 2) / (paddleHeight + ballRadius) * Math.PI / 2);
			ball.x += ball.vx;
			ball.y += ball.vy;
		}
		if (ball.x + ballRadius > canvas.width - paddleMargin - paddleWidth
			&& oldX + ballRadius < canvas.width - paddleMargin
			&& ball.y + ballRadius >= player2.y
			&& ball.y - ballRadius <= player2.y + paddleHeight) {
			this.props.ballTouched("2");
			if (Math.abs(ball.vy) < 0.001)
				ball.vy = 3;
			this.updateBallVelocity(ball, Math.PI - (ball.y - player2.y - paddleHeight / 2) / (paddleHeight + ballRadius) * Math.PI / 2);
			ball.x += ball.vx;
			ball.y += ball.vy;
		}
		if (ball.x + ballRadius > canvas.width) {
			this.props.ballOut("2");
			ball.x = canvas.width / 2;
			ball.y = canvas.height / 2;
//			ball.vx = 2 + Math.random();
//			ball.vy = 0;
//			this.updateBallVelocity(ball, (Math.random() - 0.5) * Math.PI * 3 / 4 + Math.PI);
			ball.vx = 2;
			ball.vy = 0;
			this.updateBallVelocity(ball, Math.PI);
		}
		if (ball.x + ballRadius < 0) {
			this.props.ballOut("1");
			ball.x = canvas.width / 2;
			ball.y = canvas.height / 2;
//			ball.vx = 2 + Math.random();
//			ball.vy = 0;
//			this.updateBallVelocity(ball, (Math.random() - 0.5) * Math.PI * 3 / 4);
			ball.vx = 2;
			ball.vy = 0;
			this.updateBallVelocity(ball, 0);
		}
		if (ball.y - ballRadius < 0) {
			ball.y = 2 * ballRadius - ball.y;
			ball.vy = -ball.vy;
			ball.vx += 0.1 * Math.sign(ball.vx);
			ball.vy += 0.1 * Math.sign(ball.vy);
		}
		if (ball.y + ballRadius > canvas.height) {
			ball.y = 2 * (canvas.height - ballRadius) - ball.y;
			ball.vy = -ball.vy;
			ball.vx += 0.1 * Math.sign(ball.vx);
			ball.vy += 0.1 * Math.sign(ball.vy);
		}
	};

	updatePaddle = (player, canvas) => {
		player.y += player.vy;
		if (player.y < 0) {
			player.y = 0;
			player.vy = 0;
		}
		if (player.y + paddleHeight > canvas.height) {
			player.y = canvas.height - paddleHeight;
			player.vy = 0;
		}
	};

	update = (canvas) => {
		this.updateBall(this.props.ball, this.props.player1, this.props.player2, canvas);
		this.updatePaddle(this.props.player1, canvas);
		this.updatePaddle(this.props.player2, canvas);
	};

	drawBall = (ball, ctx) => {
		const theta = Math.atan2(-ball.vy, -ball.vx);
		const v = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
		const drag = ballRadius + 3 * v;
		const gradient = ctx.createRadialGradient(0, 0, ballRadius / 2, 0, 0, drag);
		gradient.addColorStop(0, `rgba(255, 100, 255, ${0.5 * v * v / (200 + v * v) + 0.5 * v / (50 + v)})`);
		gradient.addColorStop(1, "rgba(255, 100, 255, 0)");

		ctx.translate(ball.x, ball.y);
		ctx.rotate(theta);
		ctx.fillStyle = gradient;
		ctx.fillRect(0, -ballRadius, drag, 2 * ballRadius);
		ctx.setTransform(1, 0, 0, 1, 0, 0);

		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ballRadius, 0, 2 * Math.PI, true);
		ctx.closePath();
		ctx.fillStyle = ballColor;
		ctx.fill();
	};

	drawPaddle = (player, ctx, canvas) => {
		if (player.position === 0) {
			ctx.translate(paddleMargin, 0);
			ctx.fillStyle = player1Color;
		}
		else {
			ctx.translate(canvas.width - paddleMargin - paddleWidth, 0);
			ctx.fillStyle = player2Color;
		}
		ctx.fillRect(0, player.y, paddleWidth, paddleHeight);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
	};

	refresh = (ball, ctx, canvas) => {
		const v = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
		ctx.fillStyle = `rgba(0, 255, 0, ${1 - v / (500 + v)})`;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	};

	draw = (ctx, canvas) => {
		this.refresh(this.props.ball, ctx, canvas);
		this.drawBall(this.props.ball, ctx);
		this.drawPaddle(this.props.player1, ctx, canvas);
		this.drawPaddle(this.props.player2, ctx, canvas);
	};

	renderUpdate = () => {
		const canvas = document.getElementById("BoardCanvas");
		const ctx = canvas.getContext("2d");

		this.update(canvas);
		this.draw(ctx, canvas);
		this.state.raf = window.requestAnimationFrame(this.renderUpdate);
	};

	componentDidMount() {
		this.renderUpdate();
	}

	componentWillUnmount() {
	}

	render() {
		return (
			<canvas id="BoardCanvas" width="600" height="300">
			</canvas>
		);
	}
}
