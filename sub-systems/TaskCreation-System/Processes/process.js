const logger = require ('../../../shared/src/configurations/logger.configurations')


module.exports.taskCreationProcesses = {
    coreProcess1: async (asd)=>{
        logger.info(`This is the function argument : ${asd}`);

        return asd
    },
}
