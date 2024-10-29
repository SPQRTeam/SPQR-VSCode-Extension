## Requirements

### NPM and NodeJS

[Installation guide](https://nodejs.org/en/download/package-manager).

#### Install
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
```

#### Verify installation
```
node -v # should print `v22.11.0`
node -v # should print `v22.11.0`
```

### yo and generator-code
```
npm install -g yo generator-code
```

### vsce
```
npm install -g @vscode/vsce
```

## Deploy a new version

### Azure token
You need an Azure Access Token. 
More details in [Creating a Visual Studio Code Extension](https://www.youtube.com/watch?v=cHQo26fdx_o&t=1s).

```
vsce login SPQR # SPQR is the name of the publisher for this extension.
```
This command will ask the token.


### Publish new version
Check for errors with:
```
vsce package
```
Publish the extension with:
```
vsce publish
```
