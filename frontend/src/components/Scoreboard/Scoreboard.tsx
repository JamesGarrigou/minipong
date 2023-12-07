import React from 'react';
import './Scoreboard.css';

const connectedRadius = 10;
const connectedMargin = 2;

export default class Scoreboard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			raf: 0,
		}
	}

	drawPing = (ping, ctx, canvas) => {
		ctx.beginPath();
		ctx.arc(canvas.width / 2, canvas.height / 2, connectedRadius + connectedMargin, 0, 2 * Math.PI, true);
		ctx.closePath();
		ctx.fillStyle = "rgb(20, 20, 20)";
		ctx.fill();

		ctx.beginPath();
		ctx.arc(canvas.width / 2, canvas.height / 2, connectedRadius, 0, 2 * Math.PI, true);
		ctx.closePath();
		ctx.fillStyle = ping.connected ? "rgb(200, 0, 0)" : "rgb(0, 200, 0)";
		ctx.fill();

		ctx.font = "14px serif";
		ctx.fillStyle = "grey";
		ctx.fillText(`${ping.latency}ms`.padStart(5, ' '), canvas.width / 2 - 18, canvas.height * 4 / 5);
	};

	drawScore = (player, ctx, canvas) => {
		const x = (player.position === 0) ? canvas.width / 4 : 3 * canvas.width / 4;

		ctx.font = "50px serif";
		ctx.fillStyle = "white";
		ctx.fillText(`${player.score}`, x, 25 + canvas.height / 2);
	};

	drawKeys = (ctx, canvas) => {
		ctx.font = "20px serif";
		ctx.fillStyle = "white";
		ctx.fillText("🆆", 27, 42);

		ctx.font = "20px serif";
		ctx.fillStyle = "white";
		ctx.fillText("🆂", 27, 72);

		ctx.font = "20px serif";
		ctx.fillStyle = "white";
		ctx.fillText("⬆️", canvas.width - 47, 42);

		ctx.font = "20px serif";
		ctx.fillStyle = "white";
		ctx.fillText("⬇️", canvas.width - 47, 72);
	};

	draw = () => {
		const canvas = document.getElementById("ScoreboardCanvas");
		const ctx = canvas.getContext("2d");

		ctx.fillStyle = "rgb(0, 0, 255)"
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		this.drawPing(this.props.ping, ctx, canvas);
		this.drawScore(this.props.player1, ctx, canvas);
		this.drawScore(this.props.player2, ctx, canvas);
		this.drawKeys(ctx, canvas);
		this.state.raf = window.requestAnimationFrame(this.draw);
	};

	componentDidMount() {
		this.draw();
	}

	render() {
		return (
			<canvas id="ScoreboardCanvas" width="600" height="100">
			</canvas>
		);
	}
}
