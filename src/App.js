// src/App.js
import React, { useEffect, useState } from 'react';
import './App.css';
import confetti from 'canvas-confetti';

const width = 10;
const bombsAmount = 20;
let score = 0
let losses = 0

function App() {
  const [squares, setSquares] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [flags, setFlags] = useState(0);

  useEffect(() => {
    createBoard();
  }, []);

  const createBoard = () => {

    setIsGameOver(false);
    setFlags(0);

    const bombsArray = Array(bombsAmount).fill('bomb');
    const emptyArray = Array(width * width - bombsAmount).fill('valid');
    const gameArray = [...emptyArray, ...bombsArray].sort(() => Math.random() - 0.5);

    const newSquares = gameArray.map((type, i) => {
      return {
        id: i,
        type,
        isChecked: false,
        isFlagged: false,
        data: 0,
        content: ''
      };
    });

    // calculate adjacent bombs
    // buggy logic for counting bomb neighbors
    // for (let i = 0; i < newSquares.length; i++) {
    //   const isLeftEdge = i % width === 0;
    //   const isRightEdge = i % width === width - 1;
    //   let total = 0;
    //   if (newSquares[i].type === 'valid') {
    //     if (i > 0 && !isLeftEdge && newSquares[i - 1].type === 'bomb') total++;
    //     if (i > 9 && !isRightEdge && newSquares[i + 1 - width].type === 'bomb') total++;
    //     if (i > 10 && newSquares[i - width].type === 'bomb') total++;
    //     if (i > 11 && !isLeftEdge && newSquares[i - 1 - width].type === 'bomb') total++;
    //     if (i < 98 && !isRightEdge && newSquares[i + 1].type === 'bomb') total++;
    //     if (i < 90 && !isLeftEdge && newSquares[i - 1 + width].type === 'bomb') total++;
    //     if (i < 88 && !isRightEdge && newSquares[i + 1 + width].type === 'bomb') total++;
    //     if (i < 89 && newSquares[i + width].type === 'bomb') total++;
    //   }
    //   newSquares[i].data = total;
    // }
    const directions = [
      -1, 1, -width, width,
      -1 - width, 1 - width,
      -1 + width, 1 + width
    ];

    for (let i = 0; i < newSquares.length; i++) {
      if (newSquares[i].type === 'valid') {
        let total = 0;
        const isLeftEdge = i % width === 0;
        const isRightEdge = i % width === width - 1;

        directions.forEach(offset => {
          const neighborIdx = i + offset;

          // Skip out-of-bounds neighbors
          if (neighborIdx < 0 || neighborIdx >= width * width) return;

          // Prevent wrapping across rows
          if (
            (isLeftEdge && (offset === -1 || offset === -1 - width || offset === -1 + width)) ||
            (isRightEdge && (offset === 1 || offset === 1 - width || offset === 1 + width))
          ) return;

          if (newSquares[neighborIdx].type === 'bomb') {
            total++;
          }
        });
        console.log(`Square ${i}: ${total} bombs nearby`);
        newSquares[i].data = total;
      }
    }


    setSquares(newSquares);
  };

  const handleLeftClick = (id) => {
    if (isGameOver) return;
    const updated = [...squares];
    const square = updated[id];
    if (square.isChecked || square.isFlagged) return;

    if (square.type === 'bomb') {
      square.content = '💣';
      setIsGameOver(true);
      revealBombs(updated);
      losses ++
    } else {
      square.isChecked = true;
      square.content = square.data !== 0 ? square.data : '';
      setSquares(updated);
      if (square.data === 0) checkNeighbors(id, updated);
    }
  };

  const handleRightClick = (e, id) => {
    e.preventDefault();
    if (isGameOver) return;
    const updated = [...squares];
    const square = updated[id];
    if (!square.isChecked) {
      square.isFlagged = !square.isFlagged;
      square.content = square.isFlagged ? '🚩' : '';
      setFlags(square.isFlagged ? flags + 1 : flags - 1);
      setSquares(updated);
      checkForWin(updated);
    }
  };

  const checkNeighbors = (id, board) => {
    const isLeftEdge = id % width === 0;
    const isRightEdge = id % width === width - 1;

    const neighborIndices = [
      id - 1,
      id + 1,
      id - width,
      id + width,
      id - 1 - width,
      id + 1 - width,
      id - 1 + width,
      id + 1 + width
    ];

    neighborIndices.forEach(newId => {
      if (newId >= 0 && newId < width * width) {
        const neighbor = board[newId];
        if (!neighbor.isChecked && neighbor.type === 'valid') {
          neighbor.isChecked = true;
          neighbor.content = neighbor.data !== 0 ? neighbor.data : '';
          setSquares([...board]);
          if (neighbor.data === 0) checkNeighbors(newId, board);
        }
      }
    });
  };

  const revealBombs = (board) => {
    board.forEach(square => {
      if (square.type === 'bomb') {
        square.content = '💣';
      }
    });
    setIsGameOver(true);
    setSquares([...board]);
    alert('You Lost!');
  };

  const checkForWin = (board) => {
    let match = 0;
    board.forEach(square => {
      if (square.isFlagged && square.type === 'bomb') match++;
    });
    if (match === bombsAmount) {
      alert('🎉 You Win!');
      confetti()
      setIsGameOver(true);
      score ++
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="text-center">
        <h1 className="mb-4">MindSweeper</h1>

        <div className="grid mb-4 mx-auto">
          {squares.map((sq, i) => (
            <div
              key={i}
              id={sq.id}
              className={`square ${sq.type} ${sq.isChecked ? 'checked' : ''}`}
              onClick={() => handleLeftClick(i)}
              onContextMenu={(e) => handleRightClick(e, i)}
            >
              {sq.content}
            </div>
          ))}
        </div>

        <button className="btn btn-success px-4 py-2" onClick={createBoard}>
          Play Again
        </button>
        <h2>Score: {score} Loses: {losses}</h2>
      </div>
    </div>
  );

}

export default App;
