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
  pawn = 'P',
  knight = 'N',
  bishop = 'B',
  rook = 'R',
  queen = 'Q',
  king = 'K'
}

export const pieceMap = new Map<Piece, string>();
pieceMap.set(Piece.pawn, 'pawn_asm_c.gltf');
pieceMap.set(Piece.knight, 'knight_asm_c.gltf');
pieceMap.set(Piece.bishop, 'bishop_asm_c.gltf');
pieceMap.set(Piece.rook, 'rook_asm_c.gltf');
pieceMap.set(Piece.queen, 'queen_asm_c.gltf');
pieceMap.set(Piece.king, 'king_asm_c.gltf');

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
  ['K', Piece.king],
  ['Q', Piece.queen],
  ['P', Piece.pawn],
  ['R', Piece.rook],
  ['B', Piece.bishop],
  ['N', Piece.knight],
]);
