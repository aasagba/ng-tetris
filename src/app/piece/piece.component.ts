import { COLORS, SHAPES, COLORSDARKER, COLORSLIGHTER } from './../constants';
import { Component, OnInit } from '@angular/core';

export interface IPiece {
  x: number;
  y: number;
  color: string;
  shape: number[][];
}

@Component({
  selector: 'app-piece',
  templateUrl: './piece.component.html',
  styleUrls: ['./piece.component.css']
})
export class PieceComponent implements OnInit, IPiece {
  public x: number;
  public y: number;
  public color: string;
  public colorLighter: string;
  public colorDarker: string;
  public shape: number[][];

  constructor(private ctx: CanvasRenderingContext2D) {
    this.spawn();
   }

  ngOnInit() {
  }

  public spawn(): void {
    const typeId = this.randomiseTetrominoType(COLORS.length - 1);
    this.color = COLORS[typeId];
    this.shape = SHAPES[typeId];
    this.colorLighter = COLORSLIGHTER[typeId];
    this.colorDarker = COLORSDARKER[typeId];
    // position where the shape spawns.
    this.x = 3;
    this.y = 0;
  }

  private add3D(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    //Darker Color
    ctx.fillStyle = this.colorDarker;
    // Vertical
    ctx.fillRect(x + .9, y, .1, 1);
    // Horizontal
    ctx.fillRect(x, y + .9, 1, .1);

    //Darker Color - Inner
    // Vertical
    ctx.fillRect(x + .65, y + .3, .05, .3);
    // Horizontal
    ctx.fillRect(x + .3, y + .6, .4, .05);

    // Lighter Color - Outer
    ctx.fillStyle = this.colorLighter;

    // Lighter Color - Inner
    // Vertical
    ctx.fillRect(x + .3, y + .3, .05, .3);
    // Horizontal
    ctx.fillRect(x + .3, y + .3, .4, .05);

    // Lighter Color - Outer
    // Vertical
    ctx.fillRect(x, y, .05, 1);
    ctx.fillRect(x, y, .1, .95);
    // Horizontal
    ctx.fillRect(x, y, 1 , .05);
    ctx.fillRect(x, y, .95, .1);
  }

  public draw(): void {
    this.ctx.fillStyle = this.color;
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          // this.x & this.y = position on the board
          // x & y position are the positions of the shape
          this.ctx.fillRect(this.x + x, this.y + y, 1, 1);
        }
      });
    });
  }

  drawNext(ctxNext: CanvasRenderingContext2D) {
    ctxNext.clearRect(0, 0, ctxNext.canvas.width, ctxNext.canvas.height);
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          // this.addNextShadow(ctxNext, x, y);
        }
      });
    });

    ctxNext.fillStyle = this.color;
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          ctxNext.fillStyle = this.color;
          const currentX = x + .025;
          const currentY = y + .025;
          ctxNext.fillRect(currentX, currentY, 1-.025, 1 -.025);
          this.add3D(ctxNext, currentX, currentY);
        }
      });
    });
  }

  public move(p: IPiece): void {
    this.x = p.x;
    this.y = p.y;
    this.shape = p.shape;
  }

  public randomiseTetrominoType(noOfTypes: number): number {
    return Math.floor(Math.random() * noOfTypes);
  }

}
