import { config } from "./../../configuration/configuration.js";

/**
 * Configuration for the connection pool.
 */
export const POOL_CONFIG = {
  url: `redis://${config.redisHost}:${config.redisPort}`,
};
// --- Key naming conventions --------------------------------------------------------------------
// Redis is a key-value store. There is no schema, no table, and no query language comparable to SQL.
/**
 * Key prefix under which every department record is stored.
 */
export const DEPARTMENT_KEY_PREFIX = 'department:';
/**
 * Key prefix under which every employee record is stored.
 */
export const EMPLOYEE_KEY_PREFIX = 'employee:';
/**
 * Wildcard pattern matching every department key.
 */
export const DEPARTMENT_KEY_PATTERN = `${DEPARTMENT_KEY_PREFIX}*`;
/**
 * Wildcard pattern matching every employee key.
 */
export const EMPLOYEE_KEY_PATTERN = `${EMPLOYEE_KEY_PREFIX}*`;
// --- Lua scripts: server-side "stored procedure" equivalents ----------------------------------
/**
 * Lua script for employees transfer.
 * 
 * Redis has no procedural language comparable to a relational database's stored procedures.
 * The professionally accepted equivalent is a Lua script executed atomically on the server via 'EVAL'.
 *
 * KEYS  - the `employee:{id}` keys of every candidate employee to re-parent.
 * ARGV[1] - the source department id.
 * ARGV[2] - the target department id.
 * 
 * Every key the script touches is declared upfront in KEYS so Redis Cluster can route
 * the script to the right shard.
 *
 * For every candidate key that still exists and whose stored `departmentId` equals
 * the source department id, the script rewrites `departmentId` to the target department id.
 * The read-check-write for every candidate employee runs
 * as a single, uninterruptible step, giving the isolation guarantee.
 * 
 * The script returns the number of employees actually transferred.
 */
export const TRANSFER_EMPLOYEES_LUA = `
local sourceDepartmentId = tonumber(ARGV[1])
local targetDepartmentId = tonumber(ARGV[2])
local transferredCount = 0
for _, employeeKey in ipairs(KEYS) do
  local raw = redis.call('GET', employeeKey)
  if raw then
    local employee = cjson.decode(raw)
    if employee.departmentId == sourceDepartmentId then
      employee.departmentId = targetDepartmentId
      redis.call('SET', employeeKey, cjson.encode(employee))
      transferredCount = transferredCount + 1
    end
  end
end
return transferredCount
`;
