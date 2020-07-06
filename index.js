const { Engine, Render, Runner, World, Bodies } = Matter;

const width = 600;
const height = 600;

const engine = Engine.create();
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

//walls

const walls = [
  Bodies.rectangle(width / 2, 0, width, 40, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 40, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 40, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 40, height, { isStatic: true }),
];

World.add(world, walls);

//Maze generation

// [
//   [false, false, false],
//   [false, false, false],
//   [false, false, false],
// ];

const grid = Array(3)
  .fill(null)
  .map(() => Array(3).fill(false));

//why do we need to use map? why d\cant we direct fill([false,false,false])
// grid
// (3) [Array(3), Array(3), Array(3)]
// 0: (3) [false, false, false]
// 1: (3) [false, false, false]
// 2: (3) [false, false, false]

// grid[0].push(true)
// grid

// (3) [Array(4), Array(4), Array(4)]
// 0: (4) [false, false, false, true]
// 1: (4) [false, false, false, true]
// 2: (4) [false, false, false, true]

//using map (.map(() => Array(3).fill(false))), each time we generate a brand new array.
