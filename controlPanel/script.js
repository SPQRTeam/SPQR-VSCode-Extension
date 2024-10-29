const vscode = acquireVsCodeApi();


window.addEventListener('message', event => {
  const message = event.data;
  switch (message.command) {
    case 'setCurrentPath':
      document.getElementById('currentRepositoryPath').textContent = message.currentPath ? message.currentPath : 'Not set';
      document.getElementById('repositoryPath').placeholder = message.currentPath ? message.currentPath : 'Enter repository path';
      break;

    case 'setCurrentDeploySettings':
      document.getElementById('modeMenu').value = message.mode;
      document.getElementById('networkMenu').value = message.network;
      document.getElementById('colorMenu').value = message.color;
      document.getElementById('volumeMenu').value = message.volume;
      document.getElementById('setprofileMenu').checked = message.setprofile;
      document.getElementById('deleteLogsSwitch').checked = message.deleteLogs === "true";
      break;

    case 'setCurrentRobotFormation':
      document.getElementById('robot1Menu').value = message.robot1;
      document.getElementById('robot2Menu').value = message.robot2;
      document.getElementById('robot3Menu').value = message.robot3;
      document.getElementById('robot4Menu').value = message.robot4;
      document.getElementById('robot5Menu').value = message.robot5;
      document.getElementById('robot6Menu').value = message.robot6;
      document.getElementById('robot7Menu').value = message.robot7;
      document.getElementById('robot8Menu').value = message.robot8;
      break;
  }
});

vscode.postMessage({ command: 'requestCurrentPath' });
vscode.postMessage({ command: 'requestCurrentDeploySettings' });
vscode.postMessage({ command: 'requestCurrentRobotFormation' });

//* Repository path
document.getElementById('repositoryForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const repositoryPath = document.getElementById('repositoryPath').value;
  vscode.postMessage({
    command: 'savePath',
    repositoryPath: repositoryPath
  });
});

//* Deploy settings
document.getElementById('modeMenu').addEventListener('change', function() {
  const mode = document.getElementById('modeMenu').value
  vscode.postMessage({
    command: 'mode',
    mode: mode
  });
});

document.getElementById('networkMenu').addEventListener('change', function() {
  const network = document.getElementById('networkMenu').value
  vscode.postMessage({
    command: 'network',
    network: network
  });
});

document.getElementById('colorMenu').addEventListener('change', function() {
  const color = document.getElementById('colorMenu').value
  vscode.postMessage({
    command: 'color',
    color: color
  });
});

document.getElementById('volumeMenu').addEventListener('change', function() {
  const volume = document.getElementById('volumeMenu').value
  vscode.postMessage({
    command: 'volume',
    volume: volume
  });
});

document.getElementById('setprofileMenu').addEventListener('change', function() {
  const setprofile = document.getElementById('setprofileMenu').value;


  vscode.postMessage({
    command: 'setprofile',
    setprofile: setprofile
  });
});

document.getElementById('deleteLogsSwitch').addEventListener('change', function() {
  const deleteLogs = document.getElementById('deleteLogsSwitch').checked;
  vscode.postMessage({
    command: 'deleteLogs',
    deleteLogs: deleteLogs
  });
});


//* Robots
document.getElementById('robot1Menu').addEventListener('change', function() {
  const robot1 = document.getElementById('robot1Menu').value
  vscode.postMessage({
    command: 'robot1',
    robot1: robot1
  });
});

document.getElementById('robot2Menu').addEventListener('change', function() {
  const robot2 = document.getElementById('robot2Menu').value
  vscode.postMessage({
    command: 'robot2',
    robot2: robot2
  });
});

document.getElementById('robot3Menu').addEventListener('change', function() {
  const robot3 = document.getElementById('robot3Menu').value
  vscode.postMessage({
    command: 'robot3',
    robot3: robot3
  });
});

document.getElementById('robot4Menu').addEventListener('change', function() {
  const robot4 = document.getElementById('robot4Menu').value
  vscode.postMessage({
    command: 'robot4',
    robot4: robot4
  });
});

document.getElementById('robot5Menu').addEventListener('change', function() {
  const robot5 = document.getElementById('robot5Menu').value
  vscode.postMessage({
    command: 'robot5',
    robot5: robot5
  });
});

document.getElementById('robot6Menu').addEventListener('change', function() {
  const robot6 = document.getElementById('robot6Menu').value
  vscode.postMessage({
    command: 'robot6',
    robot6: robot6
  });
});

document.getElementById('robot7Menu').addEventListener('change', function() {
  const robot7 = document.getElementById('robot7Menu').value
  vscode.postMessage({
    command: 'robot7',
    robot7: robot7
  });
});


document.getElementById('robot8Menu').addEventListener('change', function() {
  const robot8 = document.getElementById('robot8Menu').value
  vscode.postMessage({
    command: 'robot8',
    robot8: robot8
  });
});