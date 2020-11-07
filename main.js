const noble = require('@abandonware/noble');
const bleno = require('@abandonware/bleno');

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const cpsService = '1818';
const cscService = '1816';

// Characteristics
const cpsMeasurement = '2a53';  // TODO: -> 2a63
const cscMeasurement = '2A5B';

noble.on('stateChange', async (state) => {
  if (state === 'poweredOn') {
    await noble.startScanningAsync([cpsService, cscService], true);
  }
});

console.log("SEARCHING FOR DEVICES");

const cpsPeripherals = [];
const cscPeripherals = [];
const peripheralMap = {};

noble.on('discover', (peripheral) => {
  if (!peripheral.connectable) return;
  if (peripheral.advertisement == null) return;
  if (peripheral.advertisement.localName == null) return;
  if (peripheral.advertisement.localName.trim().length == 0) return;
  if (peripheralMap[peripheral.id] != null) return;
  peripheralMap[peripheral.id] = peripheral;

  if (peripheral.advertisement.serviceUuids.includes(cpsService)) {
    cpsPeripherals.push(peripheral);
  }
  if (peripheral.advertisement.serviceUuids.includes(cscService)) {
    cscPeripherals.push(peripheral);
  }

  if (cpsPeripherals.length == 1) {
    // Start answer selection
    console.log('\n\nSelect a bluetooth cycling power sensor\n\n');
    questionInterface();
  }
  console.log(`${cpsPeripherals.length}. ${peripheral.advertisement.localName}`);
});

let speed = 0;
let rpm = 0;
let speedLastUpdated = Date.now();
let rpmLastUpdated = Date.now();

function readPowerMeasurement(data) {
  let cursor = 0
  function readNext(byteLength) {
    const value = (byteLength > 0) ? data.readUIntLE(cursor, byteLength) : undefined
    cursor += byteLength
    return value;
  }

  readNext(2);  // Disregard flags
  const watts = readNext(2);
  return watts;
}

function readSpeedMeasurement(data) {
  let cursor = 0
  function readNext(byteLength) {
    const value = (byteLength > 0) ? data.readUIntLE(cursor, byteLength) : undefined
    cursor += byteLength
    return value;
  }

  readNext(1); // skip flags
  const speed = readNext(2);
  const cadence = readNext(1);
  return { watts: (speed / 256 * 2.23694) * 50, cadence };
}

let lastCrankEvent = null;
let lastCrankRevolutions = null;

function readCadenceMeasurement(data) {
  let cursor = 0
  function readNext(byteLength) {
    const value = (byteLength > 0) ? data.readUIntLE(cursor, byteLength) : undefined
    cursor += byteLength
    return value;
  }

  const flags = readNext(1); // skip flags

  const wheelRevolutionDataPresent = (flags >> 0) & 1;
  const crankRevolutionDataPresent = (flags >> 1) & 1;

  // Skip wheel revolution data
  if (wheelRevolutionDataPresent == 1) readNext(6);
  if (crankRevolutionDataPresent != 1) {
    throw new Error("Need crank revolution data to get rpm");
  }

  const crankRevolutions = readNext(2);
  const crankEventTime = readNext(2);

  let cadence = null;

  if (lastCrankRevolutions != null) {
    let revolutions = crankRevolutions - lastCrankRevolutions;
    if (revolutions < 0) revolutions += 65536;
    const timeDelta = (crankEventTime - lastCrankEvent) / 1024;
    if (timeDelta != 0) {
      cadence = revolutions / timeDelta * 60;
    }
  }

  lastCrankEvent = crankEventTime;
  lastCrankRevolutions = crankRevolutions;
  return { cadence };
}

/**
func wattsToRunningMph(watts: Double) -> Double {
    // Calculate miles per hour running speed from watts
    return max(min(2.38413 * pow(watts + 542.047, 0.284216) - 0.406862 * pow(0.997621, watts - 1506.75), 25), 0)
}
 */
