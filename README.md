# solbond

## Setup instructions 

### 1. Install qPools SDK (optional)

#### 1.1 Install qPools SDK 

If you want to edit any of the SDK or smart contract, make sure you read and install the installation instructions for the qpools-sdk and the smart contract first. You can find these instructions in the README of the repository [here](https://github.com/chainbonds/qPools-contract).

#### 1.2 Modify the frontend-packages to use the editable qPools SDK. 

From within `solbond/dapp-nextjs`, you can run the command 

```
    yarn setup-locally-editable-sdk
```

This should (1) remove any @qpools/sdk that was pulled from the npm package repository, remove any cached modules, such as `node_modules/`, `.next/` and `yarn.lock`. 

If you do not plan to modify any of the SDK, you can skip to step 2.

### 2. Install frontend

You can simply run 

```
yarn 
```

to install all dependencies.

### 3. Run frontend

You can simply run 

```
yarn dev
```

to spin up a local development environment of the frontend 

### 4. Making it production ready

You can simply run 

```
yarn run build
```

to make sure that the code is production-ready, and would theoretically run on production. Maybe make sure to do a clean-install of all packages if there are caching issues. See the `package.json` `scripts` attribute for more information.
