import { Injectable } from '@angular/core';
import { IPiece } from './piece/piece.component';
import { COLS, ROWS, POINTS } from './constants';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  public valid(p: IPiece, board: number[][]): boolean {
    return p.shape.every((row, dy) => {
      return row.every((value, dx) => {
        const x = p.x + dx;
        const y = p.y + dy;
        return (
          this.isEmpty(value) ||
          (this.insideWalls(x) &&
            this.aboveFloor(y) &&
            this.notOccupied(board, x, y))
        );
      });
    });
  }

  public isEmpty(value: number): boolean {
    return value === 0;
  }

  public insideWalls(x: number): boolean {
    return x >= 0 && x < COLS;
  }

  public aboveFloor(y: number): boolean {
    return y <= ROWS;
  }

  public notOccupied(board: number[][], x: number, y: number): boolean {
    return board[y] && board[y][x] === 0;
  }

  rotate(piece: IPiece): IPiece {
    let p: IPiece = JSON.parse(JSON.stringify(piece));
    for (let y = 0; y < p.shape.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]];
      }
    }
    p.shape.forEach(row => row.reverse());
    return p;
  }

  public getLinesClearedPoints(lines: number): number {
    return lines === 1
        ? POINTS.SINGLE
        : lines === 2
        ? POINTS.DOUBLE
        : lines === 3
        ? POINTS.TRIPLE
        : lines === 4
        ? POINTS.TETRIS
        : 0;
  }

}
