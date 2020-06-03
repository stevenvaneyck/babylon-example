# Babylon JS Robot simulator example

## setup
after installing node:
```sh
$ npm install
$ npm run start
```
then browsing to http://localhost:8080 should show you the results. any changes made to the code will cause a reload.

## technology
- Babylon JS
- typescript
- webpack
- node
- html
- css

## Robot simulator using Babylon JS

As per FRC code blocks, the robot in this simulation allows for setting left and right wheel power separately. For this example, this can be done via the sliders in the UI, but the power settings could be provided by the Blockly code eventually. To apply the power, press space! You can also change the power while keeping space pressed.

Pros:
* Both graphics and physics are 3D. 3D physics is something which we might need later on, f.i. to pick up blocks and stack them, or to make the robot slow down while driving up an inclined plane.
* Graphics and physics engine are integrated, so no need to maintain state/info twice.
* Full code is only 180 lines (including UI which we eventually don't need)
* Babylon JS can work with multiple 3D physics engines (Cannon JS, Ammo JS, Oimo JS) and you can switch between engines without any code changes. This could be useful f.i. if we find that one engine doesn't have the functionality we need or is too slow. I've only tried Cannon JS so far.

Cons:
* A bit slow, although I haven't tried optimizing it or tweaking settings
