import { GameService } from './../game.service';
import { KEY } from './../constants';
import { PieceComponent, IPiece } from './../piece/piece.component';
import { BLOCK_SIZE, ROWS, COLS } from '../constants';
import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';

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
  ctx: CanvasRenderingContext2D;
  piece: PieceComponent;
  points: number = 0;
  lines: number = 0;
  level: number = 0;
  gameStarted: boolean;
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
    if (this.moves[event.keyCode]) {
      // If the keyCode exists in our moves stop the event from bubbling.
      event.preventDefault();
      const keyCode = event.keyCode;
      // Get the next state of the piece.
      let p = this.moves[keyCode](this.piece);

      if (event.keyCode === KEY.SPACE) {
        // Hard drop
        while (this.service.valid(p, this.board)) {
          this.piece.move(p);
          p = this.moves[KEY.DOWN](this.piece);
        }
      } else if (this.service.valid(p, this.board)) {
        this.piece.move(p);
      }

      // Clear the old position before drawing.
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

      // Draw the new position.
      this.piece.draw();
    }
  }

  ngOnInit() {
    this.initBoard();
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

  public play(): void {
    this.gameStarted = true;
    this.board = this.getEmptyBoard();
    this.piece = new PieceComponent(this.ctx);
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    // this.piece.draw();
    this.animate();
    console.table(this.board);
  }

  animate(now: number = 0) {
    // update elapsed time
    this.time.elapsed = now - this.time.start;
    // if elapsed time has passed time for current level
    if (this.time.elapsed > this.time.level) {
      // reset start time
      this.time.start = now;
      this.drop();
    }
    this.draw();
    requestAnimationFrame(this.animate.bind(this));
  }

  public drop(): boolean {
    let p = this.moves[KEY.DOWN](this.piece);
    if (this.service.valid(p, this.board)) {
      this.piece.move(p);
    }
    return true;
  }

  public draw(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.piece.draw();
    // this.drawBoard();
  }

}
