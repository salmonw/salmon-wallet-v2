const IMPLICIT_REGEX = /^[0-9a-f]{64}$/;
const EXPLICIT_REGEX =
  /^(([a-z\d]+[\-_])*[a-z\d]+\.)*([a-z\d]+[\-_])*[a-z\d]+$/;

const INVALID_ADDRESS = {
  type: 'ERROR',
  code: 'INVALID_ADDRESS',
};
const EMPTY_ACCOUNT = {
  type: 'WARNING',
  code: 'EMPTY_ACCOUNT',
};
const NO_FUNDS = {
  type: 'WARNING',
  code: 'NO_FUNDS',
};

const VALID_ACCOUNT = {
  type: 'SUCCESS',
  code: 'VALID_ACCOUNT',
};

const validateDestinationAccount = async (connection, accountId) => {
  if (!accountId || accountId.length < 2 || accountId.length > 64) {
    return INVALID_ADDRESS;
  }

  const isImplicit = IMPLICIT_REGEX.test(accountId);
  const isExplicit = EXPLICIT_REGEX.test(accountId);

  if (!isImplicit && !isExplicit) {
    return INVALID_ADDRESS;
  }

  try {
    const response = await connection.connection.provider.query({
      request_type: 'view_account',
      finality: 'final',
      account_id: accountId,
    });

    if (response?.result?.amount == 0) {
      return NO_FUNDS;
    }

    return VALID_ACCOUNT;
  } catch (e) {
    if (isImplicit && e.type === 'AccountDoesNotExist') {
      return EMPTY_ACCOUNT;
    }
    return INVALID_ADDRESS;
  }
};

module.exports = {
  validateDestinationAccount,
};
