const path = require('path');

const findRoot = require('find-root');

const projectRoot = findRoot(__dirname);

// Obtém o path a partir da raiz do projeto
async function getPathFromRoot(pathName) {

    const fullPath = path.join(projectRoot, pathName);

    return fullPath;

}

module.exports = getPathFromRoot;