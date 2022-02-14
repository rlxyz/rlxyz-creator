const deployRunner = require ('../js/0_deploy');
const postDeployRunner = require ('../js/1_postDeploy');
const startRunner = require ('../js/2_start');
const verifyRunner = require ('../js/3_verify');

const {
  name: deployContractName,
  deploy: deployParameters,
  postDeploy: postDeployParameters,
} = require (process.env.DEPLOY_CONFIG_PATH);

deployRunner (deployContractName, postDeployParameters)
  .then (() => process.exit (0))
  .catch (error => {
    console.error (error);
    process.exit (1);
  });