const mphToMetersPerSecond = 2.237;

function wattsToMps(watts) {
  const mph = Math.max(Math.min(2.38413 * Math.pow(watts + 542.047, 0.284216) - 0.406862 * Math.pow(0.997621, watts - 1506.75), 25), 0);
  return mph / mphToMetersPerSecond;
}

function receivePowerMeasurement(data) {
  const { watts } = readPowerMeasurement(data);
  if (watts != null) {
    speed = wattsToMps(watts);
    speedLastUpdated = Date.now();
  }
}

function receiveCadenceMeasurement(data) {
  const { cadence } = readCadenceMeasurement(data);
  if (cadence != null) {
    rpm = cadence;
    rpmLastUpdated = Date.now();
  }
}

async function getCharacteristic(peripheral, service, characteristic) {
  const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync([service], [characteristic]);
  return characteristics[0];
}

async function grabPowerMeasurements(peripheral) {
  await peripheral.connectAsync();
  const measurementCharacteristic = await getCharacteristic(peripheral, cpsService, cpsMeasurement);
  measurementCharacteristic.on('data', receivePowerMeasurement);
  measurementCharacteristic.notify(true);
}

async function grabCadenceMeasurements(peripheral) {
  await peripheral.connectAsync();
  const measurementCharacteristic = await getCharacteristic(peripheral, cscService, cscMeasurement);
  measurementCharacteristic.on('data', receiveCadenceMeasurement);
  measurementCharacteristic.notify(true);
}

function questionInterface() {
  rl.question('', (answer) => {
    const index = parseInt(answer);
    if (index == null || !isFinite(index) || index < 1 || index > cpsPeripherals.length) {
      console.log('Bad input; try again\n')
      questionInterface();
      return;
    }

    // rl.close();
    noble.stopScanningAsync();
    grabPowerMeasurements(cpsPeripherals[index - 1]);

    console.log("\n\nSelect a bluetooth cadence sensor\n\n0. Skip cadence (default to 160)");
    cscPeripherals.forEach((peripheral, i) => {
      console.log(`${i + 1}. ${peripheral.advertisement.localName}`);
    });
    questionInterface2();
  });
}

let fakeRpm = false;
let logEmit = false;

function questionInterface2() {
  rl.question('', (answer) => {
    const index = parseInt(answer);
    if (index == null || !isFinite(index) || index < 0 || index > cscPeripherals.length) {
      console.log('Bad input; try again\n')
      questionInterface();
      return;
    }

    rl.close();
    noble.stopScanningAsync();
    logEmit = true;
    if (index == 0) {
      fakeRpm = true;
      rpm = 160;
    } else {
      grabCadenceMeasurements(cscPeripherals[index - 1]);
    }
  });
}

const CadentialBle = require('./cadentialBle');
const cadentialBle = new CadentialBle();

setInterval(() => {
  const now = Date.now();
  let speedAdjustment = speed;
  if (now - speedLastUpdated > 4000) {
    speedAdjustment *= 0;
  } else if (now - speedLastUpdated > 3000) {
    speedAdjustment *= .25;
  } else if (now - speedLastUpdated > 2000) {
    speedAdjustment *= .5;
  }
  let rpmAdjustment = rpm;
  if (!fakeRpm) {
    if (now - rpmLastUpdated > 4000) {
      rpmAdjustment *= 0;
    } else if (now - rpmLastUpdated > 3000) {
      rpmAdjustment *= .25;
    } else if (now - rpmLastUpdated > 2000) {
      rpmAdjustment *= .5;
    }
  }

  const data = {
    speed: speedAdjustment,
    cadence: rpmAdjustment,
  };
  if (logEmit) {
    console.log("EMIT", {
      speed: data.speed * mphToMetersPerSecond,
      cadence: data.cadence
    });
  }

  cadentialBle.notifyRSC(data);
}, 1000)
