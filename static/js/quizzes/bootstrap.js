import reqwest from 'reqwest';
import React from 'react';
import {Quiz} from './components.jsx!';
import qwery from 'qwery';

export function boot(el, quizSpec, mediator) {
    React.render(React.createElement(Quiz, quizSpec), el);
    if (mediator) {
        mediator.emit('ui:images:upgradePictures');
    }
}

/** Horrible thing to get it working on frontend, as we still use AMD. */
if (!'_boot_ng_quiz' in window) {
    window._boot_ng_quiz = boot;
}
