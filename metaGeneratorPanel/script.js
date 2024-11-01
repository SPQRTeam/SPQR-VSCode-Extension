const vscode = acquireVsCodeApi();

window.addEventListener('message', event => {
  const message = event.data;
  switch (message.command) {
    case 'default':
      break;
  }
});