const taskName = 'task-2';
function debug(msg) {
    debugger;
    let log = document.getElementById('debuglog');
    if (!log) {
        let taskBlock = document.querySelector(`.${taskName}`);
        log = document.createElement('div');
        log.id = 'debuglog';
        log.innerHTML = '<h1>Debug Log</h1>';
        taskBlock.appendChild(log);
    }

    const pre = document.createElement('pre');
    const text = document.createTextNode(msg);
    pre.appendChild(text);
    log.appendChild(pre);
}
debug('Hello World');
