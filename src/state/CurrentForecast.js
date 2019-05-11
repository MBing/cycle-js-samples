import { div, h2, h3, img, p } from '@cycle/dom';
import format from 'date-fns/format';

import './currentForecast.css';

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
        h3(format(forecast.last_updated, 'dddd Do MMMM YYYY')),
        h2(`${forecast.temp_c}C`),
        p(`humidity: ${forecast.humidity}%`),
    ]);
const view = state$ =>
    state$.map(state => generateCurrentForecast(state.current));

export const CurrentForecast = sources => {
    const state$ = sources.state.stream;
    const vdom$ = view(state$);

    return {
        DOM: vdom$,
    };
};
