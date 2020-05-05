import { GameService } from './../game.service';
import { PieceComponent, IPiece } from './../piece/piece.component';
import { BLOCK_SIZE, ROWS, COLS, COLORSDARKER, COLORSLIGHTER, KEY, COLORS, POINTS, LEVEL, LINES_PER_LEVEL } from '../constants';
import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { RouterEvent } from '@angular/router';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-game-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  // Get reference to the canvas
  @ViewChild('board')
  canvas: ElementRef<HTMLCanvasElement>;
  board: number[][];
  @ViewChild('next')
  canvasNext: ElementRef<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D;
  ctxNext: CanvasRenderingContext2D;
  piece: PieceComponent;
  next: PieceComponent;
  points: number = 0;
  lines: number = 0;
  level: number = 0;
  gameStarted: boolean;
  paused: boolean;
  highScore: number;
  requestId: number;
  time: { start: number; elapsed: number; level: number };
  moves = {
    [KEY.LEFT]: (p: IPiece): IPiece => ({ ...p, x: p.x - 1 }),
    [KEY.RIGHT]: (p: IPiece): IPiece => ({ ...p, x: p.x + 1 }),
    [KEY.DOWN]: (p: IPiece): IPiece => ({ ...p, y: p.y + 1 }),
    [KEY.SPACE]: (p: IPiece): IPiece => ({ ...p, y: p.y + 1 }),
    [KEY.UP]: (p: IPiece): IPiece => this.service.rotate(p),
  };

  constructor(private service: GameService) {}

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === KEY.ESC) {
      this.pause();
    } else if (this.moves[event.keyCode]) {
      // If the keyCode exists in our moves stop the event from bubbling.
      event.preventDefault();
      const keyCode = event.keyCode;
      // Get the next state of the piece.
      let p = this.moves[keyCode](this.piece);

      if (event.keyCode === KEY.SPACE) {
        // Hard drop
        while (this.service.valid(p, this.board)) {
          this.points += POINTS.HARD_DROP; // Give points for a drop
          this.piece.move(p);
          p = this.moves[KEY.DOWN](this.piece);
        }
      } else if (this.service.valid(p, this.board)) {
        this.piece.move(p);
        if (event.keyCode === KEY.DOWN) {
          this.points += POINTS.SOFT_DROP;
        }
      }

      // Clear the old position before drawing.
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

      // Draw the new position.
      this.piece.draw();
    }
  }

  ngOnInit() {
    this.initBoard();
    this.initNext();
    this.resetGame();
    this.highScore = 0;
    this.time = { start: 0, elapsed: 0, level: 1000 };
  }

  public getEmptyBoard(): number[][] {
    return Array.from({ length: ROWS },
      () => Array(COLS).fill(0));
  }

  public initBoard(): void {
    // Get the 2D context that we draw on.
    this.ctx = this.canvas.nativeElement.getContext('2d');

    // Calculate size of canvas from constants.
    this.ctx.canvas.width = COLS * BLOCK_SIZE;
    this.ctx.canvas.height = ROWS * BLOCK_SIZE;

    // scale so we don't need to give size on every draw.
    this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
  }

  initNext() {
    this.ctxNext = this.canvasNext.nativeElement.getContext('2d');

    // Calculate size of canvas from constants.
    // The + 2 is to allow for space to add the drop shadow to
    // the "next piece"
    this.ctxNext.canvas.width = 4 * BLOCK_SIZE + 2;
    this.ctxNext.canvas.height = 4 * BLOCK_SIZE;

    this.ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);
  }

  // create and draw piece
  public play(): void {
    this.gameStarted = true;
    this.resetGame();
    this.next = new PieceComponent(this.ctx);
    this.piece = new PieceComponent(this.ctx);
    this.next.drawNext(this.ctxNext);
    this.time.start = performance.now();
    // this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    // this.piece.draw();

    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
    }

    this.animate();
    console.table(this.board);
  }

  public pause(): void {
    if (this.gameStarted) {
      if (this.paused) {
        this.animate();
      } else {
        this.ctx.font = '1px Arial';
        this.ctx.fillStyle = 'black';
        this.ctx.fillText('GAME PAUSED', 1.4, 4);
        cancelAnimationFrame(this.requestId);
      }
      this.paused = !this.paused;
    }
  }

  public resetGame(): void {
    this.points = 0;
    this.lines = 0;
    this.level = 0;
    this.board = this.getEmptyBoard();
    this.time = { start: 0, elapsed: 0, level: LEVEL[this.level] };
    this.paused = false;
    this.addOutLines();
  }

  public animate(now: number = 0): void {
    // update elapsed time
    this.time.elapsed = now - this.time.start;
    // if elapsed time has passed time for current level
    if (this.time.elapsed > this.time.level) {
      // reset start time
      this.time.start = now;
      if (!this.drop()) {
        this.gameOver();
        return;
      }
    }
    this.draw();
    this.requestId = requestAnimationFrame(this.animate.bind(this));
  }

  public drop(): boolean {
    let p = this.moves[KEY.DOWN](this.piece);
    if (this.service.valid(p, this.board)) {
      this.piece.move(p);
    } else {
      this.freeze();
      this.clearLines();
      if (this.piece.y === 0) {
        console.log(`piece === 0`);
        // game over
        return false;
      }
      // spawn new piece and update upcoming piece
      this.piece = this.next;
      this.next = new PieceComponent(this.ctx);
      this.next.drawNext(this.ctxNext);
    }
    return true;
  }

  public gameOver(): void {
    this.gameStarted = false;
    cancelAnimationFrame(this.requestId);
    this.highScore = this.points > this.highScore ? this.points : this.highScore;
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(1, 3, 8, 1.2);
    this.ctx.font = '1px Arial';
    this.ctx.fillStyle = 'red';
    this.ctx.fillText('GAME OVER', 1.8, 4);
  }

  public clearLines(): void {
    let lines = 0;
    this.board.forEach((row, y) => {
      // If every value is greater than 0.
      if (row.every(value => value > 0)) {
        lines++; // increase for cleared line
        // Remove the row.
        this.board.splice(y, 1);
        // Add a zero filled at the top.
        this.board.unshift(Array(COLS).fill(0));
      }
    });
    if (lines > 0) {
      // calculate points from cleared lines and levels
      this.points += this.service.getLinesClearedPoints(lines, this.level);
      this.lines += lines;

      if (this.lines >= LINES_PER_LEVEL) {
        this.level++;
        this.lines -= LINES_PER_LEVEL; // reset lines
        this.time.level = LEVEL[this.level];
      }
    }
  }



  public draw(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.piece.draw();
    this.drawBoard();
  }

  // merges blocks to the board when at bottom
  public freeze(): void {
    this.piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.board[y + this.piece.y][x + this.piece.x] = value;
        }
      });
    });
  }

  public drawBoard(): void {
    this.board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctx.fillStyle = COLORS[value];
          this.ctx.fillRect(x, y, 1, 1);
          //this.add3D(x, y, value);
        }
      });
    });
    this.addOutLines();
  }

  private addOutLines(): void {
    for (let index = 1; index < COLS; index++) {
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(index, 0, .025, this.ctx.canvas.height);
    }

    for (let index = 1; index < ROWS; index++) {
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, index, this.ctx.canvas.width, .025);
    }
  }

  private add3D(x: number, y: number, color: number): void {
    //Darker Color
    this.ctx.fillStyle = COLORSDARKER[color];
    // Vertical
    this.ctx.fillRect(x + .9, y, .1, 1);
    // Horizontal
    this.ctx.fillRect(x, y + .9, 1, .1);

    //Darker Color - Inner
    // Vertical
    this.ctx.fillRect(x + .65, y + .3, .05, .3);
    // Horizontal
    this.ctx.fillRect(x + .3, y + .6, .4, .05);

    // Lighter Color - Outer
    this.ctx.fillStyle = COLORSLIGHTER[color];

    // Lighter Color - Inner
    // Vertical
    this.ctx.fillRect(x + .3, y + .3, .05, .3);
    // Horizontal
    this.ctx.fillRect(x + .3, y + .3, .4, .05);

    // Lighter Color - Outer
    // Vertical
    this.ctx.fillRect(x, y, .05, 1);
    this.ctx.fillRect(x, y, .1, .95);
    // Horizontal
    this.ctx.fillRect(x, y, 1 , .05);
    this.ctx.fillRect(x, y, .95, .1);
  }

}
