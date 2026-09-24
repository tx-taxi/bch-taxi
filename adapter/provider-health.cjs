'use strict';
// Failures from routes no longer being requested must not latch a global warning.
// A repeatedly failing active endpoint renews its timestamp on each attempt.
function providerStatus(health, failedPaths, now = Date.now()) {
 const recentFailures = [...failedPaths.values()].filter(at => now - at < 90000).length;
 return {...health, degraded: recentFailures > 0, recentFailures,
  stale: !health.lastSuccess || now - health.lastSuccess > 90000};
}
module.exports = {providerStatus};
