// This is the Model View Intent example with State --> most changes are on the bottom { view, intent, model }
import xs from 'xstream';
import isolate from '@cycle/isolate';
import { run } from '@cycle/run';
import { h1, div, makeDOMDriver } from '@cycle/dom';
import { withState } from '@cycle/state';
import { makeHTTPDriver } from '@cycle/http';
import { CityForm } from './CityForm';
import { CurrentForecast } from './CurrentForecast';
import { FutureForecast } from './FutureForecast';

const generateVDOM = ([formVNode, currentVNode, futureVNode]) =>
    div('.main-container', [formVNode, currentVNode, futureVNode]);

const view = (locationDOM$, currentForecastDOM$, futureForecastDOM$) => {
    return xs
        .combine(locationDOM$, currentForecastDOM$, futureForecastDOM$)
        .map(combinedStreams => generateVDOM(combinedStreams))
        .startWith(h1('Loading...'));
};

const main = sources => {
    const cityLens = {
        get: state => state,
        set: (state, childState) => childState,
    };

    // The standard mechanism is already implementing a simple form of lens:
    // https://cycle.js.org/api/state.html#cycle-state-source-usage-how-to-share-data-among-components-or-compute-derived-data
    const locationSinks = isolate(CityForm, { state: cityLens })(sources);
    const currentForecastSinks = isolate(CurrentForecast, { state: cityLens })(
        sources
    );
    const futureForecastSinks = isolate(FutureForecast, { state: cityLens })(
        sources
    );

    const locationReducer$ = locationSinks.state;
    const httpRequest$ = locationSinks.HTTP;

    const vdom$ = view(
        locationSinks.DOM,
        currentForecastSinks.DOM,
        futureForecastSinks.DOM
    );

    return {
        DOM: vdom$,
        HTTP: httpRequest$,
        state: locationReducer$,
    };
};

const drivers = {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver(),
};

const wrappedMain = withState(main);

run(wrappedMain, drivers);
