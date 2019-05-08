import xs from 'xstream/index';
import { run } from '@cycle/run/lib/cjs/index';
import {
    div,
    h1,
    h2,
    h3,
    img,
    p,
    input,
    button,
    makeDOMDriver,
} from '@cycle/dom/lib/cjs/index';
import { makeHTTPDriver } from '@cycle/http/lib/cjs/index';

const CATEGORY = 'forecast';
const INIT_CITY = 'London';

const getForm = () =>
    div('.form', [
        input('#location-input'),
        button('#location-btn', 'get forecasts'),
    ]);

const generateNext5Days = forecasts => {
    const list = forecasts.map(forecast => {
        return div('.forecast-box', [
            h3(forecast.date),
            p(
                `min ${forecast.day.mintemp_c}C - max ${
                    forecast.day.maxtemp_c
                }C`
            ),
            img('.forecast-img', {
                props: {
                    src: `http:${forecast.day.condition.icon}`,
                },
            }),
            p('.status', forecast.day.condition.text),
        ]);
    });

    return div('.forecasts-container', list);
};

const generateCurrentForecast = forecast =>
    div('.current-forecast-container', [
        div('.today-forecast', [
            img('.forecast-img', {
                props: {
                    src: `http:${forecast.condition.icon}`,
                },
            }),
            p('.status', forecast.condition.text),
        ]),
        h3(forecast.last_updated),
        h2(`${forecast.temp_c}C`),
        p(`humidity: ${forecast.humidity}%`),
    ]);

const parseResponse = response => JSON.parse(response.text);
const simplifyData = data => ({
    city: data.location.name,
    current: data.current,
    forecast: data.forecast.forecastday,
});

const generateVDOM = data =>
    div('.main-container', [
        h1(`Your forecasts for ${data.city}`),
        getForm(),
        generateCurrentForecast(data.current),
        generateNext5Days(data.forecast),
    ]);

const getRequest = city => ({
    url: `http://api.apixu.com/v1/forecast.json?key=04ca1fa2705645e4830214415172307&q=${city}&days=7`,
    category: CATEGORY,
});

const main = sources => {
    const input$ = sources.DOM.select('#location-input')
        .events('focusout')
        .map(evt => evt.target.value);
    const btn$ = sources.DOM.select('#location-btn').events('mousedown');
    const merged$ = xs.combine(input$, btn$);
    const request$ = merged$
        .map(([city]) => getRequest(city))
        .startWith(getRequest(INIT_CITY));
    const response$ = sources.HTTP.select(CATEGORY).flatten();
    const vdom$ = response$
        .map(parseResponse)
        .map(simplifyData)
        .map(generateVDOM)
        .startWith('Loading...');

    return {
        DOM: vdom$,
        HTTP: request$,
    };
};

const drivers = {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver(),
};

run(main, drivers);
