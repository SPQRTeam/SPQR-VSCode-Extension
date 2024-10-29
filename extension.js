const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const config = vscode.workspace.getConfiguration('SPQR');
let terminal = createTerminal();
let commandProvider;
let outputChannel = vscode.window.createOutputChannel('SPQR');

const sceneTypes = ['Fast', 'Normal', 'PerceptOracle', '2D', 'Special'];
const scenes = {
  'Fast': ['BH', '1vs1', '1vsDummy', '1vsDummies', '7vs7', '7vsDummies'],
  'Normal': ['BH', '1vs1', '1vsDummy', '1vsDummies', '7vs7', '7vsDummies'],
  'PerceptOracle': ['BH', '1vs1', '1vsDummy', '1vsDummies', '7vs7', '7vsDummies'],
  '2D': ['BH', '7vs7'],
  'Special': ['KickViewScene', 'KickViewSceneRemote', 'RemoteRobot', 'ReplayRobot']
};

let robotFormation = {
  robot1: {number: '', ip: '', name: '', command: ''},
  robot2: {number: '', ip: '', name: '', command: ''},
  robot3: {number: '', ip: '', name: '', command: ''},
  robot4: {number: '', ip: '', name: '', command: ''},
  robot5: {number: '', ip: '', name: '', command: ''},
  robot6: {number: '', ip: '', name: '', command: ''},
  robot7: {number: '', ip: '', name: '', command: ''},
  robot8: {number: '', ip: '', name: '', command: ''},
};

let deploySettings = {
  mode: '',
  network: '',
  color: '',
  volume: '',
  setprofile: '',
  deleteLogs: ''
};

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  //* Automatically open the control panel on activation
  openControlPanel(context);

  //* Create a tree view for the commands
  commandProvider = new CommandProvider();
  vscode.window.createTreeView('SPQRView', {
    treeDataProvider: commandProvider
  });
  context.subscriptions.push(commandProvider);

  //* Register control panel command
  const controlPanelCommand = vscode.commands.registerCommand('SPQR.controlPanel', function () {
    openControlPanel(context);
  });
  context.subscriptions.push(controlPanelCommand);

  //* Register wiki panel command
  const wikiPanelCommand = vscode.commands.registerCommand('SPQR.wikiPanel', function () {
    openWikiPanel(context);
  });
  context.subscriptions.push(wikiPanelCommand);

  //* Clear Terminal Command
  const clearTerminalCommand = vscode.commands.registerCommand('SPQR.clearTerminal', function () { clearTerminal(); });

  //* Compile Command
  const compileCommand = vscode.commands.registerCommand('SPQR.compile', async function () { compile(); });
  context.subscriptions.push(compileCommand);

  //* Deploy Command
  const deployCommand = vscode.commands.registerCommand('SPQR.deploy', async function () { deploy(); });
  context.subscriptions.push(deployCommand);

  //* Register Deploy Commands
  registerDeployCommands(context);

  //* Run SimRobot Command
  const SimRobotCommand = vscode.commands.registerCommand('SPQR.SimRobot', async function () { SimRobot(); });
  context.subscriptions.push(SimRobotCommand);

  //* Register SimRobot Scene Commands
  registerSimRobotScenes(context);

  //* Get current deploy settings
  getCurrentDeploySettings();

  //* Get current robot formation
  getCurrentRobotFormation();  
}

