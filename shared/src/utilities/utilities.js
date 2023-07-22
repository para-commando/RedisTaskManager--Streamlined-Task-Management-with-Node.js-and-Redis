module.exports.getDynamicScriptVariablesAndConditions =
  function getDynamicScriptVariablesAndConditions({
    variableName,
    redisKeyName,
    valueToCompare,
    conditionalSymbol,
  }) {
    return {
      variable: `local ${variableName} = redis.call('HGET', key, '${redisKeyName}')\n`,
      condition: `${variableName} ${conditionalSymbol} '${valueToCompare}'`,
    };
  };
