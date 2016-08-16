# Examples

In the source dir you'll find some pre-made Redux actions and a reducer. You'll also find a `container.js` file which exports a factory function for a connected Tracker. You can call it with no args and get a default, redux-connected, component, or you can pass it either or both `mapState` and `mapDispatch` functions to suit your redux setup.

The main advantage of the connected version of the Tracker is that it's set up to fetch it's route on mount. You just have to ensure that you've passed it some waypoints (as many as you like) and it'll render with a route plotted between them all.

---

## Cross continent (multiple routes)

This example shows how you might create a cross continent journey by providing multiple routes to the TourTracker.

---

## Custom Popup

This example shows a full implementation for the population and styling of individual popups. TourTracker will handle the opening, closing and panning of the popup, all you need to do is provide the content and style.

#### Approach

Add a `popup` property to each tourer, containing the content and options for its popup ([check out the leaflet popup options](http://leafletjs.com/reference.html#popup))

The TourTracker is wrapped in a higher order component to decorate each provided tourer with popup data.  This decorator function populates the `popup` property for each tourer, including a statically rendered custom `Popup` component as the provided content.

#### Going further

Custom api results, a birthday (any datastructure) can be passed along with each tourer object to be displayed within the popup when opened.

---

## Selectable Items

This example shows how to customise the icon for a selected tourer, and manually select a tourer from outside the TourTracker.

Each tourer has an `icon` property, and the TourTracker tells the redux store which tourer is currently selected. We can access the `selected` state and assign a selected icon to the corresponding tourer.

*TODO:* Add a 'standalone' version where the redux work has been done for those who don't need it elsewhere in their app.

#### Approach

The TourTracker is wrapped in a redux connected higher order component which decorates each provided tourer with the appropriate icon. It maps the `selected` state from the redux store as well as the `selectTourer` action.

The decorator function is called with the selected tourer id (from the wrapped component's `selected` prop), and assigns the relevant icon to the matched tourer.

There is a simple select box which fires the `selectTourer` action when changed to update the selected tourer in the redux store via the corresponding reducer.

#### Going further

With this approach any number of redux connected components are able to represent or change the selected tourer.

