import xs from 'xstream';
import { button, div, h1, input } from '@cycle/dom';
import { API_KEY, BASE_URL } from '../api';

const CATEGORY = 'forecast';
const INIT_CITY = 'London';
const DAYS = 7;
const CITY_SEARCH = 'citySearchAction';

const getRequest = city =>
    xs.of({
        type: CITY_SEARCH,
        city,
        url: `${BASE_URL}?key=${API_KEY}&q=${city}&days=${DAYS}`,
        category: CATEGORY,
    });

const parseResponse = response => JSON.parse(response.text);
const simplifyData = data => prev =>
    xs.of({
        ...prev,
        city: data.location.name,
        current: data.current,
        forecasts: data.forecast.forecastday,
    });

const generateCityForm = location =>
    xs.of(
        div('.form', [
            h1(`Your forecasts for ${location.city}`),
            input('#location-input', { props: { value: location.city } }),
            button('#location-btn', 'Get Forecasts (MVI S)'),
        ])
    );

const model = (actions$, HTTP) => {
    const reducer$ = HTTP.select(CATEGORY)
        .flatten()
        .map(parseResponse)
        .map(simplifyData);

    return reducer$;
};

const intent = DOM => {
    const input$ = DOM.select('#location-input')
        .events('focusout')
        .map(evt => evt.target.value);
    const btn$ = DOM.select('#location-btn').events('mousedown');

    return xs
        .combine(input$, btn$)
        .map(([city]) => getRequest(city))
        .startWith(getRequest(INIT_CITY));
};

const view = state$ => state$.map(state => generateCityForm(state));

export const CityForm = sources => {
    const state$ = sources.state.stream;
    const actions$ = intent(sources.DOM);
    const reducer$ = model(actions$, sources.HTTP);
    const vdom$ = view(state$);

    return {
        DOM: vdom$,
        HTTP: actions$,
        state: reducer$,
    };
};
