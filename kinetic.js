const indices = [
  [14, 15, 12, 16, 11, 5, 17, 3, 2, 1, 19, 13, 6, 4, 8, 9, 10, 18, 7],
  [12, 14, 8, 11, 16, 4, 7, 13, 18, 1, 3, 19, 6, 15, 9, 5, 10, 17, 2],
  [11, 5, 1, 9, 4, 18, 7, 15, 6, 2, 10, 12, 16, 3, 14, 13, 19, 17, 8],
  [13, 5, 18, 1, 3, 12, 15, 10, 14, 19, 16, 8, 6, 11, 2, 9, 4, 17]
];

const SensorHz = 32768;
const SpindownMin = 1.5;
const SpindownMinPro = 4.7;
const SpindownMax = 2.0;
const SpindownMaxPro = 6.5;
const SpindownDefault = ((SpindownMin + SpindownMax) * 0.5);

function hasProFlywheel(spindown) {
  return (spindown >= 4.7 && spindown <= 6.5);
}

function ticksToSeconds(ticks) {
  return ticks / SensorHz;
}

function speedForTicks(ticks, revs) {
  if (ticks == 0 || revs <= 0) {
    return 0;
  }
  return (20012.256849 * revs / ticks);
}

function alpha(ticks, revs, speedKPH, ticksPrevious, revsPrevious, speedKPHPrevious, proFlywheel) {
  const result = {};
  result.alpha = 0.0;
  result.coasting = false;
  if (ticks > 0 && ticksPrevious > 0) {
    const tpr = ticks / revs;
    const ptpr = ticksPrevious / revsPrevious;
    const dtpr = tpr - ptpr;
    if (dtpr > 0) {
      const deltaSpeed = speedKPHPrevious - speedKPH;
      const alpha = deltaSpeed * dtpr;
      result.alpha = alpha;
      if (alpha > 200 && !proFlywheel) {
        result.coasting = true;
      } else if (alpha > 20 && proFlywheel) {
        result.coasting = true;
      }
    }
  }
  return result;
}

function powerForSpeed(kph, spindown, alpha, revolutions) {
  const mph = kph * 0.621371;
  const rawPower = (5.244820 * mph) + (0.019168 * (mph * mph * mph));
  let dragOffset = 0;
  if (spindown > 0 && rawPower > 0) {
    const proFlywheel = hasProFlywheel(spindown);
    const spindownTimeMS = spindown * 1000.0;
    const dragOffsetSlope = proFlywheel ? -0.021 : -0.1425;
    const dragOffsetPowerSlope = proFlywheel ? 2.62 : 4.55;
    const yIntercept = proFlywheel ? 104.97 : 236.20;
    dragOffset = (dragOffsetPowerSlope * spindownTimeMS * rawPower * 0.00001) + (dragOffsetSlope * spindownTimeMS) + yIntercept;
  } else {
    dragOffset = 0;
  }
  let power = rawPower + dragOffset;
  if (power < 0) {
    power = 0;
  }
  return power;
}

const INRIDE_CAL_RESULT_UNKNOWN = 0x00;
const INRIDE_CAL_RESULT_SUCCESS = 0x01; // Calibration was successful as the spindown time fell between two ranges (normal and proflywheel)
const INRIDE_CAL_RESULT_TOO_FAST = 0x02; // Spindown was way too fast. User needs to loosen the roller.
const INRIDE_CAL_RESULT_TOO_SLOW = 0x03; // Spindown was way too slow. Uwer needs to tighten the roller.
const INRIDE_CAL_RESULT_MIDDLE = 0x04; // Spindown was ambigious (too slow for normal, too fast for a pro flywheel). Tighten if no pro flywheel and loosen if the pro flywheel is present.

function resultForSpindown(time) {
  let result = INRIDE_CAL_RESULT_UNKNOWN;
  if (time >= 1.5 && time <= 2.0) {
    result = INRIDE_CAL_RESULT_SUCCESS;
  } else if (time >= 4.7 && time <= 6.5) {
    result = INRIDE_CAL_RESULT_SUCCESS;
  } else if (time < 1.5) {
    result = INRIDE_CAL_RESULT_TOO_FAST;
  } else if (time > 6.5) {
    result = INRIDE_CAL_RESULT_TOO_SLOW;
  } else {
    result = INRIDE_CAL_RESULT_MIDDLE;
  }
  return result;
}

