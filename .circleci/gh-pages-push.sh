#!/bin/bash

echo -e "\nPublishing to gh-pages..."

cp -Rf dist/ $HOME/dist/
cp CNAME $HOME/CNAME

cd $HOME

git config --global user.email "circle@circleci.com"
git config --global user.name "circle-ci"

echo -e "\nCloning gh-pages..."
git clone --quiet --branch=master https://${GH_TOKEN}@github.com/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME} gh-pages > /dev/null

echo -e "\nReplacing files..."
cd gh-pages
git rm -rf .
cp -RTf ../dist/ ./
cp ../CNAME ./CNAME
git add -f .
git commit -m "Update website (circle build #${CIRCLE_BUILD_NUM})"

ls

echo -e "Publishing..."
git push -fq origin gh-pages > /dev/null

echo -e "Pushed updated files to gh-pages"
