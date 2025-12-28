# Chess Puzzles 3d (v3)

Copyright 2022-2026 Steven Mycynek

## Basics

This is my first major rewrite of the chess-puzzles 3d site at
This is my first major rewrite of the older "Chess-puzzles 3d" site at
https://stevenvictor.net/chessGL/

The older site was written in raw WebGL with all shading math done by hand. This new site uses ThreeJs.

It takes data from chess puzzles generated from
https://stevenvictor.net/chess and renders them in WebGL
using `.gltf` models created in https://cad.onshape.com

Aside from nicer shading, it supports textures, tilt/zoom, and animation.

2026 -- Updated for WebGL2 and Angular 21/Zoneless

## Usage

`bun install` and...

`.\deploy.sh` -- build and zip for web deployment

`bun start` -- run locally

## Live demo

https://stevenvictor.net/chess3d

## Credits

Textures: https://www.pexels.com/license/
