# Tour Tracker

Plot tourers along a route using their distance.

### The Bits

* React
* Leaflet js
* Redux (optional)

To view the examples:

```
$ npm i
$ npm run dev
```

Open your browser at `localhost:8080`

*TODO:* Give the examples decent nav

## Examples

### Selectable

This example shows how you might implement selectable tourers. In the source dir you'll find some pre-made Redux actions and a reducer. You'll also find a `container.js` file which exports a factory function for a connected Tracker. You can call it with no args and get a default, redux-connected, component, or you can pass it either or both `mapState` and `mapDispatch` functions to suit your redux setup.

The main advantage of the connected version of the Tracker is that it's set up to fetch it's route on mount. You just have to ensure that you've passed it some waypoints (as many as you like) and it'll render with a route plotted between them all.

*TODO:* Add a 'standalone' version where the redux work has been done for those who don't need it elsewhere in their app.

### Custom popup

This example shows how you might implement custom popups.
