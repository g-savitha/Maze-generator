const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsCol = 14;
const cellsRow = 10;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsCol;
const unitLengthY = height / cellsRow;

const engine = Engine.create();
//disable gravity
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height,
  },
});

Render.run(render);
Runner.run(Runner.create(), engine);

//border walls

const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }),
];

World.add(world, walls);

//Maze generation

const shuffle = (arr) => {
  let count = arr.length;

  while (count > 0) {
    const idx = Math.floor(Math.random() * count);
    count--;

    const temp = arr[count];
    arr[count] = arr[idx];
    arr[idx] = temp;
  }
  return arr;
};

const grid = Array(cellsRow)
  .fill(null)
  .map(() => Array(cellsCol).fill(false));

const verticals = Array(cellsRow)
  .fill(null)
  .map(() => Array(cellsCol - 1).fill(false));

const horizontals = Array(cellsRow - 1)
  .fill(null)
  .map(() => Array(cellsCol).fill(false));

const startRow = Math.floor(Math.random() * cellsRow);
const startColumn = Math.floor(Math.random() * cellsCol);

const stepThroughCell = (row, column) => {
  //If i have visited cell at [row,column] return
  if (grid[row][column]) return;
  //mark this cell as being visited
  grid[row][column] = true;
  //assemble randomly-ordered list neighbours
  const neighbours = shuffle([
    [row - 1, column, "up"],
    [row, column + 1, "right"],
    [row + 1, column, "down"],
    [row, column - 1, "left"],
  ]);

  //for each neighbour...
  for (let neighbour of neighbours) {
    const [nextRow, nextColumn, direction] = neighbour;
    //see if that neighbour is out of bounds
    if (
      nextRow < 0 ||
      nextRow >= cellsRow ||
      nextColumn < 0 ||
      nextColumn >= cellsCol
    )
      continue;

    //if we have visited that neighbour continue to next neighbour
    if (grid[nextRow][nextColumn]) continue;

    //remove a wall from either horizontal or verticals array
    switch (direction) {
      case "up":
        horizontals[row - 1][column] = true;
        break;
      case "down":
        horizontals[row][column] = true;
        break;
      case "left":
        verticals[row][column - 1] = true;
        break;
      case "right":
        verticals[row][column] = true;
        break;
      default:
        break;
    }
    //visit that next cell
    stepThroughCell(nextRow, nextColumn);
  }
};

stepThroughCell(startRow, startColumn);

//Code to generatue GUI
//horizontal walls
horizontals.forEach((row, rowIdx) => {
  row.forEach((open, colIdx) => {
    if (open) return;
    const x = colIdx * unitLengthX + unitLengthX / 2;
    const y = rowIdx * unitLengthY + unitLengthY;
    const w = unitLengthX;
    const h = 5;
    const wall = Bodies.rectangle(x, y, w, h, {
      isStatic: true,
      label: "wall",
    });

    World.add(world, wall);
  });
});

//vertical walls
verticals.forEach((row, rowIdx) => {
  row.forEach((open, colIdx) => {
    if (open) return;
    const x = colIdx * unitLengthX + unitLengthX;
    const y = rowIdx * unitLengthY + unitLengthY / 2;
    const h = unitLengthY;
    const w = 5;
    const wall = Bodies.rectangle(x, y, w, h, {
      isStatic: true,
      label: "wall",
    });

    World.add(world, wall);
  });
});

//Goal
const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.7,
  unitLengthY * 0.7,
  { isStatic: true, label: "goal" }
);
World.add(world, goal);

//Ball
const radius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, radius, {
  label: "ball",
});
World.add(world, ball);

//Keyboard controls

document.addEventListener("keydown", (event) => {
  const { x, y } = ball.velocity;
  //move up ->W or UpArrow
  if (event.keyCode === 87 || event.keyCode === 38) {
    Body.setVelocity(ball, { x, y: y - 3 });
  }
  //move right->D or RightArrow
  if (event.keyCode === 68 || event.keyCode === 39) {
    Body.setVelocity(ball, { x: x + 3, y });
  }
  //move down->S or DownArrow
  if (event.keyCode === 83 || event.keyCode === 40) {
    Body.setVelocity(ball, { x, y: y + 3 });
  }
  //move left->A or LeftArrow
  if (event.keyCode === 65 || event.keyCode === 37) {
    Body.setVelocity(ball, { x: x - 3, y });
  }
});
// Win condition

Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    const labels = ["ball", "goal"];

    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      //win animation
      world.gravity.y = 1;
      world.bodies.forEach((body) => {
        if (body.label === "wall") {
          Body.setStatic(body, false);
        }
      });
    }
  });
});
