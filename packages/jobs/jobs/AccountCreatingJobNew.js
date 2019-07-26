const EthProxy = require('../gateways/ethProxy');
const ModelUtils = require('../utils/model-utils');
const { ModelJob } = require('./job');

const User = ModelUtils.loadModel('user');

class AccountCreatingJob extends ModelJob {
  constructor() {
    super('ACCOUNT_CREATING', User);
  }

  findReady() {
    return await User.findOne({
      ethAccount: null
    });
  }

  async run(user) {
    this.logger.info('Found user without account: ' + user._id + ' ( ' + user.email + ' )');
    const address = await EthProxy.createNewAddress();
    user.ethAccount = address;
    this.logger.info(`Created account with address: ${address}`);
    await user.save();
  }
}

module.exports = AccountCreatingJob;