function openControlPanel(context) {
  const panel = vscode.window.createWebviewPanel(
    'SPQRControlPanel',
    'SPQR Control Panel',
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  panel.webview.html = getWebviewContent('controlPanel');

  panel.webview.onDidReceiveMessage(async message => {  
    outputChannel.appendLine(`Received message: ${message.command}`);
    switch (message.command) {
      case 'savePath':
        await config.update('repositoryPath', message.repositoryPath, vscode.ConfigurationTarget.Global);
        panel.webview.postMessage({
          command: 'setCurrentPath',
          currentPath: message.repositoryPath
        });
        vscode.window.showInformationMessage('Repository path saved: ' + message.repositoryPath);
        break;

      case 'requestCurrentPath':
        const currentPath = vscode.workspace.getConfiguration('SPQR').get('repositoryPath') || 'Not set';
        panel.webview.postMessage({
          command: 'setCurrentPath',
          currentPath: currentPath
        });
        break;

      case 'mode':
        setCurrentDeploySettings('mode', message.mode);
        vscode.window.showInformationMessage('Deploy setting updated: mode = ' + message.mode);
        break;
      
      case 'network':
        setCurrentDeploySettings('network', message.network);
        vscode.window.showInformationMessage('Deploy setting updated: network = ' + message.network);
        break;

      case 'color':
        setCurrentDeploySettings('-c', message.color);
        vscode.window.showInformationMessage('Deploy setting updated: color = ' + message.color);
        break;

      case 'volume':
        setCurrentDeploySettings('-v', message.volume);
        vscode.window.showInformationMessage('Deploy setting updated: volume = ' + message.volume);
        break;

      case 'setprofile':
        if (message.setprofile === 'Custom') {
          vscode.window.showInputBox({ prompt: 'Enter the setprofile value' }).then(value => {
            setCurrentDeploySettings('-w', value);
            vscode.window.showInformationMessage('Deploy setting updated: setprofile = ' + value);
          });
        }
        else{
          setCurrentDeploySettings('-w', message.setprofile);
          vscode.window.showInformationMessage('Deploy setting updated: setprofile = ' + message.setprofile);
        }
        break;
        
      case 'deleteLogs':
        setCurrentDeploySettings('-d', message.deleteLogs);
        vscode.window.showInformationMessage('Deploy setting updated: delete logs = ' + message.deleteLogs);
        break;

      case 'requestCurrentDeploySettings':
        getCurrentDeploySettings();
        panel.webview.postMessage({
          command: 'setCurrentDeploySettings',
          mode: deploySettings.mode,
          network: deploySettings.network,
          color: deploySettings.color,
          volume: deploySettings.volume,
          setprofile: deploySettings.setprofile,
          deleteLogs: deploySettings.deleteLogs
        });
        break;

      case 'robot1':
        outputChannel.appendLine(`Setting robot 1 - ${message.robot1}`);
        setRobotFormation(1, message.robot1);
        vscode.window.showInformationMessage('Robot 1: ' + message.robot1);
        break;

      case 'robot2':
        setRobotFormation(2, message.robot2);
        vscode.window.showInformationMessage('Robot 2: ' + message.robot2);
        break;

      case 'robot3':  
        setRobotFormation(3, message.robot3);
        vscode.window.showInformationMessage('Robot 3: ' + message.robot3);
        break;

      case 'robot4':  
        setRobotFormation(4, message.robot4);
        vscode.window.showInformationMessage('Robot 4: ' + message.robot4);
        break;
      
        case 'robot5':  
        setRobotFormation(5, message.robot5);
        vscode.window.showInformationMessage('Robot 5: ' + message.robot5);
        break;

      case 'robot6':  
        setRobotFormation(6, message.robot6);
        vscode.window.showInformationMessage('Robot 6: ' + message.robot6);
        break;

      case 'robot7':  
        setRobotFormation(7, message.robot7);
        vscode.window.showInformationMessage('Robot 7: ' + message.robot7);
        break;

      case 'robot8':  
        setRobotFormation(8, message.robot8);
        vscode.window.showInformationMessage('Robot 8: ' + message.robot8);
        break;

      case 'requestCurrentRobotFormation':
        getCurrentRobotFormation();
        panel.webview.postMessage({
          command: 'setCurrentRobotFormation',
          robot1: robotFormation.robot1.command,
          robot2: robotFormation.robot2.command,
          robot3: robotFormation.robot3.command,
          robot4: robotFormation.robot4.command,
          robot5: robotFormation.robot5.command,
          robot6: robotFormation.robot6.command,
          robot7: robotFormation.robot7.command,
          robot8: robotFormation.robot8.command,
        });
        break
        
      default:
        break;
    }  

    panel.webview.postMessage({
      command: 'setCurrentDeploySettings',
      mode: deploySettings.mode,
      network: deploySettings.network,
      color: deploySettings.color,
      volume: deploySettings.volume,
      setprofile: deploySettings.setprofile,
      deleteLogs: deploySettings.deleteLogs
    });
  
    panel.webview.postMessage({
      command: 'setCurrentRobotFormation',
      robot1: robotFormation.robot1.command,
      robot2: robotFormation.robot2.command,
      robot3: robotFormation.robot3.command,
      robot4: robotFormation.robot4.command,
      robot5: robotFormation.robot5.command,
      robot6: robotFormation.robot6.command,
      robot7: robotFormation.robot7.command,
      robot8: robotFormation.robot8.command,
    });
  });
}


//* Wiki Panel
function openWikiPanel(context) {
  const panel = vscode.window.createWebviewPanel(
    'SPQRWikiPanel',
    'SPQR Wiki',
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  panel.webview.html = getWebviewContent('wikiPanel');

  panel.webview.onDidReceiveMessage(async message => {  
    switch (message.command) {  
      default:
        break;
    }  
  });

}

//* Webview panel
function getWebviewContent(panelName) {
  const htmlPath = path.join(__dirname, `./${panelName}/index.html`);
  const cssPath = path.join(__dirname, `./${panelName}/styles.css`);
  const jsPath = path.join(__dirname, `./${panelName}/script.js`);

  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  const jsContent = fs.readFileSync(jsPath, 'utf8');

  htmlContent = htmlContent.replace('</head>', `<style>${cssContent}</style></head>`);
  htmlContent = htmlContent.replace('</body>', `<script>${jsContent}</script></body>`);

  return htmlContent;
}


//* Terminal
function createTerminal() {
  return vscode.window.createTerminal('SPQR Terminal');
}

function ensureTerminal() {
  if (terminal.exitStatus) {
    terminal = createTerminal();
  }
}

//* Repository Path
function getRepositoryPath() {
  let repositoryPath = vscode.workspace.getConfiguration('SPQR').get('repositoryPath');
  if (!repositoryPath) {
    vscode.window.showErrorMessage('Repository path is not set. Please set it in the control panel.');
    return null;
  }
  return repositoryPath;
}


//* Deploy Settings
function getCurrentDeploySettings(message) {
  let repositoryPath = getRepositoryPath();
  if (!repositoryPath) return;
  let filePath = path.join(repositoryPath, 'SPQRTools/deploySettings.conf');
  const configFile = fs.readFileSync(filePath, 'utf-8');
  const lines = configFile.split('\n');
  const settings = {};
  lines.forEach(line => {
    const cleanLine = line.split('#')[0].trim();
    if (cleanLine === '') return;
    const [parameter, value] = cleanLine.split(' ');
    let parameterName = parameter;
    if (parameter === 'mode') parameterName = 'mode'; 
    if (parameter === 'network') parameterName = 'network';
    if (parameter === '-c') parameterName = 'color';
    if (parameter === '-v') parameterName = 'volume';
    if (parameter === '-w') parameterName = 'setprofile';
    if (parameter === '-d') parameterName = 'deleteLogs';
    deploySettings[parameterName] = value;
  });
}

function setCurrentDeploySettings(param, newValue) {
  let repositoryPath = getRepositoryPath();
  if (!repositoryPath) return;

  if (param === 'mode') deploySettings.mode = newValue;
  if (param === 'network') deploySettings.network = newValue;
  if (param === '-c') deploySettings.color = newValue;
  if (param === '-v') deploySettings.volume = newValue;
  if (param === '-w') deploySettings.setprofile = newValue;
  if (param === '-d') deploySettings.deleteLogs = newValue ? 'true' : 'false';

  let filePath = path.join(repositoryPath, 'SPQRTools/deploySettings.conf');
  const configFile = fs.readFileSync(filePath, 'utf-8');
  const lines = configFile.split('\n');
  const updatedLines = lines.map((line) => {
    const cleanLine = line.split('#')[0].trim();
    if (cleanLine === '') return line;
    const [parameter, ...rest] = cleanLine.split(' ');
    if (parameter === param) {
      const comment = line.includes('#') ? line.split('#')[1] : '';
      return `${parameter} ${newValue} #${comment.trim()}`;
    }
    return line;
  });

  fs.writeFileSync(filePath, updatedLines.join('\n'), 'utf-8');
}


//* Robot Formation
function getCurrentRobotFormation() {
  let repositoryPath = getRepositoryPath();
  if (!repositoryPath) return;
  let filePath = path.join(repositoryPath, 'SPQRTools/robotFormation.conf');
  const configFile = fs.readFileSync(filePath, 'utf-8');
  const lines = configFile.split('\n');
  const robots = {};
  lines.forEach(line => {
    const cleanLine = line.split('#')[0].trim();
    if (cleanLine === '') return;
    const [number, ip, ...nameParts] = cleanLine.split(' ');
    robotFormation[`robot${number}`] = {number: number, ip: ip, name: nameParts.join(' '), command: `${ip}-${nameParts.join(' ')}`};
  });
}

function setRobotFormation(robotNumber, ip_name) {
  outputChannel.appendLine(`Setting robot ${robotNumber} - ${ip_name}`);
  let repositoryPath = getRepositoryPath();
  if (!repositoryPath) return;

  robotFormation[`robot${robotNumber}`] = {number: robotNumber, ip: ip_name.split('-')[0], name: ip_name.split('-')[1], command: ip_name};
  outputChannel.appendLine(`Robot ${robotNumber} - ${ip_name}`);

  let filePath = path.join(repositoryPath, 'SPQRTools/robotFormation.conf');
  const [newIp, newName] = ip_name.split('-');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');
  const updatedLines = lines.map((line) => {
    const [number, ip, ...nameParts] = line.trim().split(' ');
    if (parseInt(number) === robotNumber) {
      return `${number} ${newIp} ${newName}`;
    }
    return line;
  });
  fs.writeFileSync(filePath, updatedLines.join('\n'), 'utf-8');

  if (commandProvider) commandProvider.refresh();
}


//* Terminal Commands
function clearTerminal() {
  ensureTerminal();
  terminal.sendText('clear');
}

function compile() {
  let repositoryPath = getRepositoryPath();
  if (!repositoryPath) return;
  vscode.window.showInformationMessage('Compiling ...');
  ensureTerminal();
  terminal.sendText(`cd ${repositoryPath} && source SPQRTools/spqr`);
  terminal.show();
  terminal.sendText(`spqr compile`);
}

function deploy(number=null) {
  let repositoryPath = getRepositoryPath();
  if (!repositoryPath) return;
  ensureTerminal();
  terminal.sendText(`cd ${repositoryPath} && source SPQRTools/spqr`);
  terminal.show();
  
  if (!number) {
    vscode.window.showInformationMessage('Deploying ...');
    let ipList = [];
    for (let i = 1; i <= 8; i++) {
      let robot = robotFormation[`robot${i}`];
      if (ipList.includes(robot.ip)) {
        vscode.window.showErrorMessage(`There are two robots with the same ip: ${robot.ip}`);
        return;
      }
      ipList.push(robot.ip);
    }
    terminal.sendText(`spqr deploy -f`);
    return;
  }
  else{
    let robot = robotFormation[`robot${number}`];
    let ip = deploySettings.network === 'Ethernet' ? '192.168.19.'+robot.ip : '10.0.19.'+robot.ip;
    let deployCommand = `spqr deploy ${deploySettings.mode} -r ${robot.number} ${ip} -c ${deploySettings.color} -v ${deploySettings.volume} -w ${deploySettings.setprofile}`;
    if (deploySettings.deleteLogs === 'true') deployCommand += ' -d';
    vscode.window.showInformationMessage(`Deploying robot ${robot.number} - ${robot.command}`);
    terminal.sendText(deployCommand);
  }
}

function SimRobot(type=null, scene=null) {
  let repositoryPath = getRepositoryPath();
  if (!repositoryPath) return;
  ensureTerminal();
  terminal.sendText(`cd ${repositoryPath} && source SPQRTools/spqr`);
  terminal.show();
  
  if (!type || !scene) {
    vscode.window.showInformationMessage('Running SimRobot');
    terminal.sendText(`spqr simrobot`);
  } 
  else {
    let scenePath = path.join(repositoryPath, `Config/Scenes/DescriptionFiles/${type}/${scene}/[${type}]${scene}.ros2`);
    vscode.window.showInformationMessage(`Running SimRobot with scene: [${type}]${scene}.ros2`);
    terminal.sendText(`spqr simrobot "${scenePath}"`);
  }
}

//* SimRobot Scenes
function registerSimRobotScenes(context) {
  sceneTypes.forEach(type => {
    scenes[type].forEach(scene => {
      const commandName = `SPQR.${type}_${scene}`;
      const command = vscode.commands.registerCommand(commandName, () => SimRobot(type, scene));
      context.subscriptions.push(command);
    });
  });
}

function getSimRobotMenu() {
  return [
    { label: 'Run', command: 'SPQR.SimRobot', icon: 'game' },
    { label: 'Fast Scenes', submenu: createSceneMenu('Fast') },
    { label: 'Normal Scenes', submenu: createSceneMenu('Normal') },
    { label: 'Percept Oracle Scenes', submenu: createSceneMenu('PerceptOracle') },
    { label: '2D Scenes', submenu: createSceneMenu('2D') },
    { label: 'Special Scenes', submenu: createSceneMenu('Special') }
  ];
}

function createSceneMenu(type) {
  return scenes[type].map(scene => ({
    label: scene,
    command: `SPQR.${type}_${scene}`,
    icon: 'arrow-small-right'
  }));
}

//* Deploy
function getDeployMenu() {
  return [
    { label: 'Deploy', command: 'SPQR.deploy', icon: 'rocket' },
    { label: `robot 1 - ${robotFormation.robot1.command}`, command: 'SPQR.deploy.robot1', icon: 'arrow-small-right' },
    { label: `robot 2 - ${robotFormation.robot2.command}`, command: 'SPQR.deploy.robot2', icon: 'arrow-small-right' },
    { label: `robot 3 - ${robotFormation.robot3.command}`, command: 'SPQR.deploy.robot3', icon: 'arrow-small-right' },
    { label: `robot 4 - ${robotFormation.robot4.command}`, command: 'SPQR.deploy.robot4', icon: 'arrow-small-right' },
    { label: `robot 5 - ${robotFormation.robot5.command}`, command: 'SPQR.deploy.robot5', icon: 'arrow-small-right' },
    { label: `robot 6 - ${robotFormation.robot6.command}`, command: 'SPQR.deploy.robot6', icon: 'arrow-small-right' },
    { label: `robot 7 - ${robotFormation.robot7.command}`, command: 'SPQR.deploy.robot7', icon: 'arrow-small-right' },
    { label: `robot 8 - ${robotFormation.robot8.command}`, command: 'SPQR.deploy.robot8', icon: 'arrow-small-right' },
  ];
}

function registerDeployCommands(context) {
  for (let i = 1; i <= 8; i++) {
    const commandName = `SPQR.deploy.robot${i}`;
    const command = vscode.commands.registerCommand(commandName, () => deploy(i));
    context.subscriptions.push(command);
  }
}

//* Tree View sidebar
class CommandProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element) {
    const treeItem = new vscode.TreeItem(element.label);

    if (element.submenu) {
      treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
      treeItem.iconPath = new vscode.ThemeIcon('folder');
    } 
    else {
      treeItem.command = {
        command: element.command,
        title: element.label,
        icon: element.icon
      };
      treeItem.iconPath = new vscode.ThemeIcon(element.icon);
    }

    return treeItem;
  }

  getChildren(element) {
    if (element && element.submenu) {
      return Promise.resolve(element.submenu);
    }

    return Promise.resolve([
      { label: 'Open Control Panel', command: 'SPQR.controlPanel', icon: 'gear' },
      { label: 'Open Wiki Panel', command:'SPQR.wikiPanel', icon: 'book'},
      { label: 'Clear Terminal', command: 'SPQR.clearTerminal', icon: 'clear-all' },
      { label: 'Compile', command: 'SPQR.compile', icon: 'tools' },
      { label: 'Deploy', submenu: getDeployMenu()},
      { label: 'SimRobot', submenu: getSimRobotMenu()}
    ]);
  }
}



function deactivate() {}

module.exports = {
  activate,
  deactivate
};