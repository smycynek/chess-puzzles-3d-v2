/* eslint-disable dot-notation */
/* eslint-disable prefer-destructuring */
import { Params } from '@angular/router';
import { base2dUrl } from './constants';
import { Assignment, fileSymbolMap, PieceColor, pieceSymbolMap } from './types';

const headline = 'Try%20this%20chess%20puzzle.';
const twitterBase = 'http://twitter.com/share?text=';

export const parseSquareString = (position: string): Assignment => {
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

export function radians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function getOrbitCoords(scale: number, degrees: number): [number, number, number] {
  return [scale * Math.cos(radians(degrees)),
    0.35,
    scale * Math.sin(radians(degrees))];
}

export function getTwitterUrlImp(): string {
  const fullStr = encodeURIComponent(window.location.toString());
  return `${twitterBase}${headline}&url=${fullStr}&hashtags=chesspuzzle`;
}

export function getEmailUrlImp(): string {
  const fullStr = encodeURIComponent(window.location.toString());
  return `mailto:?subject=${headline}&body=${fullStr}`;
}

export function getSmsUrlImp(): string {
  const fullStr = encodeURIComponent(window.location.toString());
  return `sms:&body=${headline}%20${fullStr}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getReverseQuery(params: Params): string {
  const base = `${base2dUrl}#/chess/create/sknsk?`;
  const data = params['data'];
  const question = params['question'];
  const answer = params['answer'];
  const view = params['view'];
  const dataParam = data ? `data=${encodeURIComponent(data)}` : '';
  const questionParam = question ? `&question=${encodeURIComponent(question)}` : '';
  const answerParam = answer ? `&answer=${encodeURIComponent(answer)}` : '';
  const editModeParam = '&editMode=true';
  const viewParam = `&view=${view}`;
  return `${base}${dataParam}${questionParam}${answerParam}${editModeParam}${viewParam}`;
}
