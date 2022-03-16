echo "Erasing and rebuilding all npm packages ..."

cd ..
echo "Installing web-app ..."
cd dapp-nextjs
rm -rf node_modules/
rm package-lock.json
rm yarn.lock
yarn

echo "Success!"
