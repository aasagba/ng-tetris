import { Injectable } from '@angular/core';
import { IPiece } from './piece/piece.component';
import { COLS, ROWS, POINTS } from './constants';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  public valid(p: IPiece, board: number[][]): boolean {
    return p.shape.every((row, y) => {
      return row.every((value, x) =>
        value === 0 ||    // Empty cell
        (p.x + x >= 0 &&  // Left wall
        p.x + x < COLS && // Right wall
        p.y + y <= ROWS)  // Bottom wall
      );
    });
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

}
