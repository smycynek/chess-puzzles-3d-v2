/* eslint-disable no-throw-literal */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-throw-literal */
import { fileSymbolMap, PieceColor, pieceSymbolMap } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseSquareString = (position: string): any => {
  if (position.length !== 4) {
    throw (`Error, bad position string ${position}`);
  }
  const colorChar = position[0];
  const unitChar = position[1];
  const fileChar = position[2];
  const rankChar = position[3];

  const color = colorChar === 'w' ? PieceColor.White : PieceColor.Black;
  const piece = pieceSymbolMap.get(unitChar);
  if (!piece) {
    throw ('Error, bad piece notation');
  }
  const file = fileSymbolMap.get(fileChar);
  if (!file) {
    throw ('Error, bad file notation');
  }
  const rank = Number(rankChar);
  if (rank < 1 || rank > 8) {
    throw ('Error, bad rank notation');
  }

  return {
    color,
    piece,
    file,
    rank,
  };
};
