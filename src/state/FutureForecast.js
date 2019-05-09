import { div, h3, img, p } from '@cycle/dom';
import format from 'date-fns/format';

const generateNext5Days = forecasts => {
    const list = forecasts.map(forecast =>
        div('.forecast-box', [
            h3(format(forecast.date, 'dddd Do MMM')),
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
        ])
    );

    return div('.forecasts-container', list);
};

const view = state$ => state$.map(state => generateNext5Days(state.forecasts));

export const FutureForecast = sources => {
    const state$ = sources.state.stream;
    const vdom$ = view(state$);

    return {
        DOM: vdom$,
    };
};
