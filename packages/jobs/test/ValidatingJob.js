const ClaimingJob = require('../jobs/ClaimingJob');
const EthProxy = require('../gateways/ethProxy');
const ModelUtils = require('../utils/model-utils');
const TestUtils = require('../utils/test-utils');
const ValidatingJob = require('../jobs/ValidatingJob');
const config = require('../config');

const Validation = ModelUtils.loadModel('validation');

TestUtils.setBeforeAndAfterHooksForJobTest();

contract('ValidatingJob', async () => {
  let mocks, validation;

  step('test model is created', async () => {
    mocks = await TestUtils.prepareMockObjects(
      'validator', 'COLLECTING_COMPLETED', 'CREATED');
    validation = mocks.validation;
  });

  step('donation is processed', async () => {
    await EthProxy.mint(mocks.project, validation.amount);
    await EthProxy.deposit(
      mocks.project.ethAddresses.owner, mocks.project, validation.amount);
  });

  step('claiming job sends transaction', async () => {
    await new ClaimingJob().execute();
  });

  step('validation should have status CLAIMING_IN_PROGRESS', done => {
    TestUtils.testStatus(
      Validation, 'CLAIMING_IN_PROGRESS', mocks.validation._id, done);
  });

  step('claiming job checks transaction', async () => {
    await new ClaimingJob().execute();
  });

  step('validation should have status CLAIMING_COMPLETED', done => {
    TestUtils.testStatus(Validation, 'CLAIMING_COMPLETED', mocks.validation._id, done);
  });

  step('validation should not be processed before approval', done => {
    new ValidatingJob().execute()
      .then(() => {
        TestUtils.testStatus(
          Validation, 'CLAIMING_COMPLETED', mocks.validation._id, done);
      });
  });

  step('validation is approved', async () => {
    // Normally this is the stage where _validatorId is set,
    // but for convenience in tests they are set on creation.
    validation.status = 'APPROVED';
    validation.save();
  });

  step('validating job sends transaction', async () => {
    await new ValidatingJob().execute();
  });

  step('validation should have status VALIDATING_IN_PROGRESS', done => {
    TestUtils.testStatus(
      Validation, 'VALIDATING_IN_PROGRESS', mocks.validation._id, done);
  });

  step('validating job checks transaction', async () => {
    await new ValidatingJob().execute();
  });

  step('validation should have status VALIDATING_COMPLETED', done => {
    TestUtils.testStatus(
      Validation, 'VALIDATING_COMPLETED', mocks.validation._id, done);
  });
});