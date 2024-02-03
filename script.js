import React, {
  useState,
  useCallback,
  useEffect
} from "https://cdn.skypack.dev/react@17.0.1";
import ReactDOM from "https://cdn.skypack.dev/react-dom@17.0.1";
import PropTypes from "https://cdn.skypack.dev/prop-types@15.8.1";

const DIRECTIONS = {
  ArrowLeft: { x: -1, y: 0 }, // left
  ArrowUp: { x: 0, y: -1 }, // up
  ArrowRight: { x: 1, y: 0 }, // right
  ArrowDown: { x: 0, y: 1 } // down
};

const BOARD_SIZE = 20;
const INITIAL_SPEED = 500;
const SPEED_INCREMENT = 5;

const getNextPosition = (oldPos, direction) => {
  return {
    x: oldPos.x + direction.x,
    y: oldPos.y + direction.y
  };
};

function generateApplePosition(snake) {
  let applePosition = generateRandomPosition();
  while (isPositionOnSnake(applePosition, snake)) {
    applePosition = generateRandomPosition();
  }
  return applePosition;
}

function isPositionOnSnake(position, snake) {
  return snake.some(
    (segment) => segment.x === position.x && segment.y === position.y
  );
}

function generateRandomPosition() {
  return {
    x: Math.floor(Math.random() * BOARD_SIZE),
    y: Math.floor(Math.random() * BOARD_SIZE)
  };
}

const Snake = () => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState(DIRECTIONS.ArrowRight);
  const [apple, setApple] = useState(generateRandomPosition());
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [gameOver, setGameOver] = useState(false);
  const [startButtonVisible, setStartButtonVisible] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [buttonDirection, setButtonDirection] = useState(null);

  const handleKeyDown = useCallback((event) => {
    const newDirection = DIRECTIONS[event.code];
    if (newDirection) {
      setDirection(newDirection);
    }

    // Standardverhalten für die Pfeiltaste nach unten verhindern
    if (event.code === "ArrowDown") {
      event.preventDefault();
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (gameOver) {
      return;
    }

    const interval = setInterval(() => {
      if (gameStarted) {
        setSnake((prevState) => {
          const nextPos = getNextPosition(prevState[0], direction);

          if (
            nextPos.x < 0 ||
            nextPos.x >= BOARD_SIZE ||
            nextPos.y < 0 ||
            nextPos.y >= BOARD_SIZE ||
            isPositionOnSnake(nextPos, prevState)
          ) {
            setGameOver(true);
            return prevState;
          }

          const newSnake = [nextPos, ...prevState];
          if (nextPos.x === apple.x && nextPos.y === apple.y) {
            setApple(generateApplePosition(prevState));
            setSpeed((prevSpeed) => prevSpeed - SPEED_INCREMENT);
            return newSnake;
          }

          return newSnake.slice(0, -1);
        });
      }
    }, speed);

    return () => clearInterval(interval);
  }, [direction, snake, apple, speed, gameOver, gameStarted]);

  const startGame = () => {
    setStartButtonVisible(false);
    setGameStarted(true);
  };

  const restartGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection(DIRECTIONS.ArrowRight);
    setApple(generateRandomPosition());
    setSpeed(INITIAL_SPEED);
    setGameOver(false);
    setStartButtonVisible(false);
    setGameStarted(true);
  };

  const handleButtonPress = useCallback(
    (event) => {
      const button = event.target.textContent;
      let newDirection = null;

      switch (button) {
        case "▲":
          newDirection = DIRECTIONS.ArrowUp;
          break;
        case "▼":
          newDirection = DIRECTIONS.ArrowDown;
          break;
        case "◀":
          newDirection = DIRECTIONS.ArrowLeft;
          break;
        case "▶":
          newDirection = DIRECTIONS.ArrowRight;
          break;
        default:
          break;
      }

      setButtonDirection(newDirection);
    },
    [setButtonDirection]
  );

  useEffect(() => {
    if (buttonDirection) {
      setDirection(buttonDirection);
      setButtonDirection(null);
    }
  }, [buttonDirection, setDirection, setButtonDirection]);

  return (
    <div className="snake-app">
      <h1>Snake Game</h1>
      {gameOver ? (
        <>
          <h2>Game Over</h2>
          <p>Your score: {snake.length - 1}</p>
          <button id="btn1" onClick={restartGame}>
            Restart
          </button>
        </>
      ) : (
        <>
          <div id="container">
            <p>Score: {snake.length - 1}</p>
            <div className="snake-board">
              {startButtonVisible && (
                <button id="btnStart" onClick={startGame}>
                  Start
                </button>
              )}
              {snake.map((pos, index) => (
                <div
                  className="snake-segment"
                  key={index}
                  style={{ top: pos.y * 20, left: pos.x * 20 }}
                ></div>
              ))}
              <div
                className="apple"
                style={{ top: apple.y * 20, left: apple.x * 20 }}
              ></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

Snake.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number
};

Snake.defaultProps = {
  width: 20,
  height: 20
};

ReactDOM.render(<Snake />, document.getElementById("root"));