function processPowerData(buffer) {
  // Deobfuscate power data
  let i = 0;
  const deob = new Array(20);
  for (i = 0; i < 20; ++i) {
    deob[i] = buffer.readUInt8(i);
  }
  const posRotate = (deob[0] & 0xC0) >> 6;
  let xorIdx1 = posRotate + 1;
  xorIdx1 %= 4;
  let xorIdx2 = xorIdx1 + 1;
  xorIdx2 %= 4;

  for (i = 1; i < 20; ++i) {
    deob[i] = deob[i] ^ (indices[xorIdx1][i - 1] + indices[xorIdx2][i - 1]);
  }
  const powerBytes = new Array(20);
  powerBytes[0] = deob[0];
  for (i = 0; i < 19; ++i) {
    powerBytes[i + 1] = deob[indices[posRotate][i]];
  }

  // Start populating power data
  const powerData = {
    state: powerBytes[0] & 0x30,
    commandResult: powerBytes[0] & 0x0F,
  };

  i = 1;
  let interval = powerBytes[i++];
  interval |= powerBytes[i++] << 8;
  interval |= powerBytes[i++] << 16;

  let ticks = powerBytes[i++];
  ticks |= powerBytes[i++] << 8;
  ticks |= powerBytes[i++] << 16;
  ticks |= powerBytes[i++] << 24;

  const revs = powerBytes[i++];

  let ticksPrevious = powerBytes[i++];
  ticksPrevious |= powerBytes[i++] << 8;
  ticksPrevious |= powerBytes[i++] << 16;
  ticksPrevious |= powerBytes[i++] << 24;

  const revsPrevious = powerBytes[i++];

  let cadenceRaw = powerBytes[i++];
  cadenceRaw |= powerBytes[i++] << 8;
  powerData.cadenceRPM = cadenceRaw == 0 ? 0 : (0.8652 * cadenceRaw + 5.2617);

  let spindownTicks = powerBytes[i++];
  spindownTicks |= powerBytes[i++] << 8;
  spindownTicks |= powerBytes[i++] << 16;
  spindownTicks |= powerBytes[i++] << 24;

  powerData.lastSpindownResultTime = ticksToSeconds(spindownTicks);
  powerData.speedKPH = speedForTicks(ticks, revs);

  powerData.rollerRPM = 0.0;
  if (ticks > 0) {
    const seconds = ticksToSeconds(ticks);
    const rollerRPS = revs / seconds;
    powerData.rollerRPM = rollerRPS * 60;
  }

  const speedKPHPrev = speedForTicks(ticksPrevious, revsPrevious);
  powerData.proFlywheel = false;

  powerData.spindownTime = SpindownDefault;
  if (powerData.lastSpindownResultTime >= SpindownMin && powerData.lastSpindownResultTime <= SpindownMax) {
    powerData.spindownTime = powerData.lastSpindownResultTime;
  } else if (powerData.lastSpindownResultTime >= SpindownMinPro && powerData.lastSpindownResultTime <= SpindownMaxPro) {
    powerData.spindownTime = powerData.lastSpindownResultTime;
    powerData.proFlywheel = true;
  }

  if (!powerData.proFlywheel) {
    powerData.rollerResistance = 1 - ((powerData.spindownTime - SpindownMin) / (SpindownMax - SpindownMin));
  } else {
    powerData.rollerResistance = 1 - ((powerData.spindownTime - SpindownMinPro) / (SpindownMaxPro - SpindownMinPro));
  }

  const ac = alpha(ticks, revs, powerData.speedKPH, ticksPrevious, revsPrevious, speedKPHPrev, powerData.proFlywheel);
  powerData.coasting = ac.coasting;

  if (powerData.coasting) {
    powerData.power = 0;
  } else {
    powerData.power = powerForSpeed(powerData.speedKPH, powerData.spindownTime, ac.alpha, revs);
  }

  powerData.calibrationResult = resultForSpindown(powerData.lastSpindownResultTime);

  return powerData;
}

// const { testData } = require('./kineticData');
// testData.forEach(buffer => console.log(processPowerData(buffer)));

module.exports = { processPowerData };
