"use strict";
var setUsername;
var currentRoom = "Global";
var socket = undefined;
function delay(fn, ms) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        // @ts-ignore
        timer = setTimeout(fn.bind(this, ...args), ms || 0);
    };
}
function startApp() {
    document.querySelector('#content').disabled = false;
    document.querySelector('#button').disabled = true;
    document.querySelector('#room-id').disabled = true;
    let input = document.querySelector('#room-id');
    let content = document.querySelector('#content');
    // @ts-ignore
    socket = io('ws://', {
        query: {
            roomID: input.value
        }
    });
    if (!socket) {
        return;
    }
    socket.on('update', (data) => {
        content.value = data.content;
    });
    socket.on('alert', (data) => {
        let html = '<div class="toast d-block align-items-center" role="alert" aria-live="assertive" aria-atomic="true">';
        html += '<div class="d-flex"><div class="toast-body">';
        html += data.message;
        html += '</div><button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div></div>';
        document.querySelector('.toasts').innerHTML += html;
        setTimeout(() => {
            document.querySelector('.toast:first-child').remove();
        }, 3000);
    });
    document.querySelector('#content')?.addEventListener('keyup', delay(() => {
        console.log("emit " + content.value);
        socket.emit('update', { content: content.value });
    }, 1000));
}
document.getElementById('button')?.addEventListener('click', (ev) => {
    startApp();
});
document.querySelector('#room-id')?.addEventListener('keyup', (ev) => {
    if (ev.code == "Enter") {
        startApp();
    }
});
document.addEventListener('click', (ev) => {
    let input = ev.target.closest(".btn-close");
    if (input) {
        input.closest(".toast").remove();
    }
});
