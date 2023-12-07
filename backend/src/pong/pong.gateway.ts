import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import {
	ServerToClientEvents,
	ClientToServerEvents,
	DataMove,
	DataUpdate,
} from '../shared/interfaces/events.interface';
import { Server, Socket } from 'socket.io'

const canvasWidth = 600;
const canvasHeight = 300;
const ballRadius = 10;
const paddleWidth = 15;
const paddleHeight = 70;
const paddleMargin = 30;

@WebSocketGateway(8001, { cors: true })
export class PongGateway {
	@WebSocketServer()
	public server: Server;
	private id = 1;
	private data: DataUpdate;

	@SubscribeMessage('ping')
	handleEvent(
		@MessageBody() n: number,
		@ConnectedSocket() client: Socket
	): void {
		client.emit('ping', n);
	}

	updateDataPlayer = (player, dt) => {
		player.y += player.vy * dt;
		if (player.y < 0) {
			player.y = 0;
			player.vy = 0;
		}
		if (player.y - paddleHeight > canvasHeight) {
			player.y = canvasHeight - paddleHeight;
			player.vy = 0;
		}
	};

	updateDataBall = (ball, dt) => {
		ball.x += ball.vx * dt;
		ball.y += ball.vy * dt;
		if (ball.y - ballRadius < 0) {
			ball.y = 2 * ballRadius - ball.y;
			ball.vy = -ball.vy;
		}
		ball.y %= 2 * canvasHeight;
		if (ball.y + ballRadius > canvasHeight) {
			ball.y = 2 * (canvasHeight - ballRadius) - ball.y;
			ball.vy = -ball.vy;
		}
	};

	updateData = (data) => {
		const dt = (new Date().getTime() - data.t.getTime()) * 60 / 1000;
		this.updateDataPlayer(data.player1, dt);
		this.updateDataPlayer(data.player2, dt);
		this.updateDataBall(data.ball, dt);
		data.t = new Date();
	};

	@SubscribeMessage('move')
	handleEventMove(
		@MessageBody() dataMove: DataMove,
		@ConnectedSocket() client: Socket
	): void {
		var newSpeed;

		if (this.id < 3)
			return ;
		this.updateData(this.data);
		if (dataMove.direction > 0)
			newSpeed = 5;
		else if (dataMove.direction < 0)
			newSpeed = -5;
		else
			newSpeed = 0;
		if (dataMove.id === "1")
			this.data.player1.vy = newSpeed;
		else
			this.data.player2.vy = newSpeed;
		this.server.emit('update', this.data);
	}

	resetBall = (ball) => {
		ball.x = canvasWidth / 2;
		ball.y = canvasHeight / 2;
		ball.vx = 0;
		ball.vy = 0;
		ball.r = 10;
	};

	@SubscribeMessage('ballOut')
	handleEventBallOut(
		@MessageBody() id: string,
		@ConnectedSocket() client: Socket
	): void {
		if (this.id < 3)
			return ;
		this.updateData(this.data);
		if (this.data.ball.x + ballRadius < 0) {
			this.data.player2.score += 1;
			this.resetBall(this.data.ball);
			this.data.ball.vx = 2;
		}
		if (this.data.ball.x - ballRadius > canvasWidth) {
			this.data.player1.score += 1;
			this.resetBall(this.data.ball);
			this.data.ball.vx = -2;
		}
		this.server.emit('update', this.data);
	}

	ballTouched = (ball, player) => {
		const oldX = ball.x - 3 * ball.vx;

		if (player.position === 0)
			return (oldX >= paddleMargin
				&& ball.x - ballRadius <= paddleMargin + paddleWidth
				&& ball.y + ballRadius >= player.y
				&& ball.y - ballRadius <= player.y + paddleHeight);
		return (oldX <= canvasWidth - paddleMargin
			&& ball.x + ballRadius >= canvasWidth - paddleMargin - paddleWidth
			&& ball.y + ballRadius >= player.y
			&& ball.y - ballRadius <= player.y + paddleHeight);
	}

	updateDataBallTouched = (ball, player) => {
		var v = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
		var theta = (ball.y - player.y - paddleHeight / 2) / (paddleHeight + ballRadius) * Math.PI / 2;

		if (!this.ballTouched(ball, player))
			return ;
		if (player.position === 1)
			theta = -theta + Math.PI;
		if (Math.abs(ball.vy) < 0.001)
			v = 4;
		v *= 1.02;
		ball.vx = v * Math.cos(theta);
		ball.vy = v * Math.sin(theta);
		ball.x += ball.vx;
		ball.y += ball.vy;
	};

	@SubscribeMessage('ballTouched')
	handleEventBallTouched(
		@MessageBody() id: string,
		@ConnectedSocket() client: Socket
	): void {
		if (this.id < 3)
			return ;
		this.updateData(this.data);
		if (id === "1")
			this.updateDataBallTouched(this.data.ball, this.data.player1);
		else
			this.updateDataBallTouched(this.data.ball, this.data.player2);
		this.server.emit('update', this.data);
	}

	@SubscribeMessage('join')
	handleEventJoin(
		@ConnectedSocket() client: Socket
	): void {
		client.emit('join', `${this.id}`);
		this.id += 1;
		if (this.id == 3)
		{
			this.data = {
				t: new Date(),
				player1: {
					score: 0,
					y: 115,
					vy: 0,
					position: 0,
				},
				player2: {
					score: 0,
					y: 115,
					vy: 0,
					position: 1,
				},
				ball: {
					x: canvasWidth / 2,
					vx: 2,
					y: canvasHeight / 2,
					vy: 0,
					r: 10,
				},
			};
			this.server.emit('update', this.data);
		}
	}
}
