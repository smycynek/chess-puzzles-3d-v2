/* eslint-disable max-len */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rot13Cipher = require('rot13-cipher');

export const puzzleData: Array<unknown> = [
  {
    question: 'White to move:',
    answer: rot13Cipher('Nf6#'),
    data: 'wKh1,bBc1,bBd1,wPg2,wPh2,wNe4,bPd5,bPc6,bPb6,wRg6,wPg7,bPf7,bPh7,bQb7,wRe7,bRa8,bRb8,bKg8',
    index: '0',
  },
  {
    question: 'Explain who will likely win if white is to move.  If Black is to move?',
    answer: rot13Cipher("If white is to move, the black king will not catch up to the white pawn before it promotes.  If black is to move, it can catch up (rule of squares).  It's possible white could still win if black is to move, but it's highly unlikely."),
    data: 'wKh1,wPd3,bPd4,bPf4,bKa5,wPc6',
    index: '1',
  },
  {
    question: 'White to move -- any ideas?',
    answer: rot13Cipher('Bc3+ -- skewers the black king and allows for a queen capture.'),
    data: 'wKh1,wBf1,wPg2,wPh2,bNb2,bNb3,bPc4,wBa5,wNg5,wPb6,wRh6,bKg7,bPh7,bBf7,bBa7,wPb7,bQh8',
    index: '2',
  },
  {
    question: 'What might be a good move for white?',
    answer: rot13Cipher('Bg5+. This draws the king away from the black rook, allowing the white rook to capture it safely.'),
    data: 'wKh1,wNg3,bNe3,bBh5,wBf6,bKh6,bPg6,bRh7,wRa7',
    index: '3',
  },
  {
    question: 'Black to move and win:',
    answer: rot13Cipher('f1=N#'),
    data: 'wNg1,wQh1,wKh2,bBg2,bPf2,bRg3,wBc3,bKh4,wRg5,wPc5,wNh5,wRg6,wPb6,bBe7',
    view: 'b',
    index: '4',
  },
  {
    question: 'Black to mate in 2',
    answer: rot13Cipher('Nxf2+..Kg1,Ne2#, OR Nxf2+..Kg1, hRg5#'),
    data: 'wKh1,wNf1,wRa1,wPh2,wBf2,bPa2,bBh3,bNg4,bNd4,bRh5,wQg5,bRf6,bPc7,bPb7,wBh7,bKc8',
    editMode: 'true',
    view: 'b',
    index: '5',
  },
  {
    question: 'Should white promote to queen on c?',
    answer: rot13Cipher('No!  Black can immediately capture.  Try Nb6# instead.'),
    data: 'wKh1,wRb1,wPg2,wPf2,bBh3,wNc4,bPh4,wBe5,wPc6,wPc7,bNa7,bKa8,bBh8',
    editMode: 'false',
    view: 'w',
    index: '6',
  },
  {
    question: 'Can white check?',
    answer: rot13Cipher('No -- the black rook pins the white rook.'),
    data: 'wKh1,wRd1,bRa1,wPf2,wPg2,wPh2,bPh7,bPg7,bPf7,bKh8',
    view: 'w',
    index: '7',
  },
  {
    question: 'White to move: Can white mate? How? (This one is not mine.  It is from *Bobby Fischer Teaches Chess*).',
    answer: rot13Cipher('Yes. (Qxg7...Rxg7,Rb8+...Rg8, g7#)'),
    data: 'bRg8,bKh8,bPc7,bPg7,bPh7,bPa6,bPc6,wPg6,bPd5,wNf5,wPh5,wPa4,wPe4,bQf4,wPd3,bBe3,wQb2,wPg2,wRb1,wKh1',
    view: 'w',
  },
  {
    view: 'b',
    data: 'wKa1,bKh8,bBc4,bBd5',
    question: 'Here is an easy one to start.  Can black win?',
    answer: rot13Cipher('No.  It is a draw, although if black could convince white into resigning, there could be a possible win.'),
  },
];
