import { COLORS, SHAPES } from './../constants';
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

    // position where the shape spawns.
    this.x = 3;
    this.y = 0;
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

  public move(p: IPiece): void {
    this.x = p.x;
    this.y = p.y;
    this.shape = p.shape;
  }

  public randomiseTetrominoType(noOfTypes: number): number {
    return Math.floor(Math.random() * noOfTypes);
  }

}
