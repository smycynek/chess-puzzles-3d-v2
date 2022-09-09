/* eslint-disable no-shadow */
export enum PieceColor {
  White = 1,
  Black = 2,
}

export enum BoardFile {
  a = 1,
  b = 2,
  c = 3,
  d = 4,
  e = 5,
  f = 6,
  g = 7,
  h = 8
}

export enum Piece {
  Pawn = 'P',
  Knight = 'N',
  Bishop = 'B',
  Rook = 'R',
  Queen = 'Q',
  King = 'K'
}

export const pieceMap = new Map<Piece, string>();
pieceMap.set(Piece.Pawn, 'pawn_asm_c.gltf');
pieceMap.set(Piece.Knight, 'knight_asm_c.gltf');
pieceMap.set(Piece.Bishop, 'bishop_asm_c.gltf');
pieceMap.set(Piece.Rook, 'rook_asm_c.gltf');
pieceMap.set(Piece.Queen, 'queen_asm_c.gltf');
pieceMap.set(Piece.King, 'king_asm_c.gltf');

export const fileSymbolMap: Map<string, BoardFile> = new Map<string, BoardFile>([
  ['a', BoardFile.a],
  ['b', BoardFile.b],
  ['c', BoardFile.c],
  ['d', BoardFile.d],
  ['e', BoardFile.e],
  ['f', BoardFile.f],
  ['g', BoardFile.g],
  ['h', BoardFile.h]]);

export const pieceSymbolMap = new Map<string, Piece>([
  ['K', Piece.King],
  ['Q', Piece.Queen],
  ['P', Piece.Pawn],
  ['R', Piece.Rook],
  ['B', Piece.Bishop],
  ['N', Piece.Knight],
]);

export interface Assignment {
  color: PieceColor;
  piece: Piece;
  file: BoardFile;
  rank: number;
}

// todo, use lower case, iterate for annotation loading
export const annotations = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', '1', '2', '3', '4', '5', '6', '7', '8'];
